import { AxiosError, AxiosResponse } from 'axios';

export function isFetchError(resp: AxiosResponse | AxiosError) {
  // This typing sucks, improve it
  return (resp as AxiosError).isAxiosError;
}

export function getFetchOutcome(resp: AxiosResponse | AxiosError) {
  return isFetchError(resp) ? 'error' : 'success';
}

export type HttpError = Error & { httpStatus?: number; httpBody?: unknown };

export const getErrorStatus = (error: unknown): number | undefined =>
  (error as HttpError)?.httpStatus;

// The backend error response (Problem) carries the message to show in its `detail` field;
// title, HTTP status and error message are fallbacks so a description is always available
export const getErrorDescription = (error: unknown): string | undefined => {
  const { httpStatus, httpBody, message } = (error ?? {}) as HttpError;
  const body = (typeof httpBody === 'object' && httpBody !== null ? httpBody : {}) as {
    detail?: unknown;
    title?: unknown;
  };
  const candidates = [body.detail, body.title, httpStatus?.toString(), message];
  return candidates.find((c): c is string => typeof c === 'string' && c !== '');
};
