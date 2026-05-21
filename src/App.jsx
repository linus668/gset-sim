import React, { useState, useEffect } from 'react';
import { useMarketFeed } from './hooks/useMarketFeed';
import TickerGrid from './components/TickerGrid';
import PriceChart from './components/PriceChart';
import OrderBlotter from './components/OrderBlotter';
import StatusBar from './components/StatusBar';

export default function App() {
  const { ticks, orders, connected, msgCount } = useMarketFeed();
  const [selected, setSelected] = useState('700.HK');
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        gap: '16px',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px',
            background: 'var(--accent)',
            borderRadius: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 800, color: '#080c10',
            fontFamily: 'DM Sans, sans-serif',
          }}>GS</div>
          <span style={{ fontFamily: 'Fira Code', fontSize: '11px', fontWeight: 600, color: 'var(--bright)', letterSpacing: '0.1em' }}>
            GSET-SIM
          </span>
          <span style={{ fontFamily: 'Fira Code', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
            · ELECTRONIC TRADING SIMULATOR
          </span>
        </div>

        <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

        {/* Nav pills */}
        {['Market Data', 'Order Book', 'Risk Monitor'].map((label, i) => (
          <button key={label} style={{
            fontFamily: 'DM Sans', fontSize: '11px', fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? 'var(--accent)' : 'var(--muted)',
            background: i === 0 ? 'rgba(0,212,255,0.08)' : 'transparent',
            border: i === 0 ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
            padding: '2px 10px', borderRadius: '3px', cursor: 'pointer',
          }}>{label}</button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'Fira Code', fontSize: '10px', color: 'var(--muted)' }}>
            HKEX PROD
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: 'Fira Code', fontSize: '10px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#00ff88' : '#ff3d5a', boxShadow: connected ? '0 0 5px #00ff88' : 'none' }} />
            <span style={{ color: connected ? '#00ff88' : '#ff3d5a' }}>{connected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', gridTemplateRows: '1fr 220px', gap: '6px', padding: '6px', minHeight: 0 }}>

        {/* Left: ticker grid – spans both rows */}
        <div style={{ gridRow: '1 / 3' }}>
          <TickerGrid ticks={ticks} selected={selected} onSelect={setSelected} />
        </div>

        {/* Top-right: price chart */}
        <div style={{ gridRow: 1, gridColumn: 2 }}>
          <PriceChart ticks={ticks} symbol={selected} />
        </div>

        {/* Bottom-right: order blotter */}
        <div style={{ gridRow: 2, gridColumn: 2 }}>
          <OrderBlotter orders={orders} />
        </div>
      </div>

      {/* ── Status bar ── */}
      <StatusBar connected={connected} msgCount={msgCount} />
    </div>
  );
}
