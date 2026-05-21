import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_INSTRUMENTS = [
  { symbol: '700.HK',  name: 'Tencent',   price: 385.20, bid: 385.15, ask: 385.25, change: 0, volume: 0 },
  { symbol: '9988.HK', name: 'Alibaba',   price: 72.45,  bid: 72.42,  ask: 72.48,  change: 0, volume: 0 },
  { symbol: '1211.HK', name: 'BYD',       price: 248.80, bid: 248.76, ask: 248.84, change: 0, volume: 0 },
  { symbol: '0005.HK', name: 'HSBC',      price: 68.15,  bid: 68.13,  ask: 68.17,  change: 0, volume: 0 },
  { symbol: '2318.HK', name: 'Ping An',   price: 45.30,  bid: 45.28,  ask: 45.32,  change: 0, volume: 0 },
  { symbol: '9618.HK', name: 'JD.com',    price: 133.70, bid: 133.67, ask: 133.73, change: 0, volume: 0 },
  { symbol: '3690.HK', name: 'Meituan',   price: 156.40, bid: 156.37, ask: 156.43, change: 0, volume: 0 },
  { symbol: '1024.HK', name: 'Kuaishou',  price: 43.80,  bid: 43.78,  ask: 43.82,  change: 0, volume: 0 },
];

export function useMarketFeed() {
  const [ticks, setTicks]   = useState(() =>
    Object.fromEntries(INITIAL_INSTRUMENTS.map(i => [i.symbol, { ...i, dir: 'flat' }]))
  );
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);
  const [msgCount, setMsgCount]   = useState(0);
  const esRef = useRef(null);
  const prevPrices = useRef({});

  useEffect(() => {
    const es = new EventSource('/stream');
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMsgCount(c => c + 1);

      if (data.type === 'TICK') {
        setTicks(prev => {
          const old = prev[data.symbol];
          const dir = !old ? 'flat'
            : data.price > old.price ? 'up'
            : data.price < old.price ? 'down'
            : 'flat';

          return {
            ...prev,
            [data.symbol]: { ...data, dir, flashKey: Date.now() },
          };
        });
        prevPrices.current[data.symbol] = data.price;
      }

      if (data.type === 'ORDER') {
        setOrders(prev => [data, ...prev].slice(0, 200));
      }
    };

    return () => es.close();
  }, []);

  return { ticks, orders, connected, msgCount };
}
