import { test } from '@playwright/test';
import {
  BASE_URL_ONBOARDING,
  stepInstitutionType,
  stepAddAdmin,
  stepFormData,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-pagopa and institutionType PT', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Partner tecnologico');
  await stepFormData(page, 'PT');
  await stepAddAdmin(page, undefined, 'PT');
});
