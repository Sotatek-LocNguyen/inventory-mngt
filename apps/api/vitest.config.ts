import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgresql://inventory:inventory@localhost:5432/inventory_test',
      JWT_SECRET: 'test-secret',
      PORT: '3002',
      ADMIN_EMAIL: 'admin@shop.com',
      ADMIN_PASSWORD_HASH: '',
      ALLOWED_ORIGIN: 'http://localhost:3000',
    },
    globalSetup: './src/test/setup.ts',
    testTimeout: 30000,
  },
});
