import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MAX_POINTS = 120;

export default function PriceChart({ ticks, symbol }) {
  const [history, setHistory] = useState({});
  const prevSymbol = useRef(symbol);

  useEffect(() => {
    const tick = ticks[symbol];
    if (!tick) return;

    setHistory(prev => {
      const existing = prev[symbol] || [];
      const point = {
        t: new Date(tick.ts).toLocaleTimeString('en-HK', { hour12: false }),
        price: tick.price,
        bid: tick.bid,
        ask: tick.ask,
      };
      return {
        ...prev,
        [symbol]: [...existing, point].slice(-MAX_POINTS),
      };
    });
  }, [ticks, symbol]);

  const data = history[symbol] || [];
  const tick = ticks[symbol];
  if (!tick) return null;

  const prices = data.map(d => d.price);
  const min = prices.length ? Math.min(...prices) * 0.9998 : tick.price * 0.99;
  const max = prices.length ? Math.max(...prices) * 1.0002 : tick.price * 1.01;
  const isUp = data.length > 1 && data[data.length - 1].price >= data[0].price;

  const color = isUp ? '#00ff88' : '#ff3d5a';

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#0d1117', border: '1px solid var(--border)', padding: '6px 10px', fontSize: '10px', fontFamily: 'Fira Code, monospace' }}>
        <div style={{ color: 'var(--text)' }}>{payload[0]?.payload.t}</div>
        <div style={{ color }}>{payload[0]?.value?.toFixed(3)}</div>
      </div>
    );
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="dot" />
        <span style={{ color: 'var(--accent)' }}>{symbol}</span>
        <span style={{ color: 'var(--muted)', marginLeft: '4px' }}>{tick.name}</span>
        <span className="ml-auto mono" style={{ color, fontSize: '11px', fontWeight: 600 }}>
          {tick.price?.toFixed(3)}
        </span>
      </div>

      <div style={{ padding: '8px 4px 4px' }}>
        <div className="flex gap-6 px-3 pb-2" style={{ fontSize: '10px', fontFamily: 'Fira Code, monospace' }}>
          <span><span style={{ color: 'var(--muted)' }}>BID </span><span style={{ color: 'var(--text)' }}>{tick.bid?.toFixed(3)}</span></span>
          <span><span style={{ color: 'var(--muted)' }}>ASK </span><span style={{ color: 'var(--text)' }}>{tick.ask?.toFixed(3)}</span></span>
          <span><span style={{ color: 'var(--muted)' }}>SPD </span><span style={{ color: 'var(--amber)' }}>{tick.spread?.toFixed(3)}</span></span>
          <span><span style={{ color: 'var(--muted)' }}>VOL </span><span style={{ color: 'var(--text)' }}>{tick.volume?.toLocaleString()}</span></span>
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tick={{ fill: '#3d5068', fontSize: 9, fontFamily: 'Fira Code' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[min, max]}
              tick={{ fill: '#3d5068', fontSize: 9, fontFamily: 'Fira Code' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => v.toFixed(2)}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${symbol})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
