import React, { useRef, useEffect, useState } from 'react';

const STATUS_COLORS = {
  FILLED:   { color: '#00ff88', bg: 'rgba(0,255,136,0.1)'  },
  PARTIAL:  { color: '#ffb700', bg: 'rgba(255,183,0,0.1)'  },
  REJECTED: { color: '#ff3d5a', bg: 'rgba(255,61,90,0.1)'  },
};

const SIDE_COLORS = {
  BUY:  '#00d4ff',
  SELL: '#ff3d5a',
};

function OrderRow({ order }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  const sc = STATUS_COLORS[order.status] || {};
  const ts = new Date(order.ts).toLocaleTimeString('en-HK', { hour12: false, fractionalSecondDigits: 3 });

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }}
    >
      <td className="px-2 py-1 mono" style={{ color: 'var(--muted)', fontSize: '9px' }}>{ts}</td>
      <td className="px-2 py-1 mono" style={{ color: 'var(--muted)', fontSize: '9px' }}>{order.orderId}</td>
      <td className="px-2 py-1 mono" style={{ color: 'var(--accent)', fontSize: '10px' }}>{order.symbol}</td>
      <td className="px-2 py-1 mono" style={{ color: SIDE_COLORS[order.side], fontSize: '10px', fontWeight: 600 }}>{order.side}</td>
      <td className="px-2 py-1 mono text-right" style={{ color: 'var(--text)', fontSize: '9px' }}>{order.orderType}</td>
      <td className="px-2 py-1 mono text-right" style={{ color: 'var(--text)', fontSize: '10px' }}>{order.qty?.toLocaleString()}</td>
      <td className="px-2 py-1 mono text-right" style={{ color: 'var(--bright)', fontSize: '10px' }}>
        {order.fillPx?.toFixed(3) ?? '─'}
      </td>
      <td className="px-2 py-1 mono text-right" style={{ color: 'var(--muted)', fontSize: '9px' }}>{order.venue}</td>
      <td className="px-2 py-1 mono text-right" style={{ color: 'var(--amber)', fontSize: '9px' }}>{order.latencyUs}μs</td>
      <td className="px-2 py-1">
        <span className="mono" style={{
          fontSize: '8px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: sc.color,
          background: sc.bg,
          padding: '1px 5px',
          borderRadius: '2px',
        }}>
          {order.status}
        </span>
      </td>
    </tr>
  );
}

export default function OrderBlotter({ orders }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [orders.length]);

  const stats = {
    filled:   orders.filter(o => o.status === 'FILLED').length,
    partial:  orders.filter(o => o.status === 'PARTIAL').length,
    rejected: orders.filter(o => o.status === 'REJECTED').length,
    avgLat:   orders.length ? Math.round(orders.reduce((a, o) => a + (o.latencyUs || 0), 0) / orders.length) : 0,
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="dot" />
        Order Execution Blotter
        <div className="ml-auto flex gap-3 mono" style={{ fontSize: '9px' }}>
          <span><span style={{ color: 'var(--muted)' }}>FILL </span><span style={{ color: '#00ff88' }}>{stats.filled}</span></span>
          <span><span style={{ color: 'var(--muted)' }}>PART </span><span style={{ color: '#ffb700' }}>{stats.partial}</span></span>
          <span><span style={{ color: 'var(--muted)' }}>REJ </span><span style={{ color: '#ff3d5a' }}>{stats.rejected}</span></span>
          <span><span style={{ color: 'var(--muted)' }}>AVG LAT </span><span style={{ color: 'var(--amber)' }}>{stats.avgLat}μs</span></span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 10 }}>
              {['Time', 'Order ID', 'Symbol', 'Side', 'Type', 'Qty', 'Fill Px', 'Venue', 'Lat', 'Status'].map(h => (
                <th key={h} className="px-2 py-2 text-left mono" style={{ color: 'var(--muted)', fontSize: '8px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <OrderRow key={`${order.orderId}-${order.ts}`} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
