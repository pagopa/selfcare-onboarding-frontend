import { test } from '@playwright/test';
import {
  stepAddAdmin,
  stepAddManager,
  stepInstitutionType,
  stepSelectPartyByCF,
  stepFormData,
  BASE_URL_ONBOARDING,
} from '../utils/test-utils';
import { PRODUCT_IDS } from '../../src/utils/constants';

test('Test Success onboarding request for product prod-interop and institutionType PRV', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Privati');
  await stepSelectPartyByCF(page, '03907690923');
  await stepFormData(page, PRODUCT_IDS.INTEROP, 'PRV');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-pagopa and institutionType PRV', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Altro');
  await stepFormData(page, PRODUCT_IDS.PAGOPA, 'PRV');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

