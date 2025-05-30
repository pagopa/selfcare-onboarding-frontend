import { test } from '@playwright/test';
import {
  BASE_URL_ONBOARDING,
  stepInstitutionType,
  stepSelectParty,
  stepFormData,
  stepAddManager,
  stepAddAdmin,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-interop and institutionType SA', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Società di assicurazione');
  await stepSelectParty(page, undefined, 'GENERALI ITALIA S.P.A.');
  await stepFormData(page, 'prod-interop', 'SA');
  await stepAddManager(page);
  await stepAddAdmin(page);
});
