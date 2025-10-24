import { AxiosError, AxiosResponse } from 'axios';

export function isFetchError(resp: AxiosResponse | AxiosError) {
  // This typing sucks, improve it
  return (resp as AxiosError).isAxiosError;
}

export function getFetchOutcome(resp: AxiosResponse | AxiosError) {
  return isFetchError(resp) ? 'error' : 'success';
}

export function getResponseStatus(error: AxiosError, context?: string): number | undefined {
  const status = error.response?.status;

  const isNetworkError =
    !error.response &&
    (error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ERR_NETWORK' || // Network error
      error.code === 'ERR_CANCELED' || // Request cancellata
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.message?.includes('CORS'));

  if (isNetworkError) {
    console.warn(`⚠️ ${context || 'API_CALL'}: Network error, status unavailable (not FE fault)`, {
      errorCode: error.code,
      errorMessage: error.message,
      url: error.config?.url,
      method: error.config?.method,
    });
    return undefined;
  }

  if (error.response && !status) {
    console.error(`❌ ${context || 'API_CALL'}: CRITICAL - HTTP error without status code`, {
      error,
      url: error.config?.url,
      method: error.config?.method,
      hasResponse: !!error.response,
      responseData: error.response?.data,
    });
  }

  if (!error.response && !isNetworkError) {
    console.error(`❌ ${context || 'API_CALL'}: Unknown error without response`, {
      error,
      errorCode: error.code,
      errorMessage: error.message,
      url: error.config?.url,
    });
  }

  return status;
}
