import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { AxiosResponse } from 'axios';
import { InstitutionType } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { WithDefaultsT, createClient } from './generated/onboarding/client';
import { VerifyAggregatesResponse } from './generated/onboarding/VerifyAggregatesResponse';

const withBearerAuth: WithDefaultsT<'bearerAuth'> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    bearerAuth: `Bearer ${token}`,
  });
};

const apiClient = createClient({
  baseUrl: ENV.URL_API.ONBOARDING,
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
  verifyAggregatesCsv: async (
    aggregates: File,
    productId: string,
    institutionType?: InstitutionType
  ): Promise<VerifyAggregatesResponse> => {
    const formData = new FormData();
    formData.append('aggregates', aggregates);

    const response = await fetchWithLogs(
      { endpoint: 'ONBOARDING_VERIFY_AGGREGATES' },
      {
        method: 'POST',
        data: formData,
        params: {
          productId,
          institutionType,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      onRedirectToLogin
    );

    return extractResponse((response as AxiosResponse).data, 200, onRedirectToLogin);
  },
};
