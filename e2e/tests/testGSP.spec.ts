import { test } from '@playwright/test';
import {
  BASE_URL_ONBOARDING,
  FILE_MOCK_PDF_CONTRACT,
  PRODUCT_IDS_TEST_E2E,
  stepAddAdmin,
  stepAdditionalInformation,
  stepAddManager,
  stepCompleteOnboarding,
  stepFormData,
  stepInstitutionType,
  stepSelectParty,
  stepSelectPartyByCF,
  stepUploadGspNoIpaDocuments,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-pagopa and institutionType GSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await stepSelectPartyByCF(page, '80000910564');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.PAGOPA, 'GSP');
  await stepAddManager(page);
  await stepAddAdmin(page);
  await stepCompleteOnboarding(
    page,
    '80000910564',
    FILE_MOCK_PDF_CONTRACT.PA,
    PRODUCT_IDS_TEST_E2E.PAGOPA
  );
});

test('Test Success onboarding request for product prod-pagopa and institutionType GSP with a party not on IPA', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await page.click('#no_ipa');
  await page.getByRole('button', { name: 'Continua' }).click();
  await stepFormData(page, 'GSP', undefined);
  await stepAdditionalInformation(page);
  await stepAddManager(page);
  await stepAddAdmin(page, {
    institutionType: 'GSP',
    productId: PRODUCT_IDS_TEST_E2E.PAGOPA,
    notOnIpa: true,
  });
  await stepUploadGspNoIpaDocuments(page, FILE_MOCK_PDF_CONTRACT.PA);
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
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.INTEROP, 'GSP');
  await stepAddManager(page);
  await stepAddAdmin(page);
  await stepCompleteOnboarding(
    page,
    '80000910564',
    FILE_MOCK_PDF_CONTRACT.PA,
    PRODUCT_IDS_TEST_E2E.INTEROP
  );
});

test('Test Success onboarding request for product prod-io and institutionType GSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-io`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await stepSelectPartyByCF(page, '80001080532');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.IO, 'GSP');
  await stepAddManager(page);
  await stepAddAdmin(page);
  await stepCompleteOnboarding(
    page,
    '80001080532',
    FILE_MOCK_PDF_CONTRACT.PA,
    PRODUCT_IDS_TEST_E2E.IO
  );
});

test.fixme('Test Success onboarding request for product prod-io-sign and institutionType GSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-io-sign`);
  await stepInstitutionType(page, 'Gestore di servizi pubblici');
  await stepSelectParty(page);
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.IO_SIGN, 'GSP');
  await stepAddManager(page);
  await stepAddAdmin(page);
  await stepCompleteOnboarding(
    page,
    '01944590221',
    FILE_MOCK_PDF_CONTRACT.PA,
    PRODUCT_IDS_TEST_E2E.IO_SIGN
  );
});
