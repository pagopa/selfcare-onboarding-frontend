import { test } from '@playwright/test';
import {
  BASE_URL_ONBOARDING,
  stepInstitutionType,
  stepSelectParty,
  stepFormData,
  stepAddManager,
  stepAddAdmin,
  PRODUCT_IDS_TEST_E2E,
  stepCompleteOnboarding,
  FILE_MOCK_PDF_CONTRACT,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-interop and institutionType AS ', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Gestore privato di piattaforma e-procurement');
  await stepSelectParty(page, undefined, 'Venicecom S.r.l.');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.INTEROP, 'AS');
  await stepAddManager(page);
  await stepAddAdmin(page);
  await stepCompleteOnboarding(
    page,
    '03014640274',
    FILE_MOCK_PDF_CONTRACT.PA,
    PRODUCT_IDS_TEST_E2E.INTEROP
  );
});
