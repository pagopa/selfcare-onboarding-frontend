import { test } from '@playwright/test';
import {
  BASE_URL_ONBOARDING,
  stepInstitutionType,
  stepAddAdmin,
  stepFormDataPartyNotFromIpa,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-pagopa and institutionType PT', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Partner tecnologico');
  await stepFormDataPartyNotFromIpa(page, 'PT');
  await stepAddAdmin(page, undefined, 'PT');
});


