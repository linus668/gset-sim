/**
 * GSET-SIM Backend — Kafka Broker Simulator
 * Streams live tick data and order execution logs via:
 *   - SSE  → GET /stream/ticks   (price feed, 50ms cadence)
 *   - SSE  → GET /stream/orders  (order blotter, randomised fills)
 *   - WS   → ws://localhost:3001  (unified firehose, optional)
 */

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
app.use(cors());

// ─── Instrument universe ────────────────────────────────────────────────────
const INSTRUMENTS = [
  { symbol: '700.HK',  name: 'Tencent',    price: 385.20, vol: 0.018 },
  { symbol: '9988.HK', name: 'Alibaba',    price: 72.45,  vol: 0.022 },
  { symbol: '1211.HK', name: 'BYD',        price: 248.80, vol: 0.020 },
  { symbol: '0005.HK', name: 'HSBC',       price: 68.15,  vol: 0.012 },
  { symbol: '2318.HK', name: 'Ping An',    price: 45.30,  vol: 0.016 },
  { symbol: '9618.HK', name: 'JD.com',     price: 133.70, vol: 0.025 },
  { symbol: '3690.HK', name: 'Meituan',    price: 156.40, vol: 0.023 },
  { symbol: '1024.HK', name: 'Kuaishou',   price: 43.80,  vol: 0.030 },
];

// Mutable state
const state = Object.fromEntries( //This method creates an object from an array of key-value pairs. Each pair is an array where the first element is the key and the second is the value.
  INSTRUMENTS.map(inst => [inst.symbol, { ...inst, bid: inst.price - 0.05, ask: inst.price + 0.05 }])
);

// ─── Price simulation (Geometric Brownian Motion step) ──────────────────────
// This function updates the price of a single instrument using a small drift
// plus a random shock based on the instrument's volatility. It then derives
// the bid/ask values from the new mid price and returns a tick payload.
function tickPrice(symbol) {
  const s = state[symbol];
  const drift = 0.000002;
  const shock = s.vol * (Math.random() - 0.5) * 0.12;
  s.price = Math.max(0.01, s.price * (1 + drift + shock));
  const spread = s.price * 0.0003 + 0.01;
  s.bid = +(s.price - spread / 2).toFixed(3);
  s.ask = +(s.price + spread / 2).toFixed(3);
  s.price = +s.price.toFixed(3);

  return {
    type: 'TICK',
    symbol: s.symbol,
    name: s.name,
    price: s.price,
    bid: s.bid,
    ask: s.ask,
    spread: +(s.ask - s.bid).toFixed(3),
    volume: Math.floor(Math.random() * 50000 + 1000),
    change: +(shock * 100).toFixed(4),
    ts: Date.now(),
  };
}

// ─── Order simulation ────────────────────────────────────────────────────────
// The simulator builds a pseudo-random order event with a random symbol, side,
// order type, quantity, and venue. It also generates a fill price, status, and
// latency to mimic realistic order flow for the order blotter stream.
const ORDER_SIDES = ['BUY', 'SELL'];
const ORDER_TYPES = ['MKT', 'LMT', 'IOC', 'FOK'];
const VENUES     = ['HKEX', 'DARK', 'ATS1', 'BATS'];
let orderId = 100000;

function generateOrder() {
  const inst  = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
  const s     = state[inst.symbol];
  const side  = ORDER_SIDES[Math.floor(Math.random() * 2)];
  const type  = ORDER_TYPES[Math.floor(Math.random() * 4)];
  const qty   = Math.floor(Math.random() * 9900 + 100);
  const slippage = (Math.random() - 0.5) * 0.04;
  const fillPx = +(side === 'BUY' ? s.ask + slippage : s.bid - slippage).toFixed(3);
  const status = Math.random() > 0.08
    ? (Math.random() > 0.12 ? 'FILLED' : 'PARTIAL')
    : 'REJECTED';

  return {
    type: 'ORDER',
    orderId: `GS-${++orderId}`,
    symbol: inst.symbol,
    side,
    orderType: type,
    qty,
    filledQty: status === 'FILLED' ? qty : status === 'PARTIAL' ? Math.floor(qty * Math.random()) : 0,
    limitPx: type !== 'MKT' ? +(side === 'BUY' ? s.ask * 1.001 : s.bid * 0.999).toFixed(3) : null,
    fillPx: status !== 'REJECTED' ? fillPx : null,
    venue: VENUES[Math.floor(Math.random() * 4)],
    status,
    latencyUs: Math.floor(Math.random() * 2400 + 80),
    ts: Date.now(),
  };
}

// ─── SSE helpers ─────────────────────────────────────────────────────────────
function sseHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

function send(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── SSE: unified tick + order stream ────────────────────────────────────────
const sseClients = new Set();

app.get('/stream', (req, res) => {
  sseHeaders(res);
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// ─── SSE: tick-only stream ────────────────────────────────────────────────────
const tickClients = new Set();
app.get('/stream/ticks', (req, res) => {
  sseHeaders(res);
  tickClients.add(res);
  req.on('close', () => tickClients.delete(res));
});

// ─── SSE: order-only stream ───────────────────────────────────────────────────
const orderClients = new Set();
app.get('/stream/orders', (req, res) => {
  sseHeaders(res);
  orderClients.add(res);
  req.on('close', () => orderClients.delete(res));
});

// ─── REST: snapshot of all current prices ────────────────────────────────────
app.get('/snapshot', (_req, res) => {
  res.json(Object.values(state));
});

// ─── HTTP server + WebSocket ──────────────────────────────────────────────────
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('[WS] client connected');
  ws.on('close', () => console.log('[WS] client disconnected'));
});

function broadcast(data) {
  const payload = JSON.stringify(data);
  // SSE unified
  for (const res of sseClients) res.write(`data: ${payload}\n\n`);
  // WS
  for (const ws of wss.clients) {
    if (ws.readyState === 1) ws.send(payload);
  }
}

// ─── Tick loop: 50ms cadence, round-robins through all instruments ──────────
let tickIdx = 0;
setInterval(() => {
  const symbol = INSTRUMENTS[tickIdx % INSTRUMENTS.length].symbol;
  tickIdx++;
  const tick = tickPrice(symbol);
  const payload = JSON.stringify(tick);
  // tick stream
  for (const res of tickClients) res.write(`data: ${payload}\n\n`);
  broadcast(tick);
}, 50);

// ─── Order loop: randomised 80–400ms cadence ─────────────────────────────────
function scheduleOrder() {
  const delay = Math.floor(Math.random() * 320 + 80);
  setTimeout(() => {
    const order = generateOrder();
    const payload = JSON.stringify(order);
    for (const res of orderClients) res.write(`data: ${payload}\n\n`);
    broadcast(order);
    scheduleOrder();
  }, delay);
}
scheduleOrder();

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`\n🟢 GSET-SIM Kafka Broker running on http://localhost:${PORT}`);
  console.log(`   SSE  /stream        → unified feed`);
  console.log(`   SSE  /stream/ticks  → tick data only`);
  console.log(`   SSE  /stream/orders → order blotter only`);
  console.log(`   WS   /ws            → WebSocket firehose`);
  console.log(`   GET  /snapshot      → current prices\n`);
});

// 在 server.js 最下方加上這行，方便 Jest 測試
export { tickPrice, generateOrder, INSTRUMENTS, state };