import path from 'path';
import { chromium } from '@playwright/test';

export const isLocalMode =
  process.env.REACT_APP_ENV === 'LOCAL_DEV' || process.env.NODE_ENV === 'test';

async function globalSetup() {
  console.log(`GLOBAL SETUP: Starting in ${isLocalMode ? 'LOCAL/TEST' : 'DEV'} mode`);

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

    if (isLocalMode) {
      await page.goto('http://localhost:3000/onboarding', { timeout: 60000 });
      await page.waitForTimeout(2000);

      const cookieButton = page.getByRole('button', { name: 'Accetta tutti' });
      await cookieButton.click();

      console.log(`GLOBAL SETUP: ✅ Mock login completed`);
    } else {
      await page.goto('https://dev.selfcare.pagopa.it', { timeout: 60000 });

      const spidButton = page.getByRole('button', { name: 'Entra con SPID' });
      await spidButton.click({ timeout: 10000 });

      await page.waitForURL('**/uat.oneid.pagopa.it/**', { timeout: 30000 });
      console.log(`GLOBAL SETUP: ✅ Reached OneID`);

      await page.getByTestId('idp-button-https://validator.dev.oneid.pagopa.it/demo').click();

      await page.waitForFunction(() => document.querySelector('#username') !== null, {
        timeout: 30000,
      });

      await page.waitForSelector('#username', { state: 'visible', timeout: 10000 });
      await page.locator('#username').fill('cleopatra');

      await page.waitForSelector('input[name="password"], input[type="password"]', {
        state: 'visible',
        timeout: 5000,
      });
      await page.locator('input[name="password"], input[type="password"]').fill('password123');

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

      try {
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
        // Confirm button optional
      }

      await page.waitForURL('**/dashboard/**', {
        timeout: 60000,
        waitUntil: 'domcontentloaded',
      });

      console.log(`GLOBAL SETUP: ✅ SPID login completed`);
    }

    await context.storageState({ path: path.resolve(__dirname, '../storageState.json') });
    await browser.close();

    console.log(`GLOBAL SETUP: ✅ Setup completed successfully`);
  } catch (error: unknown) {
    console.error(
      'GLOBAL SETUP: ❌ Setup failed:',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

export default globalSetup;
