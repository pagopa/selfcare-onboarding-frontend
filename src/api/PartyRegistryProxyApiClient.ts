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
import { AOOResource } from './generated/party-registry-proxy/AOOResource';
import { GeographicTaxonomyResource } from './generated/party-registry-proxy/GeographicTaxonomyResource';
import { InstitutionResource } from './generated/party-registry-proxy/InstitutionResource';
import { InstitutionsResource } from './generated/party-registry-proxy/InstitutionsResource';
import { InsuranceCompaniesResource } from './generated/party-registry-proxy/InsuranceCompaniesResource';
import { InsuranceCompanyResource } from './generated/party-registry-proxy/InsuranceCompanyResource';
import { PDNDBusinessResource } from './generated/party-registry-proxy/PDNDBusinessResource';
import { StationResource } from './generated/party-registry-proxy/StationResource';
import { StationsResource } from './generated/party-registry-proxy/StationsResource';
import { UOResource } from './generated/party-registry-proxy/UOResource';
import { UOsResource } from './generated/party-registry-proxy/UOsResource';

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
const fetchWithLogsCall = async (
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
      return fetchWithLogsCall('ONBOARDING_GET_GEOTAXONOMY', { params: { description: query } });
    }
    const result = await apiClient.retrieveGeoTaxonomiesByDescriptionUsingGET({
      description: query,
    });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getLocationByCode: async (geotaxId: string): Promise<GeographicTaxonomyResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_LOCATION_BY_ISTAT_CODE', {
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
      return fetchWithLogsCall('ONBOARDING_GET_PARTY_FROM_CF', {
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
      return fetchWithLogsCall('ONBOARDING_GET_UO_CODE_INFO', { endpointParams: { codiceUniUo } });
    }
    const result = await apiClient.findByUnicodeUsingGET_1({ codiceUniAoo: codiceUniUo });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  getUoList: async (taxCodeInvoicing: string): Promise<UOsResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_UO_LIST', { params: { taxCodeInvoicing } });
    }
    const result = await apiClient.findAllUsingGET_1({ taxCodeInvoicing });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  searchInstitutions: async (params: {
    search?: string;
    page?: number;
    limit?: number;
    categories?: string;
  }): Promise<InstitutionsResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_SEARCH_PARTIES', { params });
    }
    const result = await apiClient.searchUsingGET(params);
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  searchSaParties: async (params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<StationsResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_SA_PARTIES_NAME', { params });
    }
    const result = await apiClient.searchUsingGET_2(params);
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  searchInsuranceCompanies: async (params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<InsuranceCompaniesResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME', { params });
    }
    const result = await apiClient.searchUsingGET_1(params);
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  getAooInfo: async (codiceUniAoo: string, categories?: string): Promise<AOOResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_AOO_CODE_INFO', { endpointParams: { codiceUniAoo } });
    }
    const result = await apiClient.findByUnicodeUsingGET({ codiceUniAoo, categories });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  getSaPartyByTaxId: async (taxId: string): Promise<StationResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_SA_PARTY_FROM_FC', { endpointParams: { taxId } });
    }
    const result = await apiClient.searchByTaxCodeUsingGET_1({ taxId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  getInsuranceByTaxId: async (taxId: string): Promise<InsuranceCompanyResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE', {
        endpointParams: { taxId },
      });
    }
    const result = await apiClient.searchByTaxCodeUsingGET({ taxId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  getInfocamereByTaxCode: async (taxCode: string): Promise<PDNDBusinessResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE', {
        endpointParams: { id: taxCode },
      });
    }
    const result = await apiClient.institutionPdndByTaxCodeUsingGET({ taxCode });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  getVisuraByTaxCode: async (taxCode: string): Promise<PDNDBusinessResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF', {
        endpointParams: { id: taxCode },
      });
    }
    const result = await apiClient.institutionVisuraPdndByTaxCodeUsingGET({ taxCode });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  getVisuraByRea: async (rea: string): Promise<PDNDBusinessResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA', { params: { rea } });
    }
    const result = await apiClient.institutionsPdndByReaGET({ rea });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
};
