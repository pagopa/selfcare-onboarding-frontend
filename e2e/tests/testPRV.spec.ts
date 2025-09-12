import { test } from '@playwright/test';
import {
  stepAddAdmin,
  stepAddManager,
  stepInstitutionType,
  stepSelectPartyByCF,
  stepFormData,
  BASE_URL_ONBOARDING,
  PRODUCT_IDS_TEST_E2E,
} from '../utils/test-utils';

test.only('Test Success onboarding request for product prod-idpay-merchant and institutionType PRV', async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(`${BASE_URL_ONBOARDING}/prod-idpay-merchant`);
  await stepSelectPartyByCF(page, '13614770967', true);
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.IDPAY_MERCHANT, 'PRV');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-interop and institutionType PRV', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Privati');
  await stepSelectPartyByCF(page, '03907690923');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.INTEROP, 'PRV');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-pagopa and institutionType PRV', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Altro');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.PAGOPA, 'PRV');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

