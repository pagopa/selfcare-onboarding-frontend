import { test } from '@playwright/test';
import {
  login,
  stepAddAdmin,
  stepAddManager,
  stepFormDataWithIpaResearch4SDICode,
  stepInstitutionType,
  stepSelectParty,
  stepUploadAggregatorCsv,
  FILE_MOCK_CSV_AGGREGATOR,
} from '../utils/test-utils';

test.beforeEach(() => test.setTimeout(60000));

test('Test Success onboarding request for product prod-pagopa and institutionType PA', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 593 });
  await login(page, 'test', 'test', 'prod-pagopa');
  await stepInstitutionType(page);
  await stepSelectParty(page);
  await stepFormDataWithIpaResearch4SDICode(page, context, 'prod-pagopa');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-io and institutionType PA', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 593 });
  await login(page, 'test', 'test', 'prod-io');
  await stepInstitutionType(page);
  await stepSelectParty(page);
  await stepFormDataWithIpaResearch4SDICode(page, context, 'prod-io');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-io and institutionType PA with aggregator party', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 593 });
  await login(page, 'test', 'test', 'prod-io');
  await stepInstitutionType(page);
  await stepSelectParty(page, true);
  await stepFormDataWithIpaResearch4SDICode(page, context, 'prod-io');
  await stepAddManager(page);
  await stepAddAdmin(page, true);
  await stepUploadAggregatorCsv(
    page,
    'Indica i soggetti aggregati per IO',
    FILE_MOCK_CSV_AGGREGATOR.IO
  );
});

test('Test Success onboarding request for product prod-io-sign and institutionType PA', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 593 });
  await login(page, 'test', 'test', 'prod-io-sign');
  await stepInstitutionType(page);
  await stepSelectParty(page);
  await stepFormDataWithIpaResearch4SDICode(page, context, 'prod-io-sign');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-interop and institutionType PA', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 593 });
  await login(page, 'test', 'test', 'prod-interop');
  await stepInstitutionType(page);
  await stepSelectParty(page);
  await stepFormDataWithIpaResearch4SDICode(page, context, 'prod-interop');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-pn and institutionType PA (default)', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 593 });
  await login(page, 'test', 'test', 'prod-pn');
  await stepSelectParty(page);
  await stepFormDataWithIpaResearch4SDICode(page, context, 'prod-pn');
  await stepAddManager(page);
  await stepAddAdmin(page);
});

test('Test Success onboarding request for product prod-pn and institutionType PA (default) with aggregator party', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1280, height: 593 });
  await login(page, 'test', 'test', 'prod-pn');
  await stepSelectParty(page, true);
  await stepFormDataWithIpaResearch4SDICode(page, context, 'prod-pn');
  await stepAddManager(page);
  await stepAddAdmin(page, true);
  await stepUploadAggregatorCsv(
    page,
    'Indica i soggetti aggregati per SEND - Servizio Notifiche Digitali',
    FILE_MOCK_CSV_AGGREGATOR.SEND
  );
});
