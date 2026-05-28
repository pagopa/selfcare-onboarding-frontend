import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import React, { Dispatch, SetStateAction } from 'react';
import { RequestOutcomeComplete } from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { OnboardingVerify } from '../api/generated/onboarding/OnboardingVerify';
import { getErrorStatus } from '../lib/error-utils';
type Props = {
  onboardingId?: string;
  setRequiredLogin: (value: React.SetStateAction<boolean>) => void;
  setOutcomeContentState: React.Dispatch<React.SetStateAction<RequestOutcomeComplete | null>>;
  setRequestData: React.Dispatch<React.SetStateAction<OnboardingVerify | undefined>>;
};

const getMixPanelEvent = (errorStatus: number | undefined) => {
  const errors = {
    409: 'ONBOARDING_TOKEN_VALIDATION_JWT_CONFIRMED',
    400: 'ONBOARDING_TOKEN_VALIDATION_JWT_INVALID',
    404: 'ONBOARDING_TOKEN_VALIDATION_JWT_INVALID',
  };
  return errors[errorStatus as keyof typeof errors] ?? 'ONBOARDING_TOKEN_VALIDATION_ERROR';
};

export const verifyRequest = async ({
  onboardingId,
  setOutcomeContentState,
  setRequestData,
}: Props) => {
  if (!onboardingId) {
    return setOutcomeContentState('notFound');
  }

  try {
    const requestData = await OnboardingApi.verifyOnboarding(onboardingId);

    const isExpiredRequest = requestData?.expiringDate
      ? new Date(requestData.expiringDate) <= new Date()
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
    } else if (requestData.status !== 'TOBEVALIDATED') {
      setOutcomeContentState('expired');
    }
    setRequestData(requestData as OnboardingVerify);
  } catch (error) {
    const status = getErrorStatus(error);
    trackEvent(getMixPanelEvent(status), { party_id: onboardingId });
    setOutcomeContentState('notFound');
  }
};

export const getOnboardingInfo = async (
  onboardingId: string,
  setInstitutionId: Dispatch<SetStateAction<any>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOutcomeContentState: Dispatch<SetStateAction<RequestOutcomeComplete | null>>
) => {
  try {
    setLoading(true);
    const data = await OnboardingApi.retrieveOnboardingRequest(onboardingId);
    setInstitutionId(data.institutionInfo?.id ?? undefined);
    setOutcomeContentState('success');
  } catch (error) {
    setOutcomeContentState('error');
  } finally {
    setLoading(false);
  }
};
