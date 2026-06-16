/// <reference types="node" />
import { chromium, Page } from '@playwright/test';
import { deleteOnboardingById } from '../utils/api-utils';

const API_BASE_URL = 'https://api.dev.selfcare.pagopa.it/onboarding';

const BEARER_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaXNjYWxfbnVtYmVyIjoiU1NUTVRUNzZDMjNGMjA1VCIsIm5hbWUiOiJNYXR0aWEiLCJmYW1pbHlfbmFtZSI6IlNpc3RpIiwidWlkIjoiZWUwYmY2ZGEtODE4Ni00YjZkLWJkMjgtYWE4ZTNhOGRiZDc2Iiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImlzcyI6IlNQSUQiLCJhdWQiOiJhcGkuZGV2LnNlbGZjYXJlLnBhZ29wYS5pdCIsImlhdCI6MTc3ODc1MDgyNSwiZXhwIjoxNzc4NzgzMjI1LCJqdGkiOiJiMWU5MzZjOS03ZmExLTRjZjktYmZjNy1hODI1MzIxZDkwYzkifQ.HwGbiKkszL7gfPNzRYx7jZBmYBEGkr9tZTafwy7BeTL-CBmhVEPbDXAoApW1590O4PvrYmNONCIehKVyhmw2KSmqu7aYykew0Nt9l9eRekxbUOR9c-XrTxdFpUjjyJmEmJEszX5mdjnln7GWqeI6gBOxGKwMzrwHNiZ3yvAQpZyeJUh4O77zP1iHI3Lwjh8xgGrL10sHs2wPkk4MfO1LLi89jEAhNgY_jzCIH1mXz9exvIG769j7bG5CUvnwBKXH0mBaNcys1NncGgBPV0hi6BjuwDXgq9BRdPz78h0k60S41MC1EJmNK0LNkBYndTrX1CnHEEdwrepheyYCg_HeEw';

const STATUSES_TO_CLEAN = ['COMPLETED', 'TOBEVALIDATED'];

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

async function getOnboardingIdsByStatus(
  page: Page,
  taxCode: string,
  bearerToken: string,
  status: string
): Promise<string[]> {
  const url = `${API_BASE_URL}/v2/institutions/onboardings?taxCode=${taxCode}&status=${status}`;

  try {
    const response = await page.request.get(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (!response.ok()) {
      console.error(`  [${taxCode}][${status}] GET failed with status ${response.status()}`);
      return [];
    }

    const data: OnboardingEntry[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((onb) => onb.id).filter(Boolean);
  } catch (error) {
    console.error(`  [${taxCode}][${status}] Fetch error:`, error);
    return [];
  }
}

async function cleanupByCfAndStatus() {
  console.log(`Starting cleanup by CF and statuses: ${STATUSES_TO_CLEAN.join(', ')}...\n`);

  if (!process.env.APIM_SUBSCRIPTION_KEY) {
    console.error('Error: APIM_SUBSCRIPTION_KEY environment variable is required');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Fetching onboardings for ${TAX_CODES.length} tax codes...`);

  const allOnboardingIds: string[] = [];

  for (const taxCode of TAX_CODES) {
    process.stdout.write(`  [${taxCode}] ...`);
    const ids = (
      await Promise.all(
        STATUSES_TO_CLEAN.map((status) =>
          getOnboardingIdsByStatus(page, taxCode, BEARER_TOKEN, status)
        )
      )
    ).flat();
    if (ids.length > 0) {
      console.log(`found ${ids.length} onboarding(s): ${ids.join(', ')}`);
      allOnboardingIds.push(...ids);
    } else {
      console.log('none');
    }
  }

  if (allOnboardingIds.length === 0) {
    console.log('\nNo onboardings found. Nothing to delete.');
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
