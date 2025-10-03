import { test } from '@playwright/test';
import {
  BASE_URL_ONBOARDING,
  stepInstitutionType,
  stepFormData,
  PRODUCT_IDS_TEST_E2E,
  stepAddManager,
  stepAddAdmin,
  stepSelectParty,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-interop and institutionType SCEC', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Società in conto economico consolidato');
  await stepSelectParty(page, undefined, 'Comune di Genoni');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.INTEROP, 'SCEC');
  await stepAddManager(page);
  await stepAddAdmin(page);
});
