import React, { useState, useEffect, useRef } from 'react';

export default function StatusBar({ connected, msgCount }) {
  const [rate, setRate] = useState(0);
  const prevCount = useRef(msgCount);
  const prevTime  = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - prevTime.current) / 1000;
      const delta = msgCount - prevCount.current;
      setRate(Math.round(delta / dt));
      prevCount.current = msgCount;
      prevTime.current  = now;
    }, 1000);
    return () => clearInterval(interval);
  }, [msgCount]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-HK', { hour12: false, fractionalSecondDigits: 3 });

  return (
    <div style={{
      height: '28px',
      background: '#080c10',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: '24px',
      fontSize: '9px',
      fontFamily: 'Fira Code, monospace',
      color: 'var(--muted)',
      letterSpacing: '0.06em',
    }}>
      {/* Connection */}
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: connected ? '#00ff88' : '#ff3d5a',
          boxShadow: connected ? '0 0 5px #00ff88' : '0 0 5px #ff3d5a',
        }} />
        <span style={{ color: connected ? '#00ff88' : '#ff3d5a' }}>
          {connected ? 'SSE CONNECTED' : 'DISCONNECTED'}
        </span>
      </span>

      <span>KAFKA-SIM · localhost:3001</span>
      <span>TOPIC: market.ticks · market.orders</span>
      <span style={{ color: 'var(--amber)' }}>RATE: {rate} msg/s</span>
      <span>TOTAL: {msgCount.toLocaleString()} msgs</span>
      <span>HKEX · HKD</span>

      {/* Clock */}
      <span style={{ marginLeft: 'auto', color: 'var(--bright)' }}>{timeStr} HKT</span>
    </div>
  );
}
