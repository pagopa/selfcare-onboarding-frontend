import * as apiUtils from '../../../../lib/api-utils';
import { PRODUCT_IDS } from '../../../../utils/constants';
import type { FetchWithLogsCall } from '../../../../utils/test/builders';
import { fetchWithLogsSpy } from './testSetup';

const actualFetchWithLogs = apiUtils.fetchWithLogs;

type FetchWithLogsResult = Awaited<ReturnType<typeof apiUtils.fetchWithLogs>>;

/**
 * Overrides the mocked response of a single endpoint for the current test, leaving every other
 * endpoint served by the shared mocks in `src/lib/__mocks__`.
 * The override is reset by `setupTestHooks`, which re-creates the spy before each test.
 */
export const respondWith = (endpoint: string, response: unknown) =>
  fetchWithLogsSpy.mockImplementation((path, config, onRedirectToLogin) =>
    path?.endpoint === endpoint
      ? // Test responses are partial payloads, not full axios responses
        Promise.resolve(response as FetchWithLogsResult)
      : actualFetchWithLogs(path, config, onRedirectToLogin)
  );

export const callsTo = (endpoint: string): Array<FetchWithLogsCall> =>
  fetchWithLogsSpy.mock.calls.filter((call) => call[0]?.endpoint === endpoint);

export const phaseOutProductResponse = (productId: string = PRODUCT_IDS.PAGOPA) => ({
  data: { id: productId, title: 'Piattaforma pagoPA', status: 'PHASE_OUT' },
  status: 200,
});
