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
  workers: process.env.CI ? 1 : 3,
  timeout: process.env.CI ? 90000 : 120000,
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  retries: 3,
  use: {
    locale: 'it-IT',
    trace: 'on-first-retry',
    storageState: path.resolve(__dirname, 'storageState.json'),
    actionTimeout: 5000, // click/fill
    navigationTimeout: 15000, // navigations
  },
  expect: {
    timeout: 8000, // assertions
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : false,
        launchOptions: {
          slowMo: 750,
        },
      },
    },
  ],
});
