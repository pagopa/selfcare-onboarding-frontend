import { AxiosError, AxiosResponse, Method } from 'axios';
import { ApiEndpointKey } from '../../types';
// fetchWithLogs is imported (not called in-module) so tests can spy on it
import { fetchWithLogs } from './api-utils';
import { HttpError } from './error-utils';

export type MockedCallOptions = {
  endpointParams?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  method?: Method;
};

const isAxiosErrorResponse = (response: AxiosResponse | AxiosError): response is AxiosError =>
  Boolean((response as AxiosError).isAxiosError);

const toHttpError = (error: AxiosError): HttpError =>
  Object.assign(new Error(`HTTP ${error.response?.status}`), {
    httpStatus: error.response?.status,
    httpBody: error.response?.data,
  });

// Calls the mocked endpoint and unwraps it like the generated clients do: the response data on
// success, an HttpError (httpStatus/httpBody) otherwise. T is the expected response data type.
export const fetchMockedData = async <T = unknown>(
  endpoint: ApiEndpointKey,
  { endpointParams, params, data, method }: MockedCallOptions = {}
): Promise<T> => {
  const response = await fetchWithLogs(
    { endpoint, ...(endpointParams !== undefined ? { endpointParams } : {}) },
    { params, data, method: method ?? 'GET' },
    () => undefined
  );
  if (isAxiosErrorResponse(response)) {
    throw toHttpError(response);
  }
  return response.data as T;
};
