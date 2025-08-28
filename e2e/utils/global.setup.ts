import path from 'path';
import fs from 'fs';
import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log(`GLOBAL SETUP: Starting`);

  const screenshotsDir = path.resolve(__dirname, '../screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: process.env.CI ? true : false,
  });

  const context = await browser.newContext({
    locale: 'it-IT',
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    const visitedUrls: Array<string> = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        // eslint-disable-next-line functional/immutable-data
        visitedUrls.push(frame.url());
        console.log(`🔄 Navigated to: ${frame.url()}`);
      }
    });

    console.log(`GLOBAL SETUP: ℹ️ Starting from selfcare...`);
    await page.goto('https://dev.selfcare.pagopa.it', { timeout: 60000 });

    console.log(`GLOBAL SETUP: ℹ️ Clicking 'Entra con SPID'...`);
    const spidButton = page.getByRole('button', { name: 'Entra con SPID' });
    await spidButton.click({ timeout: 10000 });

    await page.waitForURL('**/uat.oneid.pagopa.it/**', { timeout: 30000 });
    console.log(`✅ Arrived at OneID: ${page.url()}`);

    console.log(`GLOBAL SETUP: ℹ️ Selecting OneID provider...`);
    await page.getByTestId('idp-button-https://validator.dev.oneid.pagopa.it/demo').click();

    await page.waitForFunction(() => document.querySelector('#username') !== null, {
      timeout: 30000,
    });
    console.log(`GLOBAL SETUP: ℹ️ Login form loaded at: ${page.url()}`);

    console.log(`GLOBAL SETUP: ℹ️ Filling credentials...`);
    await page.waitForSelector('#username', { state: 'visible', timeout: 10000 });
    await page.locator('#username').fill('cleopatra');

    await page.waitForSelector('input[name="password"], input[type="password"]', {
      state: 'visible',
      timeout: 5000,
    });
    await page.locator('input[name="password"], input[type="password"]').fill('password123');

    console.log(`GLOBAL SETUP: ℹ️ Submitting login form...`);
    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Entra"), button:has-text("Login"), button:has-text("Accedi")'
      )
      .first();

    await Promise.all([
      page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 30000 }),
      submitButton.click(),
    ]);

    await page.waitForLoadState('networkidle', { timeout: 15000 });

    console.log(`GLOBAL SETUP: ℹ️ After login submission: ${page.url()}`);

    try {
      console.log(`GLOBAL SETUP: ℹ️ Clicking confirm button...`);
      await Promise.all([
        page
          .waitForURL(
            (url) => url.toString().includes('dashboard') || url.toString().includes('selfcare'),
            { timeout: 15000 }
          )
          .catch(() => {}),
        page.getByRole('button', { name: 'Conferma' }).click(),
      ]);
    } catch (e) {
      console.log(`GLOBAL SETUP: ℹ️ No confirm button found or timeout, proceeding...`);
    }

    await page.waitForURL('**/dashboard**', {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    });

    console.log(`GLOBAL SETUP: ✅ Successfully reached dashboard: ${page.url()}`);

    await page.waitForTimeout(2000);

    console.log(`GLOBAL SETUP: ℹ️ Saving storage state...`);
    await context.storageState({ path: path.resolve(__dirname, '../storageState.json') });

    console.log('🔍 Complete redirect chain:');
    visitedUrls.forEach((url, index) => console.log(`  ${index + 1}. ${url}`));

    await browser.close();
  } catch (error: unknown) {
    console.error('GLOBAL SETUP: ❌ Login failed:', error);
    console.error(
      'GLOBAL SETUP: ❌ Error message:',
      error instanceof Error ? error.message : String(error)
    );

    try {
      const screenshotPath = path.resolve(screenshotsDir, `error-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error(`GLOBAL SETUP: ❌ Screenshot salvato in caso di errore: ${screenshotPath}`);
    } catch {
      console.error('GLOBAL SETUP: ❌ Non sono riuscito a fare screenshot.');
    }

    throw error;
  }
}

export default globalSetup;
