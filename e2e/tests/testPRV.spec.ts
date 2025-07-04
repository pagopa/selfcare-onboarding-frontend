import { test } from '@playwright/test';
import {
  stepAddAdmin,
  stepAddManager,
  stepInstitutionType,
  stepSelectPartyByCF,
  stepFormData,
  BASE_URL_ONBOARDING,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-interop and institutionType PRV', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Privati');
  await stepSelectPartyByCF(page, '03907690923');
  await stepFormData(page, 'prod-interop', 'PRV');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-pagopa and institutionType PRV', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Altro');
  await stepFormData(page, 'prod-pagopa', 'PRV');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

