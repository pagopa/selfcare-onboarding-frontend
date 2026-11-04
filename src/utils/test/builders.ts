import { type MockInstance, vi } from 'vitest';
import type { Party, Product, UserOnCreate } from '../../../types';
import type { InstitutionInfo } from '../../api/generated/onboarding/InstitutionInfo';
import type { OnboardingRequestResource } from '../../api/generated/onboarding/OnboardingRequestResource';
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

export const buildInstitutionInfo = (
  overrides: Partial<InstitutionInfo> = {}
): InstitutionInfo => ({
  address: 'Piazza della Scala, 2',
  fiscalCode: '01199250158',
  institutionType: 'PA',
  mailAddress: 'protocollo@postacert.comune.milano.it',
  name: 'Comune di Milano',
  vatNumber: '01199250158',
  zipCode: '20121',
  ...overrides,
});

export const buildOnboardingRequestResource = (
  overrides: Partial<OnboardingRequestResource> = {}
): OnboardingRequestResource => ({
  institutionInfo: buildInstitutionInfo(),
  status: 'PENDING',
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
