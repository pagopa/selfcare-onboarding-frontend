import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { WithDefaultsT, createClient } from './generated/onboarding/client';
import { OnboardingRequestResource } from './generated/onboarding/OnboardingRequestResource';
import { OnboardingVerify } from './generated/onboarding/OnboardingVerify';

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
    return extractResponse(result, 200, onRedirectToLogin);
  },
  verifyOnboarding: async (onboardingId: string): Promise<OnboardingVerify> => {
    const result = await apiClient.verifyOnboardingUsingPOST({ onboardingId });
    return extractResponse(result, 200, onRedirectToLogin);
  },
  userValidate: async (name: string, surname: string, taxCode: string): Promise<void> => {
    const result = await apiClient.validateUsingPOST({ body: { name, surname, taxCode } });
    return extractResponse(result, 204, onRedirectToLogin);
  },
};
