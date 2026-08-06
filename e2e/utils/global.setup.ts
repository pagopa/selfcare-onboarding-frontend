/// <reference types="node" />
import path from 'path';
import { BrowserContext, chromium, Page } from '@playwright/test';

import { isLocalMode, resetTestOnboardings } from './api-utils';

/**
 * Refuses the OneTrust banner instead of accepting it, and checks it took.
 *
 * Refusing keeps the Qualtrics satisfaction survey away: it belongs to cookie group C0002, which
 * triggerQualtricsIntercept checks before running. Accepting means the survey pops up over the
 * success page partway through the suite.
 *
 * The banner has to be actively dismissed, not just left alone: while it is up OneTrust covers the
 * page with `.onetrust-pc-dark-filter`, which swallows every click the tests make.
 */
const refuseCookies = async (page: Page, context: BrowserContext) => {
  // "Rifiuta tutti" carries no id on this banner, only the OneTrust class
  const refuseButton = page.locator('.ot-pc-refuse-all-handler, #onetrust-reject-all-handler');

  try {
    await refuseButton.first().click({ timeout: 8000 });
    await page.waitForTimeout(1000);
  } catch {
    console.log('GLOBAL SETUP: i️ No cookie banner to refuse');
  }

  const consent = (await context.cookies()).find((cookie) => cookie.name === 'OptanonConsent');

  if (!consent) {
    console.error(
      'GLOBAL SETUP: ⚠️ no OptanonConsent cookie - the banner will reappear during the tests and ' +
        'its overlay will swallow clicks'
    );
  } else if (decodeURIComponent(consent.value).includes('C0002:1')) {
    console.error(
      'GLOBAL SETUP: ⚠️ analytics cookies accepted - the Qualtrics survey will pop up over the ' +
        'success pages'
    );
  } else {
    console.log('GLOBAL SETUP: ✅ Cookies refused (C0002 denied, Qualtrics survey off)');
  }
};

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

      await refuseCookies(page, context);

      console.log(`GLOBAL SETUP: ✅ Mock login completed`);
    } else {
      await page.goto('https://dev.selfcare.pagopa.it', { timeout: 60000 });

      const spidButton = page.getByRole('button', { name: 'Entra con SPID' });
      await spidButton.click({ timeout: 20000 });

      await page.waitForURL('**/uat.oneid.pagopa.it/**', { timeout: 30000 });
      console.log(`GLOBAL SETUP: ✅ Reached OneID`);

      await page.click('[data-testid="idp-button-https://idp.uat.oneid.pagopa.it"]');

      await page.waitForFunction(() => document.querySelector('#username') !== null, {
        timeout: 30000,
      });

      await page.waitForSelector('#username', { state: 'visible', timeout: 10000 });
      await page.locator('#username').fill('s.palpatine');

      await page.waitForSelector('input[name="password"], input[type="password"]', {
        state: 'visible',
        timeout: 5000,
      });
      await page.locator('input[name="password"], input[type="password"]').fill('test');

      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Entra"), button:has-text("Login"), button:has-text("Accedi")'
        )
        .first();

      await Promise.all([
        page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 30000 }),
        submitButton.click(),
      ]);

      await page.click('.mdc-button--unelevated > .mdc-button__ripple');

      await page.waitForLoadState('networkidle', { timeout: 15000 });

      await page.waitForURL('**/dashboard/**', {
        timeout: 60000,
        waitUntil: 'domcontentloaded',
      });

      console.log(`GLOBAL SETUP: ✅ SPID login completed`);

      // Only now: before the login the root redirects to OneID, so the click races the redirect
      await refuseCookies(page, context);

      const token = await page.evaluate(() => localStorage.getItem('token'));
      if (token) {
        await resetTestOnboardings(page, token);
      } else {
        console.error('GLOBAL SETUP: ⚠️ no token in localStorage, reset skipped');
      }
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
