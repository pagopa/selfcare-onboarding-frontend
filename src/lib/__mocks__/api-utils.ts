import { AxiosRequestConfig } from 'axios';
import { Endpoint } from '../../../types';
import { mockFetch } from './mockApiRequests';

export async function fetchWithLogs(
  { endpoint, endpointParams }: Endpoint,
  { method, params, data, headers }: AxiosRequestConfig
) {
  return mockFetch({ endpoint, endpointParams }, { method, params, data, headers });
}
