import React, { useRef, useEffect, useState } from 'react';

function TickRow({ tick, isSelected, onClick }) {
  const prevRef = useRef(tick.price);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (tick.price !== prevRef.current) {
      const cls = tick.price > prevRef.current ? 'flash-green' : 'flash-red';
      setFlashClass(cls);
      prevRef.current = tick.price;
      const t = setTimeout(() => setFlashClass(''), 400);
      return () => clearTimeout(t);
    }
  }, [tick.price]);

  const dirClass = tick.dir === 'up' ? 'up' : tick.dir === 'down' ? 'down' : 'flat';
  const arrow = tick.dir === 'up' ? '▲' : tick.dir === 'down' ? '▼' : '─';

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors ${flashClass} ${isSelected ? 'bg-[rgba(0,212,255,0.07)]' : 'hover:bg-[rgba(255,255,255,0.02)]'}`}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <td className="px-3 py-2">
        <div className="mono text-[11px] font-medium" style={{ color: 'var(--accent)' }}>{tick.symbol}</div>
        <div className="text-[9px]" style={{ color: 'var(--muted)' }}>{tick.name}</div>
      </td>
      <td className={`px-3 py-2 mono text-right text-[12px] font-medium ${dirClass}`}>
        {tick.price?.toFixed(3)}
      </td>
      <td className="px-2 py-2 mono text-right text-[11px]" style={{ color: 'var(--text)' }}>
        {tick.bid?.toFixed(3)}
      </td>
      <td className="px-2 py-2 mono text-right text-[11px]" style={{ color: 'var(--text)' }}>
        {tick.ask?.toFixed(3)}
      </td>
      <td className={`px-2 py-2 mono text-right text-[11px] ${dirClass}`}>
        <span className="mr-1">{arrow}</span>
        {tick.change >= 0 ? '+' : ''}{(tick.change * 100).toFixed(3)}%
      </td>
      <td className="px-3 py-2 mono text-right text-[10px]" style={{ color: 'var(--muted)' }}>
        {tick.volume?.toLocaleString()}
      </td>
    </tr>
  );
}

export default function TickerGrid({ ticks, selected, onSelect }) {
  const tickList = Object.values(ticks);

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="dot" />
        Market Data — HKEX
        <span className="ml-auto mono" style={{ color: 'var(--accent)', fontSize: '9px' }}>
          {tickList.length} instruments
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 10 }}>
              {['Symbol', 'Last', 'Bid', 'Ask', 'Chg%', 'Vol'].map(h => (
                <th key={h} className="px-3 py-2 text-left mono" style={{ color: 'var(--muted)', fontSize: '9px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickList.map(tick => (
              <TickRow
                key={tick.symbol}
                tick={tick}
                isSelected={selected === tick.symbol}
                onClick={() => onSelect(tick.symbol)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
