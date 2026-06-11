import { tickPrice, generateOrder, INSTRUMENTS, state } from './server.js';

describe('GSET-SIM Trading System Core Algorithm Suite', () => {

  // ─── Test 1: Geometric Brownian Motion Price Update ───
  test('tickPrice() should correctly update the mid price and derive valid Bid/Ask spreads', () => {
    const symbol = '700.HK'; // Tencent
    const oldPrice = state[symbol].price;

    // Execute the pricing algorithm
    const tick = tickPrice(symbol);

    // Assertions (Validating correctness)
    expect(tick.type).toBe('TICK');
    expect(tick.symbol).toBe(symbol);
    expect(tick.price).toBeGreaterThan(0);          // Price must never drop below or equal to zero
    expect(tick.bid).toBeLessThan(tick.price);       // Bid price must always be below the mid price
    expect(tick.ask).toBeGreaterThan(tick.price);    // Ask price must always be above the mid price
    expect(tick.spread).toBeCloseTo(+(tick.ask - tick.bid).toFixed(3));
  });

  // ─── Test 2: Randomized Order Generation Logic ───
  test('generateOrder() should generate pseudo-random orders matching quant execution specs', () => {
    // Execute the order simulator
    const order = generateOrder();

    // Assertions (Validating schema and state consistency)
    expect(order.type).toBe('ORDER');
    expect(order.orderId).toMatch(/^GS-\d+$/);       // Verifies the ID follows the format 'GS-1000xx'
    
    // Conditional state validation
    if (order.status === 'FILLED') {
      expect(order.filledQty).toBe(order.qty);
      expect(order.fillPx).not.toBeNull();
    } else if (order.status === 'REJECTED') {
      expect(order.filledQty).toBe(0);
      expect(order.fillPx).toBeNull();
    }

    // Performance latency benchmarking verification
    expect(order.latencyUs).toBeGreaterThanOrEqual(80);
    expect(order.latencyUs).toBeLessThanOrEqual(2480);
  });
});