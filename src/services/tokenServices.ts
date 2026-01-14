import { AxiosError, AxiosResponse } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import React, { Dispatch, SetStateAction } from 'react';
import { fetchWithLogs } from '../lib/api-utils';
import { OnboardingRequestData, Problem, RequestOutcomeComplete } from '../../types';
import { redirectToLogin } from '../utils/unloadEvent-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { fileFromReader } from '../utils/formatting-utils';

type Props = {
  onboardingId?: string;
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

export const verifyRequest = async ({
  onboardingId,
  setOutcomeContentState,
  setRequestData,
}: Props) => {
  if (!onboardingId) {
    return setOutcomeContentState('notFound');
  }

  const fetchJwt = await fetchWithLogs(
    { endpoint: 'ONBOARDING_TOKEN_VALIDATION', endpointParams: { onboardingId } },
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
      party_id: onboardingId,
    });
    setOutcomeContentState('notFound');
  }
};

export const getOnboardingAttatchments = async (
  onboardingId: string,
  setAttachments: Dispatch<SetStateAction<any>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOutcomeContentState: Dispatch<SetStateAction<RequestOutcomeComplete | null>>
) => {
  setLoading(true);
  const getOnboarding = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_DETAILS_AND_ATTACHMENTS_NAME',
      endpointParams: { onboardingId },
    },
    {
      method: 'GET',
    },
    redirectToLogin
  );

  const outcome = getFetchOutcome(getOnboarding);
  if (outcome === 'success') {
    setAttachments((getOnboarding as AxiosResponse).data.attachments[0]);
  } else {
    setOutcomeContentState('error');
  }
  setLoading(false);
};

export const downloadAttatchments = async (
  onboardingId: string,
  fileName: string | undefined,
  setOpenModal: Dispatch<SetStateAction<boolean>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOutcomeContentState: Dispatch<SetStateAction<RequestOutcomeComplete | null>>
) => {
  setLoading(true);
  if (fileName) {
    const getDocument = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_ATTACHMENT',
        endpointParams: { onboardingId, filename: fileName },
      },
      {
        method: 'GET',
        responseType: 'blob',
      },
      redirectToLogin
    );

    const outcome = getFetchOutcome(getDocument);
    if (outcome === 'success') {
      const response = (getDocument as AxiosResponse).data;

      const reader = response.stream().getReader();
      fileFromReader(reader)
        .then((url) => {
          const link = document.createElement('a');
          // eslint-disable-next-line functional/immutable-data
          link.href = url;
          // eslint-disable-next-line functional/immutable-data
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
        })
        .catch(() => {
          setOpenModal(true);
        });
    } else {
      setOutcomeContentState('error');
    }
  }
  setLoading(false);
};
