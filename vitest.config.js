// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // 👈 這一行會把 describe, test, expect 變成全域變數
  },
});