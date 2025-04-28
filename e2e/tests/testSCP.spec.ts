import { test } from '@playwright/test';
import {
  stepAddAdmin,
  stepAddManager,
  stepInstitutionType,
  stepSelectPartyByCF,
  stepFormDataWithoutIpaResearch,
} from '../utils/test-utils';

test.beforeEach(() => test.setTimeout(60000));

test('Test Success onboarding request for product prod-interop and institutionType SCP', async ({
  page,
}) => {
  // TODO: Add step of Login
  await stepInstitutionType(page, 'Società a controllo pubblico');
  await stepSelectPartyByCF(page, '00112233445');
  await stepFormDataWithoutIpaResearch(page, 'prod-intrerop', 'SCP');
  await stepAddManager(page);
  await stepAddAdmin(page);
});
