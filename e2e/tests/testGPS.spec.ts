import { test } from '@playwright/test';
import {
  stepInstitutionType,
  stepSelectParty,
  stepAdditionalInformation,
  stepAddManager,
  stepAddAdmin,
  BASE_URL_ONBOARDING,
  stepFormData,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-pagopa and institutionType GSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await stepSelectParty(
    page,
    undefined,
    'Azienda Territoriale per L’Edilizia Residenziale Pubblica della Provincia di Viterbo'
  );
  await stepFormData(page, 'prod-pagopa', 'GPS');
  await stepAdditionalInformation(page);
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-pagopa and institutionType GSP with a party not on IPA', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await page.click('#no_ipa');
  await stepFormData(page, 'GPS');
  await stepAdditionalInformation(page);
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-interop and institutionType GSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await stepSelectParty(
    page,
    undefined,
    'Azienda Territoriale per L’Edilizia Residenziale Pubblica della Provincia di Viterbo'
  );
  await stepFormData(page, 'prod-interop', 'GPS');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-io and institutionType GSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-io`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await stepSelectParty(page);
  await stepFormData(page, 'prod-io', 'GPS');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-io-sign and institutionType GSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-io-sign`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await stepSelectParty(page);
  await stepFormData(page, 'prod-io-sign', 'GPS');
  await stepAddManager(page);
  await stepAddAdmin(page);
});
