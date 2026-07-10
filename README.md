# GSET-SIM — Goldman Sachs Electronic Trading Simulator

A low-latency trading desktop built with **React + Vite + Tailwind CSS**, backed by a **Node.js Kafka broker simulator** streaming live HKEX tick data and order executions via Server-Sent Events (SSE) and WebSockets.

---

## Business Analysis & System Workflow Overview (BA Perspective)

While this project showcases high-performance technical execution, it was fully engineered through a structured **Business Analyst lens**—translating institutional electronic trading operations, HKEX market rules, and order lifecycles into strict functional specifications.

### 1. Core Workflow & Order Lifecycle Mapping
The simulator maps out complex transaction workflows and state transitions based on industry-standard execution logic. Below is the functional state machine defined for order execution:

```
┌────────────────────────────────────────────────────────┐
│                      New Order                         │
└──────────────────────────┬─────────────────────────────┘
                           │
                 ┌─────────▼─────────┐
                 │  Order Validation │
                 └─────────┬─────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │ (Pass)          │ (Fail)          │ (Partial Match)
 ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
 │    FILLED     │ │   REJECTED    │ │    PARTIAL    │
 │    (80%)      │ │     (8%)      │ │    (12%)      │
 └───────────────┘ └───────────────┘ └───────▼───────┘
                                             │
                                     ┌───────▼───────┐
                                     │   REMAINDER   │
                                     │   CANCELED    │
                                     └───────────────┘
```

### 2. Functional Specification & Requirement Elicitation (FSD)
*   **Business Rules Realization:** Translated HKEX board lot and tick size rules into mathematical code blocks, engineering a simulated Geometric Brownian Motion price engine with tailored volatility (ranging from 1.2% to 3.0%) across 8 major instruments (e.g., 700.HK, 9988.HK).
*   **Edge-Case Exception Handling:** Defined strict system boundaries for order exceptions, simulating market connectivity drops, execution slippage (±0.04 per side), and latency exceptions (80–2480μs) to test client-side interface resiliency.

### 3. User Acceptance Testing (UAT) & Verification Strategy
*   **Defect & Performance Governance:** Acted as the QA Lead to run comprehensive verification loops on UI rendering boundaries. Implemented low-latency frontend patterns to eliminate "jank" and rendering blocks, capping order logs at 200 rows to safeguard browser runtime stability under high-volume streaming data.
*   **Data Validation:** Formulated test cases to verify data schema accuracy across multiple unified transport channels (SSE /stream endpoints vs. raw WebSocket firehose), ensuring raw payload parameters perfectly aligned with expected functional outputs.
---

## Architecture

```
┌─────────────────────────────────────┐
│         server.js (Node.js)         │
│  "Kafka Broker Simulator"           │
│                                     │
│  Topics:                            │
│    market.ticks  → 50ms cadence     │
│    market.orders → 80–400ms random  │
│                                     │
│  Transports:                        │
│    SSE  /stream        (unified)    │
│    SSE  /stream/ticks               │
│    SSE  /stream/orders              │
│    WS   /ws            (firehose)   │
│    GET  /snapshot      (REST)       │
└───────────────┬─────────────────────┘
                │ Vite proxy
┌───────────────▼─────────────────────┐
│         React Frontend              │
│                                     │
│  ┌──────────────┐  ┌─────────────┐  │
│  │ TickerGrid   │  │ PriceChart  │  │
│  │ 8 HK stocks  │  │ (recharts)  │  │
│  └──────────────┘  └─────────────┘  │
│  ┌──────────────────────────────┐   │
│  │     OrderBlotter             │   │
│  │   FILLED / PARTIAL / REJECTED│   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Terminal 1: Start the Kafka broker simulator
npm run server

# Terminal 2: Start the Vite dev server
npm run dev

# Or run both concurrently:
npm run start
```

Open **http://localhost:5173**

---

## Instruments (HKEX)

| Symbol  | Name     | Simulated Vol |
|---------|----------|---------------|
| 700.HK  | Tencent  | 1.8%          |
| 9988.HK | Alibaba  | 2.2%          |
| 1211.HK | BYD      | 2.0%          |
| 0005.HK | HSBC     | 1.2%          |
| 2318.HK | Ping An  | 1.6%          |
| 9618.HK | JD.com   | 2.5%          |
| 3690.HK | Meituan  | 2.3%          |
| 1024.HK | Kuaishou | 3.0%          |

---

## Price Model

Prices follow **Geometric Brownian Motion**:

```
S(t+dt) = S(t) * exp((μ - σ²/2)dt + σ * ε * √dt)
```

- `μ` = 0.000002 (drift per tick)  
- `σ` = per-instrument volatility  
- `ε` ~ Uniform(−0.5, 0.5)  
- Bid/ask spread computed from price × 0.03% + 0.01

---

## Order Simulation

- Order types: **MKT, LMT, IOC, FOK**
- Venues: **HKEX, DARK, ATS1, BATS**
- Statuses: FILLED (80%), PARTIAL (12%), REJECTED (8%)
- Simulated fill slippage: ±0.04 per side
- Execution latency: 80–2480μs (simulated)

---

## Key Components

| File | Purpose |
|------|---------|
| `server.js` | Kafka broker simulator, SSE + WebSocket |
| `src/hooks/useMarketFeed.js` | SSE consumer, state management |
| `src/components/TickerGrid.jsx` | Real-time market data table with flash animations |
| `src/components/PriceChart.jsx` | Streaming area chart (recharts) |
| `src/components/OrderBlotter.jsx` | Live order execution log |
| `src/components/StatusBar.jsx` | Connection status + message rate |

---

## Interview Notes

**Why SSE over WebSocket for the tick feed?**  
SSE is unidirectional (server→client), which is sufficient for a market data feed and avoids the handshake overhead of WS for pure broadcast scenarios. WebSocket is used on the `/ws` endpoint for the bidirectional use case (e.g. order submission).

**Why 50ms tick cadence?**  
HKEX real-time feed publishes at ~500ms; 50ms simulates a direct market data feed (level-1) as seen in co-located infrastructure. At 8 instruments round-robin, each instrument ticks every 400ms.

**Low-latency frontend patterns used:**  
- `isAnimationActive={false}` on recharts to skip JS animation frames  
- Row-level flash via CSS keyframes (no JS timers in the render path)  
- `useRef` for previous price tracking (avoids state re-renders)  
- Capped order history at 200 rows with `.slice(-200)`  
"# gset-sim" 
