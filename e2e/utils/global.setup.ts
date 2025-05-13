import fs from 'fs/promises';
import path from 'path';
import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log(`GLOBAL SETUP: Starting`);

  try {
    try {
      await fs.mkdir(path.resolve(__dirname, '../test-results'), { recursive: true });
      console.log('GLOBAL SETUP: Created test-results directory');
    } catch (err) {
      console.log('GLOBAL SETUP: test-results directory already exists or cannot be created');
    }
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`GLOBAL SETUP: ℹ️ Logging in...`);
    await page.goto('https://dev.selfcare.pagopa.it/auth/login');
    await page.getByRole('button', { name: 'Entra con SPID' }).click();
    await page.getByTestId('idp-button-https://validator.dev.oneid.pagopa.it/demo').click();
    await page.locator('#username').fill('cleopatra');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Entra con SPID' }).click();
    await page.getByRole('button', { name: 'Conferma' }).click();
    await page.getByRole('button', { name: 'Accetta tutti' }).click();

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
