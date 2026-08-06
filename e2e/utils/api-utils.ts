/// <reference types="node" />
import fs from 'fs';
import path from 'path';
import { Page } from '@playwright/test';

export const isLocalMode = process.env.VITE_ENV === 'LOCAL_DEV' || process.env.NODE_ENV === 'test';

const ONBOARDING_API_URL = 'https://api.dev.selfcare.pagopa.it/onboarding';

/**
 * Statuses an onboarding can be left in by the suite. Only COMPLETED can be deleted through the
 * internal API, so the others are snapshotted instead of purged: see prepareOnboardingBaseline.
 */
const DELETABLE_STATUS = 'COMPLETED';
const RESIDUAL_STATUSES = ['PENDING', 'TOBEVALIDATED', 'REQUEST'];

/**
 * The API answers with at most 20 onboardings per taxCode+status and offers no paging
 * (size/limit/page are all ignored), so once a tax code holds 20 undeletable residuals a newly
 * created onboarding is no longer visible and no test can find it again.
 */
const API_RESULT_CAP = 20;

const BASELINE_FILE = path.resolve(__dirname, '../onboarding-baseline.json');

/**
 * Every tax code the e2e suite onboards.
 */
export const TEST_TAX_CODES = [
  // PA
  '93022940618',
  '94155940631',
  '93062260505',
  '91199120378',
  '01944590221', // also used in GSP
  '97187780826',
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

export const getOnboardingIdByTaxCode = async (
  page: Page,
  taxCode: string,
  productId: string,
  status?: string
): Promise<string> => {
  // eslint-disable-next-line functional/no-let
  let token;

  if (isLocalMode) {
    token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaXNjYWxfbnVtYmVyIjoiU1NUTVRUNzZDMjNGMjA1VCIsIm5hbWUiOiJNYXR0aWEiLCJmYW1pbHlfbmFtZSI6IlNpc3RpIiwidWlkIjoiZWUwYmY2ZGEtODE4Ni00YjZkLWJkMjgtYWE4ZTNhOGRiZDc2Iiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImlzcyI6IlNQSUQiLCJhdWQiOiJhcGkuZGV2LnNlbGZjYXJlLnBhZ29wYS5pdCIsImlhdCI6MTc4NjAwMjYyMSwiZXhwIjoxNzg2MDM1MDIxLCJqdGkiOiJkNWQwMDk5YS1mYWVmLTQwNTgtOWMxYy04ZmJmMjBjNTVjNjkifQ.VAOpur9Ibwux8NbOeZz_00ABSTgJKCghIL4SFhMjq5pIO9dBuC1vJMlVxA7bGgbiPbqnwI3B3IDjlJa4QEJrZjL-YmGexLqd2ka_qDdjM71CIov41lLqWIq4Wx47XHFP_Z69sPgsLOYJHZ_Th8kSmJ1i8z9K2T57v-0xd92h08NKyXMdwEtI88zlbgq1oIvFtivm9jqL6c-IoyYVLoOCr8U4s002YhzouAPd84-rchhNLAPvkWVKXrteppCkcYjuVUrQI-R8Jx__Usz2NM18Ya9wQ7W_FlxQpsEzhDsreapIc0jJcKQ_suEghUdmbbmpYEC7VcYxTMHT6MXviy010Q';
  } else {
    token = await page.evaluate(() => localStorage.getItem('token'));
  }

  if (!token) {
    throw new Error(
      `No token in localStorage while looking up ${taxCode}: the session was lost before the lookup.`
    );
  }

  const fullUrl = `${ONBOARDING_API_URL}/v2/institutions/onboardings?taxCode=${taxCode}&status=${status}`;

  // Every failure mode used to collapse into the same empty string - an expired session, a 500 and
  // "not created yet" were indistinguishable. Keep the reason so the error can name it.
  // eslint-disable-next-line functional/no-let
  let lastFailure = 'never queried';

  const fetchOnboarding = async (): Promise<string> => {
    try {
      const response = await fetch(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        lastFailure = `HTTP ${response.status} - ${(await response.text()).slice(0, 200)}`;
        return '';
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        lastFailure = `unexpected response shape: ${JSON.stringify(data).slice(0, 200)}`;
        return '';
      }

      // Skip anything that was already there before this run, or that an earlier test claimed:
      // what remains was created by the flow we have just walked through.
      const known = getKnownOnboardingIds();
      const match = data.find((onb: any) => onb.productId === productId && !known.has(onb.id));

      if (!match) {
        lastFailure =
          data.length === 0
            ? `no ${status} onboarding at all for this tax code`
            : `${data.length} ${status} onboarding(s) present, none of them new for ${productId}`;
        return '';
      }

      known.add(match.id);
      return match.id;
    } catch (error) {
      lastFailure = `request failed: ${error instanceof Error ? error.message : String(error)}`;
      return '';
    }
  };

  // The onboarding is not queryable the instant the flow submits it. This used to be two attempts
  // 2s apart, which is not always enough: testAS failed here while its PENDING onboarding was on
  // the backend moments later.
  const deadline = Date.now() + 30000;
  // eslint-disable-next-line functional/no-let
  let result = await fetchOnboarding();

  while (!result && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    result = await fetchOnboarding();
  }

  if (!result) {
    throw new Error(
      `No new ${status} onboarding for ${taxCode} / ${productId} after 30s (${lastFailure}). ` +
        `If the flow submitted fine, the request probably needs approving first: the confirm page ` +
        `only handles PENDING, see verifyRequest in src/services/tokenServices.ts.`
    );
  }

  return result;
};

export const deleteOnboardingById = async (page: Page, onboardingId: string): Promise<boolean> => {
  const apiUrl = 'https://api.dev.selfcare.pagopa.it/external/internal/v1';

  const fullUrl = `${apiUrl}/onboarding/${onboardingId}`;

  try {
    const response = await page.request.delete(fullUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.APIM_SUBSCRIPTION_KEY || '',
      },
    });

    if (response.ok()) {
      return true;
    } else {
      console.error(`Failed to delete onboarding ${onboardingId}: ${response.status()}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting onboarding ${onboardingId}:`, error);
    return false;
  }
};

const listOnboardingIds = async (
  page: Page,
  token: string,
  taxCode: string,
  status: string
): Promise<Array<string>> => {
  const response = await page.request.get(
    `${ONBOARDING_API_URL}/v2/institutions/onboardings?taxCode=${taxCode}&status=${status}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok()) {
    console.error(`[${taxCode}][${status}] GET failed with ${response.status()}`);
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map((onb: any) => onb.id).filter(Boolean) : [];
};

/**
 * Cancels an onboarding request the way the confirm page's "annulla la richiesta" does - see
 * deleteOnboardingRequest in the app's OnboardingApiClient.
 *
 * The internal delete used by deleteOnboardingById only accepts COMPLETED, but residuals pile up in
 * PENDING. This takes them out of that bucket, which is what actually matters: what breaks the
 * suite is the 20-result cap, not the rows existing.
 */
const cancelOnboardingRequest = async (
  page: Page,
  token: string,
  onboardingId: string
): Promise<void> => {
  const response = await page.request.delete(
    `${ONBOARDING_API_URL}/v2/tokens/${onboardingId}/complete`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok()) {
    console.error(`Failed to cancel onboarding ${onboardingId}: ${response.status()}`);
  }
};

/**
 * Cancels every residual onboarding for one taxCode+status, returning the ids that would not move.
 */
const freeOnboardings = async (
  page: Page,
  token: string,
  taxCode: string,
  status: string
): Promise<Array<string>> => {
  const attempted = new Set<string>();

  // The API caps at 20 results with no paging, so a saturated tax code takes several rounds: each
  // one uncovers the next 20. An id still listed after its turn is one cancelling will not move -
  // the call can answer 200 and leave the record where it is - so it gets exactly one attempt.
  // ponytail: 20 rounds = 400 onboardings per pair, raise it if a run ever reports leftovers.
  for (let round = 0; round < 20; round++) {
    const ids = await listOnboardingIds(page, token, taxCode, status);
    const todo = ids.filter((id) => !attempted.has(id));

    if (todo.length === 0) {
      return ids;
    }

    for (const id of todo) {
      attempted.add(id);
      await cancelOnboardingRequest(page, token, id);
    }
  }

  return listOnboardingIds(page, token, taxCode, status);
};

/**
 * Clears the shared dev backend so that the id lookup each test does at the end is unambiguous.
 *
 * The lookup has nothing to key on: the API returns only { id, status, productId }, with no
 * timestamp and no ordering guarantee, so it cannot tell the onboarding a test just created from
 * the ones previous runs left behind - and once a tax code holds 20 of them the cap hides the new
 * one entirely. Every run therefore starts by emptying the buckets:
 *
 *  - COMPLETED onboardings are deleted outright (a test that runs to the end leaves its onboarding
 *    there, so successful runs clean up after themselves)
 *  - everything else is cancelled, which takes it out of the status the lookup queries
 *
 * Whatever refuses to move is written to a baseline file that the lookup then ignores, so a single
 * stuck onboarding degrades into the old behaviour instead of breaking the run.
 */
export const resetTestOnboardings = async (page: Page, token: string): Promise<void> => {
  const baseline: Record<string, Array<string>> = {};
  // eslint-disable-next-line functional/no-let
  let deleted = 0;

  for (const taxCode of TEST_TAX_CODES) {
    if (process.env.APIM_SUBSCRIPTION_KEY) {
      for (const id of await listOnboardingIds(page, token, taxCode, DELETABLE_STATUS)) {
        if (await deleteOnboardingById(page, id)) {
          // eslint-disable-next-line functional/immutable-data
          deleted++;
        }
      }
    }

    for (const status of RESIDUAL_STATUSES) {
      const stuck = await freeOnboardings(page, token, taxCode, status);
      if (stuck.length > 0) {
        // eslint-disable-next-line functional/immutable-data
        baseline[`${taxCode}|${status}`] = stuck;
      }
    }
  }

  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2), 'utf-8');

  const stuckPairs = Object.entries(baseline);
  const stuckCount = stuckPairs.reduce((sum, [, ids]) => sum + ids.length, 0);
  console.log(
    `RESET: deleted ${deleted} COMPLETED, ${stuckCount} onboarding(s) could not be freed`
  );

  const saturated = stuckPairs.filter(([, ids]) => ids.length >= API_RESULT_CAP);
  if (saturated.length > 0) {
    console.error(
      `RESET: ⛔ these tax codes still hold ${API_RESULT_CAP}+ onboardings that will not cancel, so ` +
        `the API cannot return anything this run creates for them and their tests will fail:\n  - ` +
        saturated.map(([pair, ids]) => `${pair} (${ids.length})`).join('\n  - ')
    );
  }
};

/**
 * Ids that were already on the backend before this run, plus the ones tests have already claimed.
 * Loaded lazily because global setup and the test workers are separate processes.
 */
// eslint-disable-next-line functional/no-let
let knownOnboardingIds: Set<string> | undefined;

const getKnownOnboardingIds = (): Set<string> => {
  if (!knownOnboardingIds) {
    try {
      const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
      knownOnboardingIds = new Set(Object.values(baseline).flat() as Array<string>);
    } catch {
      console.error('No onboarding baseline found: id lookups may pick a leftover onboarding');
      knownOnboardingIds = new Set();
    }
  }
  return knownOnboardingIds;
};
