import { test } from '@playwright/test';
import {
  stepInstitutionType,
  stepAddManager,
  stepAddAdmin,
  BASE_URL_ONBOARDING,
  stepFormData,
  stepCompleteOnboarding,
  FILE_MOCK_PDF_CONTRACT,
  PRODUCT_IDS_TEST_E2E,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-pagopa and institutionType PSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Prestatori Servizi di Pagamento');
  await stepFormData(page, 'PSP');
  await stepAddManager(page);
  await stepAddAdmin(page);
  await stepCompleteOnboarding(
    page,
    '10293847565',
    FILE_MOCK_PDF_CONTRACT.PA,
    PRODUCT_IDS_TEST_E2E.PAGOPA,
    'PSP'
  );
});
