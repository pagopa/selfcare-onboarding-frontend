import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { CheckManagerResponse } from './generated/onboarding/CheckManagerResponse';
import { WithDefaultsT, createClient } from './generated/onboarding/client';
import { OnboardingRequestResource } from './generated/onboarding/OnboardingRequestResource';
import { OnboardingVerify } from './generated/onboarding/OnboardingVerify';
import { CheckManagerDto } from './generated/onboarding/CheckManagerDto';
import { UserTaxCodeDto } from './generated/onboarding/UserTaxCodeDto';
import { UserId } from './generated/onboarding/UserId';

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

export const OnboardingApi = {
  retrieveOnboardingRequest: async (onboardingId: string): Promise<OnboardingRequestResource> => {
    const result = await apiClient.retrieveOnboardingRequestUsingGET({ onboardingId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  verifyOnboarding: async (onboardingId: string): Promise<OnboardingVerify> => {
    const result = await apiClient.verifyOnboardingUsingPOST({ onboardingId });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  userValidate: async (name: string, surname: string, taxCode: string): Promise<void> => {
    const result = await apiClient.validateUsingPOST({ body: { name, surname, taxCode } });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
  verifyRecipientCode: async (originId: string, recipientCode: string): Promise<string> => {
    const result = await apiClient.checkRecipientCodeUsingGET({ originId, recipientCode });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  checkManager: async (body: CheckManagerDto): Promise<CheckManagerResponse> => {
    const result = await apiClient.checkManager({ body });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  searchUserId: async (body: UserTaxCodeDto): Promise<UserId> => {
    const result = await apiClient.searchUserId({ body });
    return extractResponse(result, 200, onRedirectToLogin, 401, 403, undefined);
  },
  deleteOnboardingRequest: async (OnboardingId: string): Promise<void> => {
    const result = await apiClient.deleteUsingDELETE({ onboardingId: OnboardingId });
    return extractResponse(result, 204, onRedirectToLogin, 401, 403, undefined);
  },
};
