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
  // Every test onboards a real party on the dev backend and then looks it up by taxCode+productId.
  // Two tests running at once (or a retry re-submitting a flow that already went through) create
  // two indistinguishable onboardings for the same pair, so the lookup picks the wrong one.
  workers: 1,
  retries: 1,
  timeout: 120000,
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  use: {
    locale: 'it-IT',
    trace: 'retain-on-failure', // no retries anymore, so capture the trace of the failing run
    storageState: path.resolve(__dirname, 'storageState.json'),
    actionTimeout: 8000, // click/fill
    navigationTimeout: 15000, // navigations
  },
  expect: {
    timeout: 10000, // assertions
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: process.env.CI ? true : false,
        launchOptions: {
          slowMo: 500,
        },
      },
    },
  ],
});
