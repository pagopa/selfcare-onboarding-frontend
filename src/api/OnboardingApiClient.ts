import axios, { AxiosError } from 'axios';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { InstitutionOnboardingInfoResource } from '../../types';
import { RequiredDocument, RequiredDocumentsEnabled } from '../model/Documents';
import { ProductResource } from '../model/ProductResource';
import { HttpError } from '../lib/error-utils';
import { store } from '../redux/store';
import { API } from '../utils/constants';
import { ENV } from '../utils/env';
import { isMockEnvironment } from '../utils/institutionTypeUtils';
import { CheckManagerDto } from './generated/onboarding/CheckManagerDto';
import { CheckManagerResponse } from './generated/onboarding/CheckManagerResponse';
import { WithDefaultsT, createClient } from './generated/onboarding/client';
import { GeographicTaxonomyResource } from './generated/onboarding/GeographicTaxonomyResource';
import { InstitutionResourceArray } from './generated/onboarding/InstitutionResourceArray';
import { IpaInstitutionsSearchResource } from './generated/onboarding/IpaInstitutionsSearchResource';
import { OnboardingProductDto } from './generated/onboarding/OnboardingProductDto';
import { OnboardingRequestResource } from './generated/onboarding/OnboardingRequestResource';
import { OnboardingResult } from './generated/onboarding/OnboardingResult';
import { OnboardingUserDto } from './generated/onboarding/OnboardingUserDto';
import { OnboardingVerify } from './generated/onboarding/OnboardingVerify';
import { OriginResponse } from './generated/onboarding/OriginResponse';
import { ProductResourceArray } from './generated/onboarding/ProductResourceArray';
import { UserId } from './generated/onboarding/UserId';
import { UserTaxCodeDto } from './generated/onboarding/UserTaxCodeDto';
import { VerifyAggregatesResponse } from './generated/onboarding/VerifyAggregatesResponse';
import { IpaInstitutionResource } from './generated/onboarding/IpaInstitutionResource';
import { ApiClientMocked } from './__mocks__/OnboardingApiClient';

const withBearerAuth: WithDefaultsT<'bearerAuth'> = (wrappedOperation) => (params) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    bearerAuth: `Bearer ${token}`,
  });
};

const realApiClient = createClient({
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
export const OnboardingApi = {
  retrieveOnboardingRequest: async (onboardingId: string): Promise<OnboardingRequestResource> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.retrieveOnboardingRequest(onboardingId)
      : await realApiClient.retrieveOnboardingRequestUsingGET({ onboardingId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  verifyOnboarding: async (onboardingId: string): Promise<OnboardingVerify> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.verifyOnboarding(onboardingId)
      : await realApiClient.verifyOnboardingUsingPOST({ onboardingId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, null);
  },
  userValidate: async (name: string, surname: string, taxCode: string): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.userValidate({ name, surname, taxCode })
      : await realApiClient.validateUsingPOST({ body: { name, surname, taxCode } });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  verifyRecipientCode: async (originId: string, recipientCode: string): Promise<string> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.verifyRecipientCode(originId, recipientCode)
      : await realApiClient.checkRecipientCodeUsingGET({ originId, recipientCode });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  checkManager: async (body: CheckManagerDto): Promise<CheckManagerResponse> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.checkManager(body)
      : await realApiClient.checkManager({ body });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  searchUserId: async (body: UserTaxCodeDto): Promise<UserId> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.searchUserId(body)
      : await realApiClient.searchUserId({ body });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  deleteOnboardingRequest: async (OnboardingId: string): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.deleteOnboardingRequest(OnboardingId)
      : await realApiClient.deleteUsingDELETE({ onboardingId: OnboardingId });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  getInstitutions: async (productId?: string): Promise<InstitutionResourceArray> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getInstitutions(productId)
      : await realApiClient.getInstitutionsUsingGET({ productId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getPreviousGeotaxonomy: async (
    taxCode: string,
    subunitCode?: string
  ): Promise<GeographicTaxonomyResource> => {
    /* istanbul ignore if */
    const result = isMockEnvironment()
      ? await ApiClientMocked.getPreviousGeotaxonomies(taxCode, subunitCode)
      : await realApiClient.getGeographicTaxonomiesByTaxCodeAndSubunitCodeUsingGET({
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
    const result = isMockEnvironment()
      ? await ApiClientMocked.getOnboardingData(institutionId, productId)
      : await realApiClient.getInstitutionOnboardingInfoUsingGET({
          institutionId,
          productId,
        });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getProduct: async (id: string, institutionType?: string): Promise<ProductResource> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getProduct(id, institutionType)
      : await realApiClient.getProductUsingGET({ id, institutionType });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  onboardingUsers: async (body: OnboardingUserDto): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.onboardingUsers(body)
      : await realApiClient.onboardingUsers({ body });
    return extractResponse(result, 201, onRedirectToLogin, 401, 403, undefined);
  },
  getProductsAdmin: async (): Promise<ProductResourceArray> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getProductsAdmin()
      : await realApiClient.getProductsAdmin({});
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  getOrigins: async (productId: string): Promise<OriginResponse> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getOrigins(productId)
      : await realApiClient.getOrigins({ productId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  completeOnboardingContract: async (onboardingId: string, contract: File): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.completeOnboardingContract(onboardingId, contract)
      : await realApiClient.completeUsingPOST({ onboardingId, contract });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  completeUsersOnboardingContract: async (onboardingId: string, contract: File): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.completeUsersOnboardingContract(onboardingId, contract)
      : await realApiClient.completeOnboardingUsersUsingPOST({ onboardingId, contract });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  uploadAttachment: async (
    onboardingId: string,
    attachmentName: string,
    attachment: File,
    attachmentId?: string,
    attachmentDescription?: string
  ): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.uploadAttachment(
          onboardingId,
          attachmentName,
          attachment,
          attachmentId,
          attachmentDescription
        )
      : await realApiClient.uploadAttachmentUsingPOST({
          onboardingId,
          attachmentName,
          attachment,
          attachmentId,
          attachmentDescription,
        });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  onboardingInstitution: async (body: OnboardingProductDto): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.onboardingInstitution(body)
      : await realApiClient.institutionOnboarding({ body });
    return extractResponse(result, 201, onRedirectToLogin, 401, 403, undefined);
  },
  getInstitutionsByFilters: async (params: {
    productId: string;
    taxCode?: string;
    origin?: string;
    originId?: string;
    subunitCode?: string;
  }): Promise<InstitutionResourceArray> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getInstitutionsByFilters(params)
      : await realApiClient.v2GetInstitutionByFilters(params);
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  verifyAggregatesCsv: async (
    aggregates: File,
    productId: string,
    institutionType?: string
  ): Promise<VerifyAggregatesResponse> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.verifyAggregatesCsv(aggregates, productId, institutionType)
      : await realApiClient.verifyAggregatesCsvUsingPOST({
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
  // it through axios directly (real env) and rejects with an httpStatus-bearing error
  // that callers inspect via getErrorStatus. The mock env keeps using ApiClientMocked.
  verifyOnboardingExternal: async (params: {
    taxCode?: string;
    subunitCode?: string;
    productId?: string;
    origin?: string;
    originId?: string;
    vatNumber?: string;
    institutionType?: string;
    verifyType?: string;
  }): Promise<void> => {
    if (isMockEnvironment()) {
      return ApiClientMocked.verifyOnboardingExternal(params);
    }
    try {
      await axios.head(API.VERIFY_ONBOARDING.URL, {
        params,
        headers: { Authorization: `Bearer ${storageTokenOps.read()}` },
      });
    } catch (e) {
      const status = (e as AxiosError).response?.status;
      const error: HttpError = new Error(`HTTP ${status}`);
      // eslint-disable-next-line functional/immutable-data
      error.httpStatus = status;
      throw error;
    }
  },

  getRequiredDocumentsEnabled: async (
    productId: string,
    institutionType: string,
    origin: string
  ): Promise<RequiredDocumentsEnabled> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getRequiredDocumentsEnabled(productId, institutionType, origin)
      : await realApiClient.isRequiredDocumentsEnabled({
          productId,
          institutionType,
          origin,
        });
    const response = await extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
    return response as RequiredDocumentsEnabled;
  },
  getRequiredDocuments: async (
    productId: string,
    institutionType: string,
    origin: string
  ): Promise<Array<RequiredDocument>> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getRequiredDocuments(productId, institutionType, origin)
      : await realApiClient.getRequiredDocuments({ productId, institutionType, origin });
    const response = await extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
    return response as Array<RequiredDocument>;
  },
  getAttachmentStatus: async (onboardingId: string, name: string): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getAttachmentStatus(onboardingId, name)
      : await realApiClient.getAttachmentStatusUsingGET({ onboardingId, name });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  triggerOnboarding: async (onboardingId: string): Promise<void> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.triggerOnboarding(onboardingId)
      : await realApiClient.triggerOnboardingRequest({ onboardingId });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  getOnboardings: async (taxCode: string, status: string): Promise<Array<OnboardingResult>> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.getOnboardings(taxCode, status)
      : await realApiClient.getOnboardingInfo({ taxCode, status });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  searchInstitutionsIpa: async (params: {
    search?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<IpaInstitutionsSearchResource> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.searchInstitutionsIpa(params)
      : await realApiClient.searchIpaInstitutionsUsingGET(params);
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },

  searchInstitutionIpaByTaxCode: async (
    taxCode: string,
    category?: string
  ): Promise<IpaInstitutionResource> => {
    const result = isMockEnvironment()
      ? await ApiClientMocked.searchInstitutionIpaByTaxCode(taxCode, category)
      : await realApiClient.findIpaInstitutionByTaxCodeUsingGET({ taxCode, category });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
};
