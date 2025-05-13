import { test } from '@playwright/test';
import {
  stepInstitutionType,
  stepAddManager,
  stepAddAdmin,
  stepFormDataPartyNotFromIpa,
  BASE_URL_ONBOARDING,
} from '../utils/test-utils';

test('Test Success onboarding request for product prod-pagopa and institutionType PSP', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-pagopa`);
  await stepInstitutionType(page, 'Prestatori Servizi di Pagamento');
  await stepFormDataPartyNotFromIpa(page, 'PSP');
  await stepAddManager(page);
  await stepAddAdmin(page);
});
