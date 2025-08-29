import { test } from '@playwright/test';
import {
  stepAddAdmin,
  stepAddManager,
  stepInstitutionType,
  stepSelectPartyByCF,
  stepFormData,
  BASE_URL_ONBOARDING,
  PRODUCT_IDS_TEST_E2E
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-interop and institutionType SCP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Società a controllo pubblico');
  await stepSelectPartyByCF(page, '03907690923');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.INTEROP, 'SCP');
  await stepAddManager(page);
  await stepAddAdmin(page);
});
