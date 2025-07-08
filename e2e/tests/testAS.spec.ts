import { test } from '@playwright/test';
import {
  BASE_URL_ONBOARDING,
  stepInstitutionType,
  stepSelectParty,
  stepFormData,
  stepAddManager,
  stepAddAdmin,
} from '../utils/test-utils';
import { PRODUCT_IDS } from '../../src/utils/constants';

test('Test Success onboarding request for product prod-interop and institutionType AS ', async ({
  page,
}) => {
  await page.goto(`${BASE_URL_ONBOARDING}/prod-interop`);
  await stepInstitutionType(page, 'Gestore privato di piattaforma e-procurement');
  await stepSelectParty(page, undefined, 'Venicecom S.r.l.');
  await stepFormData(page, PRODUCT_IDS.INTEROP, 'AS');
  await stepAddManager(page);
  await stepAddAdmin(page);
});