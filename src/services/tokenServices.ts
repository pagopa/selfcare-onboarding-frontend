import { AxiosError, AxiosResponse } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { fetchWithLogs } from '../lib/api-utils';
import { Problem, RequestOutcomeJwt } from '../../types';

type Props = {
  token: string;
  setRequiredLogin: (value: React.SetStateAction<boolean>) => void;
  setOutcome: React.Dispatch<React.SetStateAction<RequestOutcomeJwt | null>>;
};

const getMixPanelEvent = (errorStatus: number | undefined) => {
  const errors = {
    409: 'ONBOARDING_TOKEN_VALIDATION_JWT_CONFIRMED',
    [400 || 404]: 'ONBOARDING_TOKEN_VALIDATION_JWT_INVALID',
  };
  return errors[errorStatus as keyof typeof errors] ?? 'ONBOARDING_TOKEN_VALIDATION_ERROR';
};

export const jwtNotValid = async ({ token, setRequiredLogin, setOutcome }: Props) => {
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
    setOutcome('jwterror');
    trackEvent(getMixPanelEvent((fetchJwt as AxiosError<Problem>).response?.status));
  } else if ((fetchJwt as AxiosResponse).status !== 200) {
    setOutcome('error');
  } else {
    setOutcome('jwtsuccess');
  }
};
