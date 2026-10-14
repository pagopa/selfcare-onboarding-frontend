import * as apiUtils from '../../../../lib/api-utils';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { fetchWithLogsSpy } from './testSetup';

const actualFetchWithLogs = apiUtils.fetchWithLogs;

/**
 * Overrides the mocked response of a single endpoint for the current test, leaving every other
 * endpoint served by the shared mocks in `src/lib/__mocks__`.
 * The override is reset by `setupTestHooks`, which re-creates the spy before each test.
 */
export const respondWith = (endpoint: string, response: unknown) =>
  fetchWithLogsSpy.mockImplementation((path: any, config: any, onRedirectToLogin: any) =>
    path?.endpoint === endpoint
      ? Promise.resolve(response as any)
      : actualFetchWithLogs(path, config, onRedirectToLogin)
  );

export const callsTo = (endpoint: string) =>
  fetchWithLogsSpy.mock.calls.filter((call: any) => call[0]?.endpoint === endpoint);

export const phaseOutProductResponse = (productId: string = PRODUCT_IDS.PAGOPA) => ({
  data: { id: productId, title: 'Piattaforma pagoPA', status: 'PHASE_OUT' },
  status: 200,
});
