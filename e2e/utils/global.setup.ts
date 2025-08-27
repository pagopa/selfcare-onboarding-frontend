import path from 'path';
import { chromium } from '@playwright/test';
async function globalSetup() {
  console.log(`GLOBAL SETUP: Starting`);
  const browser = await chromium.launch({
    headless: process.env.CI ? true : false,
  });
  const context = await browser.newContext();
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
    await page.goto('https://dev.selfcare.pagopa.it', {
      timeout: 60000,
    });

    page.on('request', (request) => {
      console.log(`➡️ Request: ${request.method()} ${request.url()}`);
    });

    page.on('response', (response) => {
      console.log(`⬅️ Response: ${response.status()} ${response.url()}`);
    });

    page.on('requestfailed', (request) => {
      console.log(`❌ Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });

    console.log(`GLOBAL SETUP: ℹ️ Navigazione iniziale...`);
    await page.goto('https://dev.selfcare.pagopa.it/', { waitUntil: 'domcontentloaded' });

    console.log(`GLOBAL SETUP: ℹ️ Aspetto stabilizzazione pagina...`);
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    await page.screenshot({ path: 'before-click.png', fullPage: true });
    console.log("GLOBAL SETUP: Screenshot 'before-click.png' salvato");

    const spidButton = page.getByRole('button', { name: 'Entra con SPID' });
    await spidButton.waitFor({ state: 'visible', timeout: 60000 });

    console.log(`GLOBAL SETUP: ℹ️ Clicco 'Entra con SPID'...`);
    await spidButton.click({ noWaitAfter: true });

    await page.waitForURL(/oneid\.pagopa\.it\/login/, { timeout: 60000 });
    console.log(`GLOBAL SETUP: ✅ Redirected to OneID: ${page.url()}`);

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
    await submitButton.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log(`GLOBAL SETUP: ℹ️ After login submission: ${page.url()}`);
    try {
      console.log(`GLOBAL SETUP: ℹ️ Clicking confirm button...`);
      await page.getByRole('button', { name: 'Conferma' }).click();
    } catch (e) {
      console.log(`GLOBAL SETUP: ℹ️ No confirm button found or timeout, proceeding...`);
    }
    console.log(`GLOBAL SETUP: ℹ️ Waiting for redirect to dashboard...`);
    await page.waitForURL('**/dashboard**', {
      timeout: 60000,
      waitUntil: 'networkidle',
    });
    console.log(`GLOBAL SETUP: ✅ Successfully reached dashboard: ${page.url()}`);
    await page.waitForTimeout(2000);
    console.log(`GLOBAL SETUP: ℹ️ Saving storage state...`);
    await context.storageState({ path: path.resolve(__dirname, '../storageState.json') });
    console.log(
      'GLOBAL SETUP: ✅ Storage state saved to',
      path.resolve(__dirname, '../storageState.json')
    );
    console.log('🔍 Complete redirect chain:');
    visitedUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    await browser.close();
  } catch (error: unknown) {
    console.error('GLOBAL SETUP: ❌ Login failed:', error);
    console.error(
      'GLOBAL SETUP: ❌ Error message:',
      error instanceof Error ? error.message : String(error)
    );
    try {
      await page.screenshot({
        path: path.resolve(__dirname, '../screenshots/error.png'),
        fullPage: true,
      });
      console.error('GLOBAL SETUP: ❌ Screenshot salvato in caso di errore.');
    } catch {
      console.error('GLOBAL SETUP: ❌ Non sono riuscito a fare screenshot.');
    }

    throw error;
  }
}
export default globalSetup;
