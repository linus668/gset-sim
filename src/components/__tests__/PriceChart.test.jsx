// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeAll } from 'vitest';
import React from 'react';
import PriceChart from '../PriceChart';

describe('<PriceChart /> UI Component Verification', () => {
  test('should render chart headers, metadata, and dynamic styling correctly based on ticks', () => {
    // Arrange: Prepare mock high-frequency tick data
    const ticks = {
      '700.HK': {
        symbol: '700.HK',
        name: 'Tencent',
        price: 385.20,
        bid: 385.15,
        ask: 385.25,
        spread: 0.10,
        volume: 1500000,
        ts: Date.now(),
      },
    };

    // Act: Render the React component with JSX syntax
    render(<PriceChart ticks={ticks} symbol="700.HK" />);

    // Assert 1: Check if the financial product metadata is visible
    expect(screen.getByText('700.HK')).toBeInTheDocument();
    expect(screen.getByText('Tencent')).toBeInTheDocument();

    // Assert 2: Check if the floating price matches your .toFixed(3) rule
    expect(screen.getByText('385.200')).toBeInTheDocument();

    // Assert 3: Verify style updates (BID/ASK/SPD) are correctly displayed
    expect(screen.getByText('385.150')).toBeInTheDocument(); 
    expect(screen.getByText('385.250')).toBeInTheDocument(); 

    // Assert 4: Verify dynamic color styling based on price movement
    expect(screen.getByText('385.200')).toHaveStyle({ color: '#ff3d5a' }); // Since it's the first point, it should be considered "down" (red) by our logic
  });
});