import { chromium, Page } from '@playwright/test';
import { deleteOnboardingById } from '../utils/api-utils';

const API_BASE_URL = 'https://api.dev.selfcare.pagopa.it/onboarding';

const BEARER_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imp3dF84Njo3NDoxZTozNTphZTphNjpkODo0YjpkYzplOTpmYzo4ZTphMDozNTo2ODpiNSJ9.eyJlbWFpbCI6ImZ1cmlvdml0YWxlQG1hcnRpbm8uaXQiLCJmYW1pbHlfbmFtZSI6IlNhcnRvcmkiLCJmaXNjYWxfbnVtYmVyIjoiU1JUTkxNMDlUMDZHNjM1UyIsIm5hbWUiOiJBbnNlbG1vIiwiZnJvbV9hYSI6ZmFsc2UsInVpZCI6IjUwOTZlNGM2LTI1YTEtNDVkNS05YmRmLTJmYjk3NGE3YzFjOCIsImxldmVsIjoiTDIiLCJpYXQiOjE2NzQ4MTQxODAsImF1ZCI6ImFwaS5kZXYuc2VsZmNhcmUucGFnb3BhLml0IiwiaXNzIjoiU1BJRCIsImp0aSI6IjAxR1FTQjhLSDNCSks4QkFTRDE4MlZKSDhEIn0.JOfxEC3o8Wor0l430Fq68mWVl4h-NUpFlFuSf6Xgxmu-wqeQyUjRKIfl3M9J0H_8ihxyNMEu5u3PqqQBubGx1mjy24uEsoRPFdLQxlGnpMAM-15SFv8ShDWvMaTSz8hO6vCRJxUtNQgX7SplIG7ZlBBSt7ihwioW1CsKWFISuG0tHwe797NWwaMJlRnzW3R7BIrsGU1eJeue2QqYUnKXZIwYQh21E3EssCNFrusATEuJT_opGaTMzSHpUZxI6cCG2pOE8Cmm0Z75Q2HAM2eoi1_Mx8llZvuk1oVhgDGsACpNRb9Vyxt6jAPUEh3DlkGpLqS8AUD1vRQydzNifiSb4A';

const TAX_CODES = [
  // PA
  '93022940618',
  '94155940631',
  '93062260505',
  '91199120378',
  '01944590221', // also used in GSP
  // GSP
  '80000910564',
  '11779933554',
  '80001080532',
  // PRV / SCP
  '13614770967',
  '03907690923', // also used in SCP
  '19734628500', // PRV
  '10203040506', // GPU
  '11223344556', // PSP
  '99887766554', // PT
  // SA
  '00409920584',
  // AS
  '03014640274',
  // SCEC
  '02002380224',
];

interface OnboardingEntry {
  id: string;
  status: string;
  productId: string;
}

async function getCompletedOnboardingIds(
  page: Page,
  taxCode: string,
  bearerToken: string
): Promise<string[]> {
  const url = `${API_BASE_URL}/v2/institutions/onboardings?taxCode=${taxCode}&status=COMPLETED`;

  try {
    const response = await page.request.get(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (!response.ok()) {
      console.error(`  [${taxCode}] GET failed with status ${response.status()}`);
      return [];
    }

    const data: OnboardingEntry[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((onb) => onb.id).filter(Boolean);
  } catch (error) {
    console.error(`  [${taxCode}] Fetch error:`, error);
    return [];
  }
}

async function cleanupByCfAndStatus() {
  console.log('Starting cleanup by CF and status=COMPLETED...\n');

  if (!process.env.APIM_SUBSCRIPTION_KEY) {
    console.error('Error: APIM_SUBSCRIPTION_KEY environment variable is required');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Fetching COMPLETED onboardings for ${TAX_CODES.length} tax codes...`);

  const allOnboardingIds: string[] = [];

  for (const taxCode of TAX_CODES) {
    process.stdout.write(`  [${taxCode}] ...`);
    const ids = await getCompletedOnboardingIds(page, taxCode, BEARER_TOKEN);
    if (ids.length > 0) {
      console.log(`found ${ids.length} onboarding(s): ${ids.join(', ')}`);
      allOnboardingIds.push(...ids);
    } else {
      console.log('none');
    }
  }

  if (allOnboardingIds.length === 0) {
    console.log('\nNo COMPLETED onboardings found. Nothing to delete.');
    await browser.close();
    return;
  }

  console.log(`\nCollected ${allOnboardingIds.length} onboarding ID(s) to delete:`);
  allOnboardingIds.forEach((id, index) => {
    console.log(`  ${index + 1}. ${id}`);
  });

  console.log('\nDeleting onboardings...');

  // eslint-disable-next-line functional/no-let
  let successCount = 0;
  // eslint-disable-next-line functional/no-let
  let failureCount = 0;

  for (const onboardingId of allOnboardingIds) {
    console.log(`  Deleting ${onboardingId}...`);
    const success = await deleteOnboardingById(page, onboardingId);
    if (success) {
      console.log(`    OK`);
      // eslint-disable-next-line functional/immutable-data
      successCount++;
    } else {
      console.log(`    FAILED`);
      // eslint-disable-next-line functional/immutable-data
      failureCount++;
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log('Cleanup Summary:');
  console.log(`  Successfully deleted : ${successCount}`);
  console.log(`  Failed to delete     : ${failureCount}`);
  console.log(`  Total processed      : ${allOnboardingIds.length}`);
  console.log('='.repeat(50));

  if (failureCount > 0) {
    console.error('\nSome onboardings could not be deleted.');
    process.exit(1);
  } else {
    console.log('\nAll onboardings cleaned up successfully.');
  }
}

cleanupByCfAndStatus()
  .then(() => {
    console.log('Cleanup process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup process failed:', error);
    process.exit(1);
  });
