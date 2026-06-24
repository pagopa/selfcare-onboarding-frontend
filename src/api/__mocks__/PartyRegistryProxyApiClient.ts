/* eslint-disable functional/immutable-data */
import { vi } from 'vitest';
import { fetchWithLogs } from '../../lib/api-utils';

const callViaFetchWithLogs = async (
    endpoint: string,
    options: { endpointParams?: any; params?: any; data?: any; method?: string } = {}
) => {
    const r = await fetchWithLogs(
        {
            endpoint: endpoint as any,
            ...(options.endpointParams !== undefined ? { endpointParams: options.endpointParams } : {}),
        },
        { params: options.params, data: options.data, method: options.method ?? 'GET' } as any,
        () => undefined
    );
    if ((r as any).isAxiosError) {
        const error = new Error(`HTTP ${(r as any).response?.status}`);
        (error as any).httpStatus = (r as any).response?.status;
        (error as any).httpBody = (r as any).response?.data;
        throw error;
    }
    return (r as any).data;
};

export const PartyRegistryProxyApi = {
    getTaxonomiesByQuery: vi.fn((query: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_GEOTAXONOMY', { params: { description: query } })
    ),
    getLocationByCode: vi.fn((geotaxId: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_LOCATION_BY_ISTAT_CODE', {
            endpointParams: { geoTaxId: geotaxId },
        })
    ),
    findInstitution: vi.fn((id: string, origin?: string, categories?: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_PARTY_FROM_CF', {
            endpointParams: { id },
            params: { origin, categories },
        })
    ),
    getUoInfo: vi.fn((codiceUniUo: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_UO_CODE_INFO', { endpointParams: { codiceUniUo } })
    ),
    getUoList: vi.fn((taxCodeInvoicing: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_UO_LIST', { params: { taxCodeInvoicing } })
    ),
    searchInstitutions: vi.fn((params: any) =>
        callViaFetchWithLogs('ONBOARDING_GET_SEARCH_PARTIES', { params })
    ),
    searchSaParties: vi.fn((params: any) =>
        callViaFetchWithLogs('ONBOARDING_GET_SA_PARTIES_NAME', { params })
    ),
    searchInsuranceCompanies: vi.fn((params: any) =>
        callViaFetchWithLogs('ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME', { params })
    ),
    getAooInfo: vi.fn((codiceUniAoo: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_AOO_CODE_INFO', { endpointParams: { codiceUniAoo } })
    ),
    getSaPartyByTaxId: vi.fn((taxId: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_SA_PARTY_FROM_FC', { endpointParams: { taxId } })
    ),
    getInsuranceByTaxId: vi.fn((taxId: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE', {
            endpointParams: { taxId },
        })
    ),
    getInfocamereByTaxCode: vi.fn((taxCode: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE', {
            endpointParams: { id: taxCode },
        })
    ),
    getVisuraByTaxCode: vi.fn((taxCode: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF', {
            endpointParams: { id: taxCode },
        })
    ),
    getVisuraByRea: vi.fn((rea: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA', { params: { rea } })
    ),
};
