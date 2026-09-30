import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid session conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Use single worker to avoid session conflicts
  reporter: 'html',
  timeout: 60000, // Increase timeout for slower operations
  use: {
    baseURL: 'http://localhost:5176',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
