import { test } from '@playwright/test';
import {
  stepAddAdmin,
  stepAddManager,
  stepInstitutionType,
  stepFormData,
  BASE_URL_ONBOARDING,
  stepAdditionalGPUInformation,
  PRODUCT_IDS_TEST_E2E
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-pagopa and institutionType GPU', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Gestore di pubblica utilità e/o di interesse generale');
  await stepFormData(page, PRODUCT_IDS_TEST_E2E.PAGOPA, 'GPU');
  await stepAdditionalGPUInformation(page);
  await stepAddManager(page);
  await stepAddAdmin(page);
});