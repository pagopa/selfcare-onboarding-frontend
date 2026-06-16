import axios from 'axios';
import { afterAll, beforeAll, beforeEach, type Mocked, type MockInstance, vi } from 'vitest';
import { mockedCategories } from '../../../../lib/__mocks__/mockApiRequests';

export const initialLocation = {
  assign: vi.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '?pricingPlan=FA',
  hash: '',
  state: undefined,
};

export const mockedLocation = Object.assign({}, initialLocation);
export const mockedHistoryPush = vi.fn();
export const mockedAxios = axios as Mocked<typeof axios>;

const oldWindowLocation = window.location;
export let fetchWithLogsSpy: MockInstance;

export function setupTestHooks(extraBeforeEach?: () => Promise<void> | void): void {
  beforeAll(() => {
    Object.defineProperty(window, 'location', { value: mockedLocation });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', { value: oldWindowLocation });
  });

  beforeEach(async () => {
    const apiUtils = await import('../../../../lib/api-utils');
    if (fetchWithLogsSpy) {
      fetchWithLogsSpy.mockRestore();
    }
    fetchWithLogsSpy = vi.spyOn(apiUtils, 'fetchWithLogs');
    Object.assign(mockedLocation, initialLocation);
    mockedAxios.get.mockResolvedValue({ status: 200, data: mockedCategories });
    await extraBeforeEach?.();
  });
}
