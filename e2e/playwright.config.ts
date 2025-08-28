import path from 'path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // path to the global setup files.
  globalSetup: path.resolve(__dirname, './utils/global.setup.ts'),
  globalTeardown: path.resolve(__dirname, './utils/global.teardown.ts'),

  timeout: 120_000,

  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  use: {
    javaScriptEnabled: true,
    locale: 'it-IT',
    trace: 'on-first-retry',
    storageState: path.resolve(__dirname, 'storageState.json'),
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 1000,
        },
      },
    },
  ],
});