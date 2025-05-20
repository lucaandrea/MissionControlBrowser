import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    port: 5000,
    timeout: 120000,
    reuseExistingServer: true
  }
});
