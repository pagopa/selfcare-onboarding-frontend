import { test } from '@playwright/test';
import {
  stepAddAdmin,
  stepAddManager,
  stepInstitutionType,
  stepSelectParty,
  BASE_URL_ONBOARDING,
  stepUploadAggregatorCsv,
  FILE_MOCK_CSV_AGGREGATOR,
  stepFormData,
} from '../utils/test-utils';
import { PRODUCT_IDS } from '../../src/utils/constants';

test('Test Success onboarding request for product prod-pagopa and institutionType PA', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Pubblica Amministrazione');
  await stepSelectParty(page);
  await stepFormData(page, PRODUCT_IDS.IO, 'PA');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-io and institutionType PA', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-io`);
  await stepInstitutionType(page, 'Pubblica Amministrazione');
  await stepSelectParty(page);
  await stepFormData(page, PRODUCT_IDS.IO, 'PA');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-io and institutionType PA with aggregator party', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-io`);
  await stepInstitutionType(page, 'Pubblica Amministrazione');
  await stepSelectParty(page, true);
  await stepFormData(page, PRODUCT_IDS.IO, 'PA');
  await stepAddManager(page);
  await stepAddAdmin(page, true);
  await stepUploadAggregatorCsv(
    page,
    'Indica i soggetti aggregati per IO',
    FILE_MOCK_CSV_AGGREGATOR.IO
  );
});

test('Test Success onboarding request for product prod-io-sign and institutionType PA', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-io-sign`);
  await stepInstitutionType(page, 'Pubblica Amministrazione');
  await stepSelectParty(page);
  await stepFormData(page, PRODUCT_IDS.IO_SIGN, 'PA');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-interop and institutionType PA', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Pubblica Amministrazione');
  await stepSelectParty(page);
  await stepFormData(page, PRODUCT_IDS.INTEROP, 'PA');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-pn and institutionType PA (default)', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pn`);
  await stepSelectParty(page, undefined, 'Fondazione Toscana Gabriele');
  await stepFormData(page, PRODUCT_IDS.SEND, 'PA');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-pn and institutionType PA (default) with aggregator party', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pn`);
  await stepSelectParty(page, true, 'Fondazione Toscana Gabriele');
  await stepFormData(page, PRODUCT_IDS.SEND, 'PA');
  await stepAddManager(page);
  await stepAddAdmin(page, true);
  await stepUploadAggregatorCsv(
    page,
    'Indica i soggetti aggregati per SEND - Servizio Notifiche Digitali',
    FILE_MOCK_CSV_AGGREGATOR.SEND
  );
});
