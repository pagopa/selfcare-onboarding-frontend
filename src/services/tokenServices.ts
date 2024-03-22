import { AxiosError, AxiosResponse } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import React from 'react';
import { fetchWithLogs } from '../lib/api-utils';
import { OnboardingRequestData, Problem, RequestOutcomeComplete } from '../../types';
import { redirectToLogin } from '../utils/unloadEvent-utils';
import { getFetchOutcome } from '../lib/error-utils';

type Props = {
  token: string;
  setRequiredLogin: (value: React.SetStateAction<boolean>) => void;
  setOutcomeContentState: React.Dispatch<React.SetStateAction<RequestOutcomeComplete | null>>;
  setRequestData: React.Dispatch<React.SetStateAction<OnboardingRequestData | undefined>>;
};

const getMixPanelEvent = (errorStatus: number | undefined) => {
  const errors = {
    409: 'ONBOARDING_TOKEN_VALIDATION_JWT_CONFIRMED',
    400: 'ONBOARDING_TOKEN_VALIDATION_JWT_INVALID',
    404: 'ONBOARDING_TOKEN_VALIDATION_JWT_INVALID',
  };
  return errors[errorStatus as keyof typeof errors] ?? 'ONBOARDING_TOKEN_VALIDATION_ERROR';
};

export const verifyRequest = async ({ token, setOutcomeContentState, setRequestData }: Props) => {
  const fetchJwt = await fetchWithLogs(
    { endpoint: 'ONBOARDING_TOKEN_VALIDATION', endpointParams: { onboardingId: token } },
    { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    redirectToLogin
  );

  const result = getFetchOutcome(fetchJwt);

  if (result === 'success') {
    const requestData = (fetchJwt as AxiosResponse).data as OnboardingRequestData;

    const isExpiredRequest = requestData?.expiringDate
      ? new Date(requestData?.expiringDate) <= new Date()
      : false;

    if (!isExpiredRequest) {
      switch (requestData.status) {
        case 'COMPLETED':
          setOutcomeContentState('alreadyCompleted');
          break;
        case 'REJECTED':
          setOutcomeContentState('alreadyRejected');
          break;
        case 'PENDING':
          setOutcomeContentState('toBeCompleted');
          break;
      }
    } else {
      setOutcomeContentState('expired');
    }
    setRequestData(requestData);
  } else {
    trackEvent(getMixPanelEvent((fetchJwt as AxiosError<Problem>).response?.status), {
      party_id: token,
    });
    setOutcomeContentState('notFound');
  }
};
