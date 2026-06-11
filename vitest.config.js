// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Node environment is faster for pure logic tests, but we need happy-dom for testing React components that use browser APIs. So we use environmentMatchGlobs to apply happy-dom only to tests under src/components.
    environment: 'node', 

    // Setup file for global configuration.
    setupFiles: ['./vitest.setup.js'],
    
    // For test files under src/components, use happy-dom to provide a browser-like environment for testing React components that rely on DOM APIs. This allows us to run component tests without needing a full browser environment, while keeping logic tests fast in the default node environment.
    environmentMatchGlobs: [
      ['**/components/**', 'happy-dom'], // Separating backend and frontend tests so that we can run them independently if needed (e.g. vitest src/components for just frontend tests)
    ],
  },
});