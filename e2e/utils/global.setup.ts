import path from 'path';
import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log(`GLOBAL SETUP: Starting`);

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`GLOBAL SETUP: ℹ️ Logging in...`);

    await page.goto('https://dev.selfcare.pagopa.it/auth/login', { waitUntil: 'networkidle' });

    const button = page.getByRole('button', { name: 'Entra con SPID' });
    await button.waitFor({ state: 'visible', timeout: 100000 });
    await button.click();

    await page.getByTestId('idp-button-https://validator.dev.oneid.pagopa.it/demo').click();
    await page.locator('#username').fill('cleopatra');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Entra con SPID' }).click();
    await page.getByRole('button', { name: 'Conferma' }).click();

    await page.waitForURL('**/dashboard');
    await context.storageState({ path: path.resolve(__dirname, '../storageState.json') });
    console.log(
      'GLOBAL SETUP: ✅ Storage state saved to',
      path.resolve(__dirname, '../storageState.json')
    );

    await browser.close();
  } catch (error) {
    console.error('GLOBAL SETUP: ❌ Login failed:', error);
    throw error;
  }
}

export default globalSetup;
