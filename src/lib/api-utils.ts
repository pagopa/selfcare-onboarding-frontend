import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import isEmpty from 'lodash/isEmpty';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { Endpoint, RequestConfig } from '../../types';
import { API } from '../utils/constants';
import { ENV } from '../utils/env';
import { isMockEnvironment } from '../utils/institutionTypeUtils';
import { mockFetch } from './__mocks__/mockApiRequests';
import { logAction, logError } from './action-log';

// Utility to wait some time
export const sleep = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));

// axios interceptor to always recuse the http status in error responses
axios.interceptors.response.use(

  (response) => response,

  (error: AxiosError) => {

    const isNetworkError = !error.response && (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ERR_CANCELED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.message?.includes('CORS')
    );

    if (isNetworkError) {
      // Network error: status not available
      console.warn('⚠️ NETWORK_ERROR: Status code unavailable (not FE fault)', {
        errorCode: error.code,
        errorMessage: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else if (error.response) {
      // HTTP error: status MUST be available
      if (error.response.status === undefined || error.response.status === null) {
        console.error('❌ CRITICAL: HTTP error without status code (FE configuration issue)', {
          error,
          url: error.config?.url,
          method: error.config?.method,
          hasResponse: !!error.response,
          responseData: error.response?.data,
        });
      }
    } else {
      console.error('❌ UNKNOWN_ERROR: Error without response and without network error code', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  }
);


function prepareRequest(
  { endpoint, endpointParams }: Endpoint,
  { method, params, data, headers }: AxiosRequestConfig
) {
  if (!API[endpoint]) {
    throw new Error(`WARNING! The endpoint ${endpoint} does not exist in constants.ts`);
  }

  // eslint-disable-next-line functional/no-let
  let url = API[endpoint].URL;

  // Replace dynamic parts of the URL by substitution
  if (!isEmpty(endpointParams)) {
    url = Object.keys(endpointParams).reduce(
      (acc, key) => acc.replace(`{{${key}}}`, endpointParams[key]),
      url
    );
  }

  // Log action with updated variables, in case the call is mocked
  logAction('Prepare request', {
    endpoint,
    url,
    headers,
    method,
    params,
    data,
  });

  // Return the instance of the request, ready to be sent
  return () =>
    axios.request({
      url,
      method,
      params,
      data,
      headers: { ...headers, Authorization: `Bearer ${storageTokenOps.read()}` },
    });
}

async function performRequests(
  requests: Array<() => Promise<AxiosInstance>>,
  onRedirectToLogin: () => void,
  notValidTokenHttpStatus: number | null = 401
): Promise<Array<AxiosResponse> | Array<AxiosError>> {
  try {
    const responses = await axios.all(requests.map((r) => r()));
    logAction('Log response', responses);
    return responses as unknown as Array<AxiosResponse>;
  } catch (error) {
    logError(error);
    if (
      notValidTokenHttpStatus != null &&
      (error as AxiosError).response?.status === notValidTokenHttpStatus
    ) {
      onRedirectToLogin();
      window.setTimeout(() => window.location.assign(ENV.URL_FE.LOGOUT), 2000);
    }
    return [error] as Array<AxiosError>;
  }
}

export async function fetchAllWithLogs(
  reqsConfig: Array<RequestConfig>,
  onRedirectToLogin: () => void
) {
  const requests = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/await-thenable
    reqsConfig.map(async ({ path, config }) => await prepareRequest(path, config))
  );
  return await performRequests(requests as any, onRedirectToLogin);
}

export async function fetchWithLogs(
  { endpoint, endpointParams }: Endpoint,
  { method, params, data, headers }: AxiosRequestConfig,
  onRedirectToLogin: () => void
) {
  /* istanbul ignore if */
  if (isMockEnvironment()) {
    return mockFetch({ endpoint, endpointParams }, { method, params, data, headers });
  }

  // Prepare the request
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const request = await prepareRequest(
    { endpoint, endpointParams },
    { method, params, data, headers }
  );
  const responses = await performRequests([request as any], onRedirectToLogin);
  return responses[0];
}
