import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import isEmpty from 'lodash/isEmpty';
import { Endpoint, RequestConfig } from '../../types';
import { API } from '../utils/constants';
import { logAction, logError } from './action-log';
import { storageRead } from './storage-utils';

// Utility to wait some time
export const sleep = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));

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
      headers: { ...headers, Authorization: `Bearer ${storageRead('bearer', 'string')}` },
    });
}

async function performRequests(
  requests: Array<() => Promise<AxiosInstance>>
): Promise<Array<AxiosResponse> | Array<AxiosError>> {
  try {
    const responses = await axios.all(requests.map((r) => r()));
    logAction('Log response', responses);
    return responses as unknown as Array<AxiosResponse>; // WHYYYYY?
  } catch (error) {
    logError(error);
    return [error] as Array<AxiosError>; // This is for testing
  }
}

export async function fetchAllWithLogs(reqsConfig: Array<RequestConfig>) {
  const requests = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/await-thenable
    reqsConfig.map(async ({ path, config }) => await prepareRequest(path, config))
  );
  return await performRequests(requests as any);
}

export async function fetchWithLogs(
  { endpoint, endpointParams }: Endpoint,
  { method, params, data, headers }: AxiosRequestConfig
) {
  // Prepare the request
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const request = await prepareRequest(
    { endpoint, endpointParams },
    { method, params, data, headers }
  );
  const responses = await performRequests([request as any]);
  return responses[0];
}
