import axios from 'axios';
import { afterAll, beforeAll, beforeEach, type Mock, type Mocked, vi } from 'vitest';
import { mockedCategories } from '../../../../lib/__mocks__/mockApiRequests';
import { type FetchWithLogsSpy, mockFetchWithLogs } from '../../../../utils/test/builders';

type MockedLocation = Pick<Location, 'pathname' | 'origin' | 'search' | 'hash'> & {
  assign: Mock<Location['assign']>;
  state: unknown;
};

export const initialLocation: MockedLocation = {
  assign: vi.fn<Location['assign']>(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '?pricingPlan=FA',
  hash: '',
  state: undefined,
};

export const mockedLocation: MockedLocation = Object.assign({}, initialLocation);
export const mockedHistoryPush = vi.fn();
export const mockedAxios = axios as Mocked<typeof axios>;

const oldWindowLocation = window.location;
export let fetchWithLogsSpy: FetchWithLogsSpy;

export function setupTestHooks(extraBeforeEach?: () => Promise<void> | void): void {
  beforeAll(() => {
    Object.defineProperty(window, 'location', { value: mockedLocation });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', { value: oldWindowLocation });
  });

  beforeEach(async () => {
    if (fetchWithLogsSpy) {
      fetchWithLogsSpy.mockRestore();
    }
    fetchWithLogsSpy = mockFetchWithLogs();
    Object.assign(mockedLocation, initialLocation);
    mockedAxios.get.mockResolvedValue({ status: 200, data: mockedCategories });
    await extraBeforeEach?.();
  });
}
