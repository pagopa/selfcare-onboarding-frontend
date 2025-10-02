import { test } from '@playwright/test';
import {
  BASE_URL_ONBOARDING,
  stepInstitutionType,
  stepFormData,
  PRODUCT_IDS_TEST_E2E,
  stepAdditionalInformation,
  stepAddManager,
  stepAddAdmin,
  stepSelectPartyByCF,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-interop and institutionType SCEC', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Società in conto economico consolidato');
  await stepSelectPartyByCF(page, '04570621005');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.PAGOPA, 'GSP');
  await stepAdditionalInformation(page);
  await stepAddManager(page);
  await stepAddAdmin(page);
});
