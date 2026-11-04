import { type MockInstance, vi } from 'vitest';
import type { Party, Product, UserOnCreate } from '../../../types';
import { type ProductResource, StatusEnum } from '../../api/generated/onboarding/ProductResource';
import * as apiUtils from '../../lib/api-utils';

/** Typed spy on `fetchWithLogs`, the single entry point of every onboarding API call. */
export type FetchWithLogsSpy = MockInstance<typeof apiUtils.fetchWithLogs>;

export type FetchWithLogsCall = Parameters<typeof apiUtils.fetchWithLogs>;

/** Spies on the `fetchWithLogs` export (calls go through to the real or mocked implementation). */
export const mockFetchWithLogs = (): FetchWithLogsSpy => vi.spyOn(apiUtils, 'fetchWithLogs');

export const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-io',
  title: 'App IO',
  status: 'ACTIVE',
  ...overrides,
});

export const buildProductResource = (
  overrides: Partial<ProductResource> = {}
): ProductResource => ({
  id: 'prod-io',
  title: 'App IO',
  status: StatusEnum.ACTIVE,
  ...overrides,
});

export const buildUser = (overrides: Partial<UserOnCreate> = {}): UserOnCreate => ({
  uid: '0',
  name: 'Mattia',
  surname: 'Sisti',
  taxCode: 'SSTMTT76C23F205T',
  email: 'a@a.aa',
  ...overrides,
});

export const buildParty = (overrides: Partial<Party> = {}): Party => ({
  originId: 'c_f205',
  externalId: '01199250158',
  registeredOffice: 'Piazza della Scala, 2',
  zipCode: '20121',
  description: 'Comune di Milano',
  digitalAddress: 'protocollo@postacert.comune.milano.it',
  taxCode: '01199250158',
  origin: 'IPA',
  ...overrides,
});
