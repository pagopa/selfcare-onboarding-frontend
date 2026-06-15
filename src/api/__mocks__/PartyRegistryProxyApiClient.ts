/* eslint-disable functional/immutable-data */
import { vi } from 'vitest';
import { fetchWithLogs } from '../../lib/api-utils';

const callViaFetchWithLogs = async (
    endpoint: string,
    options: { endpointParams?: any; params?: any; data?: any; method?: string } = {}
) => {
    const r = await fetchWithLogs(
        { endpoint: endpoint as any, endpointParams: options.endpointParams ?? {} },
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
};
