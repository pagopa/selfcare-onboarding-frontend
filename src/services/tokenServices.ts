import { AxiosError } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { fetchWithLogs } from '../lib/api-utils';
import { Problem } from '../../types';
import { getFetchOutcome } from '../lib/error-utils';

type Props = {
  token: string;
  setRequiredLogin: (value: React.SetStateAction<boolean>) => void;
  setTokenValid: React.Dispatch<React.SetStateAction<boolean | undefined>>;
};

const getMixPanelEvent = (errorStatus: number | undefined) => {
  const errors = {
    409: 'ONBOARDING_TOKEN_VALIDATION_JWT_CONFIRMED',
    400: 'ONBOARDING_TOKEN_VALIDATION_JWT_CANCELED',
    404: 'ONBOARDING_TOKEN_VALIDATION_JWT_NOT_FOUND',
  };
  return errors[errorStatus as keyof typeof errors] ?? 'ONBOARDING_TOKEN_VALIDATION_ERROR';
};

export const jwtNotValid = async ({ token, setRequiredLogin, setTokenValid }: Props) => {
  const fetchJwt = await fetchWithLogs(
    { endpoint: 'ONBOARDING_TOKEN_VALIDATION', endpointParams: { token } },
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    () => setRequiredLogin(true)
  );

  if (
    (fetchJwt as AxiosError<Problem>).response?.status === 409 ||
    (fetchJwt as AxiosError<Problem>).response?.status === 400 ||
    (fetchJwt as AxiosError<Problem>).response?.status === 404
  ) {
    setTokenValid(false);
  } else {
    setTokenValid(true);
  }

  const outcome = getFetchOutcome(fetchJwt);

  if (outcome === 'success') {
    setTokenValid(true);
  } else {
    setTokenValid(false);
    trackEvent(getMixPanelEvent((fetchJwt as AxiosError<Problem>).response?.status));
  }
};
