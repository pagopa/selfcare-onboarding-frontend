import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { InstitutionOnboardingInfoResource } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { RequiredDocument, RequiredDocumentsEnabled } from '../model/Documents';
import { ProductResource } from '../model/ProductResource';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { isMockEnvironment } from '../utils/institutionTypeUtils';
import { CheckManagerDto } from './generated/onboarding/CheckManagerDto';
import { CheckManagerResponse } from './generated/onboarding/CheckManagerResponse';
import { WithDefaultsT, createClient } from './generated/onboarding/client';
import { GeographicTaxonomyResource } from './generated/onboarding/GeographicTaxonomyResource';
import { InstitutionResourceArray } from './generated/onboarding/InstitutionResourceArray';
import { OnboardingProductDto } from './generated/onboarding/OnboardingProductDto';
import { OnboardingRequestResource } from './generated/onboarding/OnboardingRequestResource';
import { OnboardingUserDto } from './generated/onboarding/OnboardingUserDto';
import { OnboardingVerify } from './generated/onboarding/OnboardingVerify';
import { OriginResponse } from './generated/onboarding/OriginResponse';
import { ProductResourceArray } from './generated/onboarding/ProductResourceArray';
import { UserId } from './generated/onboarding/UserId';
import { UserTaxCodeDto } from './generated/onboarding/UserTaxCodeDto';
import { VerifyAggregatesResponse } from './generated/onboarding/VerifyAggregatesResponse';

const withBearerAuth: WithDefaultsT<'bearerAuth'> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    bearerAuth: `Bearer ${token}`,
  });
};

const apiClient = createClient({
  baseUrl: ENV.URL_API.ONBOARDING_V2,
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
// Generic wrapper around fetchWithLogs/axios. Despite the (legacy) usage inside
// isMockEnvironment branches, it is NOT mock-specific: fetchWithLogs itself routes
// mock vs real, so this works against the real backend too. Used for endpoints the
// openapi-codegen-ts client cannot handle (e.g. HEAD) and for the mock branches.
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
    // eslint-disable-next-line functional/no-let
    const error = new Error(`HTTP ${(r as any).response?.status}`);
    // eslint-disable-next-line functional/immutable-data
    (error as any).httpStatus = (r as any).response?.status;
    // eslint-disable-next-line functional/immutable-data
    (error as any).httpBody = (r as any).response?.data;
    throw error;
  }
  return (r as any).data;
};

export const OnboardingApi = {
  retrieveOnboardingRequest: async (onboardingId: string): Promise<OnboardingRequestResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_INFO', { endpointParams: { onboardingId } });
    }
    const result = await apiClient.retrieveOnboardingRequestUsingGET({ onboardingId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  verifyOnboarding: async (onboardingId: string): Promise<OnboardingVerify> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_TOKEN_VALIDATION', { endpointParams: { onboardingId } });
    }
    const result = await apiClient.verifyOnboardingUsingPOST({ onboardingId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  userValidate: async (name: string, surname: string, taxCode: string): Promise<void> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_USER_VALIDATION', {
        data: { name, surname, taxCode },
        method: 'POST',
      });
    }
    const result = await apiClient.validateUsingPOST({ body: { name, surname, taxCode } });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  verifyRecipientCode: async (originId: string, recipientCode: string): Promise<string> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_RECIPIENT_CODE_VALIDATION', {
        params: { recipientCode, originId },
      });
    }
    const result = await apiClient.checkRecipientCodeUsingGET({ originId, recipientCode });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  checkManager: async (body: CheckManagerDto): Promise<CheckManagerResponse> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_CHECK_MANAGER', { data: body, method: 'POST' });
    }
    const result = await apiClient.checkManager({ body });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  searchUserId: async (body: UserTaxCodeDto): Promise<UserId> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_SEARCH_USER', { data: body, method: 'POST' });
    }
    const result = await apiClient.searchUserId({ body });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  deleteOnboardingRequest: async (OnboardingId: string): Promise<void> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_COMPLETE_REGISTRATION', {
        endpointParams: { token: OnboardingId },
        method: 'DELETE',
      });
    }
    const result = await apiClient.deleteUsingDELETE({ onboardingId: OnboardingId });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  getInstitutions: async (productId?: string): Promise<InstitutionResourceArray> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_USER_PARTIES', { params: { productId } });
    }
    const result = await apiClient.getInstitutionsUsingGET({ productId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getPreviousGeotaxonomy: async (
    taxCode: string,
    subunitCode?: string
  ): Promise<GeographicTaxonomyResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_PREVIOUS_GEOTAXONOMIES', {
        params: { taxCode, subunitCode },
      });
    }
    const result = await apiClient.getGeographicTaxonomiesByTaxCodeAndSubunitCodeUsingGET({
      taxCode,
      subunitCode,
    });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getOnboardingData: async (
    institutionId: string,
    productId: string
  ): Promise<InstitutionOnboardingInfoResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_ONBOARDING_DATA', {
        params: { institutionId, productId },
      });
    }
    const result = await apiClient.getInstitutionOnboardingInfoUsingGET({
      institutionId,
      productId,
    });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getProduct: async (id: string, institutionType?: string): Promise<ProductResource> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_VERIFY_PRODUCT', {
        endpointParams: { productId: id },
        params: { institutionType },
      });
    }
    const result = await apiClient.getProductUsingGET({ id, institutionType });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  onboardingUsers: async (body: OnboardingUserDto): Promise<void> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_NEW_USER', { data: body, method: 'POST' });
    }
    const result = await apiClient.onboardingUsers({ body });
    return extractResponse(result, 201, onRedirectToLogin, 401, 403, undefined);
  },
  getProductsAdmin: async (): Promise<ProductResourceArray> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_ALLOWED_ADD_USER_PRODUCTS', {});
    }
    const result = await apiClient.getProductsAdmin({});
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getOrigins: async (productId: string): Promise<OriginResponse> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_INSTITUTION_TYPE_BY_PRODUCT', {
        params: { productId },
      });
    }
    const result = await apiClient.getOrigins({ productId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  completeOnboardingContract: async (onboardingId: string, contract: File): Promise<void> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      const formData = new FormData();
      formData.append('contract', contract);
      return fetchWithLogsCall('ONBOARDING_COMPLETE_REGISTRATION', {
        endpointParams: { token: onboardingId },
        data: formData,
        method: 'POST',
      });
    }
    const result = await apiClient.completeUsingPOST({ onboardingId, contract });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  completeUsersOnboardingContract: async (onboardingId: string, contract: File): Promise<void> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      const formData = new FormData();
      formData.append('contract', contract);
      return fetchWithLogsCall('USER_COMPLETE_REGISTRATION', {
        endpointParams: { token: onboardingId },
        data: formData,
        method: 'POST',
      });
    }
    const result = await apiClient.completeOnboardingUsersUsingPOST({ onboardingId, contract });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  uploadAttachment: async (
    onboardingId: string,
    attachmentName: string,
    attachment: File
  ): Promise<void> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      const formData = new FormData();
      formData.append('attachment', attachment);
      return fetchWithLogsCall('ONBOARDING_POST_ATTACHMENT', {
        endpointParams: { onboardingId, filename: attachmentName },
        data: formData,
        method: 'POST',
      });
    }
    const result = await apiClient.uploadAttachmentUsingPOST({
      onboardingId,
      attachmentName,
      attachment,
    });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  onboardingInstitution: async (body: OnboardingProductDto): Promise<void> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_POST_LEGALS', { data: body, method: 'POST' });
    }
    const result = await apiClient.institutionOnboarding({ body });
    return extractResponse(result, 201, onRedirectToLogin, 401, 403, undefined);
  },
  getInstitutionsByFilters: async (params: {
    productId: string;
    taxCode?: string;
    origin?: string;
    originId?: string;
    subunitCode?: string;
  }): Promise<InstitutionResourceArray> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      return fetchWithLogsCall('ONBOARDING_GET_INSTITUTIONS', { params });
    }
    const result = await apiClient.v2GetInstitutionByFilters(params);
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  verifyAggregatesCsv: async (
    aggregates: File,
    productId: string,
    institutionType?: string
  ): Promise<VerifyAggregatesResponse> => {
    /* istanbul ignore if */
    if (isMockEnvironment()) {
      const formData = new FormData();
      formData.append('aggregates', aggregates);
      return fetchWithLogsCall('ONBOARDING_VERIFY_AGGREGATES', {
        params: { institutionType, productId },
        data: formData,
        method: 'POST',
      });
    }
    const result = await apiClient.verifyAggregatesCsvUsingPOST({
      aggregates,
      productId,
      institutionType,
    });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  // HEAD /v1/institutions/onboarding (verifyOnboardingUsingHEAD). Success is 204
  // (already onboarded), 404 means not onboarded.
  // NOTE: this endpoint cannot go through the openapi-codegen-ts client: ts-commons'
  // createFetchRequestForApi treats only GET/DELETE as body-less and attaches a body
  // to any other method, which breaks HEAD (the request rejects with no httpStatus,
  // so the 404 "not onboarded" case is wrongly handled as a generic error). We route
  // it through fetchWithLogs/axios, which handles HEAD in both mock and real envs and
  // rejects with an httpStatus-bearing error that callers inspect via getErrorStatus.
  verifyOnboardingExternal: async (params: {
    taxCode?: string;
    subunitCode?: string;
    productId?: string;
    origin?: string;
    originId?: string;
    vatNumber?: string;
    institutionType?: string;
    verifyType?: string;
  }): Promise<void> => fetchWithLogsCall('VERIFY_ONBOARDING', { params, method: 'HEAD' }),
  getRequiredDocumentsEnabled: async (
    productId: string,
    institutionType: string,
    origin: string
  ): Promise<RequiredDocumentsEnabled> => {
    const data = await fetchWithLogsCall('REQUIRED_DOCUMENTS_ENABLED', {
      endpointParams: { productId },
      params: { institutionType, origin },
    });
    return data?.requiredDocumentsEnabled ?? false;
  },

  getRequiredDocuments: async (
    productId: string,
    institutionType: string,
    origin: string
  ): Promise<Array<RequiredDocument>> =>
    fetchWithLogsCall('GET_REQUIRED_DOCUMENTS', {
      endpointParams: { productId },
      params: { institutionType, origin },
    }),
};
