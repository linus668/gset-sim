// vitest.setup.js
import { beforeAll, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// 1. Extend Vitest's expect with jest-dom matchers for better assertions on DOM elements in our React component tests
expect.extend(matchers);

// 2. Add width and height to all HTML elements in the test environment, to prevent Recharts from throwing warnings about zero dimensions (which it relies on for rendering the chart correctly). This is a common issue when testing Recharts components in a non-browser environment, and this setup ensures that our component tests can run without errors related to layout calculations.
beforeAll(() => {
    // Only apply DOM-related mocks if we're in a browser-like environment (e.g. happy-dom). If we're running in a pure Node environment, we can skip this setup since there won't be any DOM elements to measure. If there is no window object, it means we're not in a browser environment, so we return early to avoid errors.
    if (typeof window === 'undefined') return;

    HTMLElement.prototype.getBoundingClientRect = function () {
        return {
            width: 1000,
            height: 500,
            top: 0,
            left: 0,
            right: 1000,
            bottom: 500,
            x: 0,
            y: 0,
        };
    };

    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});