import { vi } from 'vitest';
import { fetchMockedData, MockedCallOptions } from '../../lib/mocked-api-utils';

export const PartyRegistryProxyApi = {
  getTaxonomiesByQuery: vi.fn((query: string) =>
    fetchMockedData('ONBOARDING_GET_GEOTAXONOMY', { params: { description: query } })
  ),
  getLocationByCode: vi.fn((geotaxId: string) =>
    fetchMockedData('ONBOARDING_GET_LOCATION_BY_ISTAT_CODE', {
      endpointParams: { geoTaxId: geotaxId },
    })
  ),
  findInstitution: vi.fn((id: string, origin?: string, categories?: string) =>
    fetchMockedData('ONBOARDING_GET_PARTY_FROM_CF', {
      endpointParams: { id },
      params: { origin, categories },
    })
  ),
  getUoInfo: vi.fn((codiceUniUo: string) =>
    fetchMockedData('ONBOARDING_GET_UO_CODE_INFO', { endpointParams: { codiceUniUo } })
  ),
  getUoList: vi.fn((taxCodeInvoicing: string) =>
    fetchMockedData('ONBOARDING_GET_UO_LIST', { params: { taxCodeInvoicing } })
  ),
  searchInstitutions: vi.fn((params: MockedCallOptions['params']) =>
    fetchMockedData('ONBOARDING_GET_SEARCH_PARTIES', { params })
  ),
  searchSaParties: vi.fn((params: MockedCallOptions['params']) =>
    fetchMockedData('ONBOARDING_GET_SA_PARTIES_NAME', { params })
  ),
  searchInsuranceCompanies: vi.fn((params: MockedCallOptions['params']) =>
    fetchMockedData('ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME', { params })
  ),
  getAooInfo: vi.fn((codiceUniAoo: string) =>
    fetchMockedData('ONBOARDING_GET_AOO_CODE_INFO', { endpointParams: { codiceUniAoo } })
  ),
  getSaPartyByTaxId: vi.fn((taxId: string) =>
    fetchMockedData('ONBOARDING_GET_SA_PARTY_FROM_FC', { endpointParams: { taxId } })
  ),
  getInsuranceByTaxId: vi.fn((taxId: string) =>
    fetchMockedData('ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE', {
      endpointParams: { taxId },
    })
  ),
  getInfocamereByTaxCode: vi.fn((taxCode: string) =>
    fetchMockedData('ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE', {
      endpointParams: { id: taxCode },
    })
  ),
  getVisuraByTaxCode: vi.fn((taxCode: string) =>
    fetchMockedData('ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF', {
      endpointParams: { id: taxCode },
    })
  ),
  getVisuraByRea: vi.fn((rea: string) =>
    fetchMockedData('ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA', { params: { rea } })
  ),
};
