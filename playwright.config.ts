import { defineConfig, devices } from '@playwright/test';

const PORT = 8788;

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    // Fresh local D1 for every run, then the real Worker serving the built app.
    command: `rm -rf .wrangler/e2e && npm run build && npx wrangler d1 migrations apply wycinanka --local --persist-to .wrangler/e2e && npx wrangler dev --port ${PORT} --ip 127.0.0.1 --persist-to .wrangler/e2e`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
