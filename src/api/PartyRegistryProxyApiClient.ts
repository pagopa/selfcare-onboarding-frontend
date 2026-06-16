import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { fetchWithLogs } from '../lib/api-utils';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { isMockEnvironment } from '../utils/institutionTypeUtils';
import { createClient, WithDefaultsT } from './generated/party-registry-proxy/client';
import { GeographicTaxonomyResource } from './generated/party-registry-proxy/GeographicTaxonomyResource';
import { InstitutionResource } from './generated/party-registry-proxy/InstitutionResource';
import { UOResource } from './generated/party-registry-proxy/UOResource';

const withBearerAuth: WithDefaultsT<'bearerAuth'> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    bearerAuth: `Bearer ${token}`,
  });
};

const apiClient = createClient({
  baseUrl: ENV.URL_API.PARTY_REGISTRY_PROXY,
  basePath: '',
  fetchApi: buildFetchApi(),
  withDefaults: withBearerAuth,
});

const onRedirectToLogin = () =>
  store.dispatch(
    appStateActions.addError({
      id: 'tokenNotValid',
      error: new Error(),
      techDescription: 'token expired or not valid',
      toNotify: false,
      blocking: false,
      displayableTitle: i18n.t('session.expired.title'),
      displayableDescription: i18n.t('session.expired.message'),
    })
  );

/* istanbul ignore next */
const mockApiCall = async (
  endpoint: string,
  options: { endpointParams?: any; params?: any; data?: any; method?: string } = {}
): Promise<any> => {
  const r = await fetchWithLogs(
    { endpoint: endpoint as any, endpointParams: options.endpointParams ?? {} },
    { params: options.params, data: options.data, method: options.method ?? 'GET' } as any,
    () => undefined
  );
  if ((r as any).isAxiosError) {
    const error = new Error(`HTTP ${(r as any).response?.status}`);
    // eslint-disable-next-line functional/immutable-data
    (error as any).httpStatus = (r as any).response?.status;
    // eslint-disable-next-line functional/immutable-data
    (error as any).httpBody = (r as any).response?.data;
    throw error;
  }
  return (r as any).data;
};

export const PartyRegistryProxyApi = {
  getTaxonomiesByQuery: async (query: string): Promise<Array<GeographicTaxonomyResource>> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return mockApiCall('ONBOARDING_GET_GEOTAXONOMY', { params: { description: query } });
    }
    const result = await apiClient.retrieveGeoTaxonomiesByDescriptionUsingGET({
      description: query,
    });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getLocationByCode: async (geotaxId: string): Promise<GeographicTaxonomyResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return mockApiCall('ONBOARDING_GET_LOCATION_BY_ISTAT_CODE', {
        endpointParams: { geoTaxId: geotaxId },
      });
    }
    const result = await apiClient.retrieveGeoTaxonomiesByCodeUsingGET({ geotaxId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  findInstitution: async (
    id: string,
    origin?: string,
    categories?: string
  ): Promise<InstitutionResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return mockApiCall('ONBOARDING_GET_PARTY_FROM_CF', {
        endpointParams: { id },
        params: { origin, categories },
      });
    }
    const result = await apiClient.findInstitutionUsingGET({ id, origin, categories });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  getUoInfo: async (codiceUniUo: string): Promise<UOResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return mockApiCall('ONBOARDING_GET_UO_CODE_INFO', { endpointParams: { codiceUniUo } });
    }
    const result = await apiClient.findByUnicodeUsingGET_1({ codiceUniAoo: codiceUniUo });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
};
