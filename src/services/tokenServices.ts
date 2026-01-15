import { AxiosError, AxiosResponse } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import React, { Dispatch, SetStateAction } from 'react';
import { uniqueId } from 'lodash';
import { fetchWithLogs } from '../lib/api-utils';
import { FileErrorAttempt, OnboardingRequestData, Problem, RequestOutcomeComplete } from '../../types';
import { redirectToLogin } from '../utils/unloadEvent-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { fileFromReader } from '../utils/formatting-utils';
import { customErrors } from '../utils/constants';
import { ENV } from '../utils/env';

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

      try {
        const reader = response.stream().getReader();
        const url = await fileFromReader(reader);
        const link = document.createElement('a');
        // eslint-disable-next-line functional/immutable-data
        link.href = url;
        // eslint-disable-next-line functional/immutable-data
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setLoading(false);
      } catch (error) {
        setOpenModal(true);
        setLoading(false);
      }
    } else {
      setOutcomeContentState('error');
      setLoading(false);
    }
  } else {
    setLoading(false);
  }
};

export const uploadAttachment = async (
  onboardingId: string,
  fileName: string | undefined,
  file: File,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setOutcomeContentState: Dispatch<SetStateAction<RequestOutcomeComplete | null>>,
  lastFileErrorAttempt: FileErrorAttempt | undefined,
  setLastFileErrorAttempt: Dispatch<SetStateAction<FileErrorAttempt | undefined>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
  setErrorCode: Dispatch<
    SetStateAction<
      'GENERIC' | 'INVALID_DOCUMENT' | 'INVALID_SIGN' | 'INVALID_SIGN_FORMAT' | 'ALREADY_ONBOARDED'
    >
  >,
  transcodeErrorCode: (data: Problem) => keyof typeof customErrors
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const requestId = uniqueId('upload-attachment-');
  trackEvent('ONBOARDING_ATTACHMENT_UPLOAD', { request_id: requestId, party_id: onboardingId });

  setLoading(true);

  if (fileName) {
    const formData = new FormData();
    formData.append('attachment', file);

    const uploadDocument = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_ATTACHMENT',
        endpointParams: { onboardingId, filename: fileName },
      },
      {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
      redirectToLogin
    );

    setLoading(false);

    const outcome = getFetchOutcome(uploadDocument);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_ATTACHMENT_SUCCESS', {
        request_id: requestId,
        party_id: onboardingId,
      });
      setOutcomeContentState('success');
    }

    if (outcome === 'error') {
      if (
        lastFileErrorAttempt &&
        lastFileErrorAttempt.fileName === file.name &&
        lastFileErrorAttempt.fileSize === file.size &&
        lastFileErrorAttempt.fileLastModifyDate === file.lastModified
      ) {
        const errorCount = lastFileErrorAttempt.errorCount + 1;
        setLastFileErrorAttempt({
          ...lastFileErrorAttempt,
          errorCount,
        });
        if (errorCount > ENV.UPLOAD_CONTRACT_MAX_LOOP_ERROR) {
          setOpen(false);
          setOutcomeContentState('error');
        }
      } else {
        setLastFileErrorAttempt({
          fileName: file.name,
          fileSize: file.size,
          fileLastModifyDate: file.lastModified,
          errorCount: 1,
        });
      }
      if (
        (uploadDocument as AxiosError<Problem>).response?.status === 400 &&
        (uploadDocument as AxiosError<Problem>).response?.data
      ) {
        setOpen(true);
        trackEvent('ONBOARDING_ATTACHMENT_FAILURE', {
          request_id: requestId,
          party_id: onboardingId,
        });
        setErrorCode(
          transcodeErrorCode((uploadDocument as AxiosError<Problem>).response?.data as Problem)
        );
      } else {
        setOpen(true);
        trackEvent('ONBOARDING_ATTACHMENT_FAILURE', {
          request_id: requestId,
          party_id: onboardingId,
        });
        setErrorCode('GENERIC');
      }
    }
  } else {
    setLoading(false);
  }
};
