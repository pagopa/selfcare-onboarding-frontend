import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosError } from 'axios';
import { uniqueId } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { FileErrorAttempt, Problem, RequestOutcomeComplete } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { customErrors } from '../utils/constants';
import { ENV } from '../utils/env';
import { redirectToLogin } from '../utils/unloadEvent-utils';

export const deleteRequest =
  (
    token: string | undefined,
    setOutcomeContentState: Dispatch<SetStateAction<RequestOutcomeComplete | null>>,
    setLoading: Dispatch<SetStateAction<boolean>>
  ) =>
  () => {
    const requestId = uniqueId('contract-reject-');
    async function asyncSendDeleteRequest() {
      // Send DELETE request
      const deleteOnboardingResponse = await fetchWithLogs(
        { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
        { method: 'DELETE' },
        redirectToLogin
      );

      const response = getFetchOutcome(deleteOnboardingResponse);

      if (response === 'success') {
        trackEvent('ONBOARDING_CANCEL_SUCCESS', { request_id: requestId, party_id: token });
        setOutcomeContentState(response);
      } else {
        trackEvent('ONBOARDING_CANCEL_FAILURE', { request_id: requestId, party_id: token });
        setOutcomeContentState(response);
      }
      setLoading(false);
    }

    if (!token) {
      setLoading(false);
      setOutcomeContentState('notFound');
    } else {
      void asyncSendDeleteRequest();
    }
  };

// eslint-disable-next-line sonarjs/cognitive-complexity
export const onboardingContractUpload = async (
  file: File,
  setLoading: Dispatch<SetStateAction<boolean>>,
  onboardingId: string | undefined,
  requestData: any,
  addUserFlow: boolean,
  setOutcomeContentState: Dispatch<SetStateAction<RequestOutcomeComplete | null>>,
  lastFileErrorAttempt: FileErrorAttempt | undefined,
  setLastFileErrorAttempt: Dispatch<SetStateAction<FileErrorAttempt | undefined>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
  setErrorCode: Dispatch<
    SetStateAction<
      'GENERIC' | 'INVALID_DOCUMENT' | 'INVALID_SIGN' | 'INVALID_SIGN_FORMAT' | 'ALREADY_ONBOARDED'
    >
  >,
  transcodeErrorCode: (data: Problem) => keyof typeof customErrors,
  attachmentName?: string,
  onAttachmentSuccess?: () => void
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isAttachment = !!attachmentName;
  const requestId = uniqueId(isAttachment ? 'upload-attachment-' : 'upload-contract-');
  trackEvent(isAttachment ? 'ONBOARDING_ATTACHMENT_UPLOAD' : 'ONBOARDING_CONTRACT_UPLOAD', {
    request_id: requestId,
    party_id: onboardingId,
  });

  setLoading(true);
  const formData = new FormData();
  formData.append(isAttachment ? 'attachment' : 'contract', file);

  const getEndpoint = () => {
    if (isAttachment) {
      return 'ONBOARDING_POST_ATTACHMENT';
    }
    return addUserFlow ? 'USER_COMPLETE_REGISTRATION' : 'ONBOARDING_COMPLETE_REGISTRATION';
  };

  const uploadDocument = await fetchWithLogs(
    {
      endpoint: getEndpoint(),
      endpointParams: isAttachment
        ? { onboardingId, filename: attachmentName }
        : { token: onboardingId },
    },
    { method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' } },
    redirectToLogin
  );

  setLoading(false);

  const outcome = getFetchOutcome(uploadDocument);

  if (outcome === 'success') {
    const getSuccessEvent = () => {
      if (isAttachment) {
        return 'ONBOARDING_ATTACHMENT_SUCCESS';
      } else if (addUserFlow) {
        return 'ONBOARDING_USER_COMPLETED';
      } else {
        return 'ONBOARDING_SUCCESS';
      }
    };
    trackEvent(getSuccessEvent(), {
      request_id: requestId,
      party_id: onboardingId,
      product_id: requestData?.productId,
      form: addUserFlow ? 'onboarding/dashboard' : undefined,
    });
    if (isAttachment && onAttachmentSuccess) {
      onAttachmentSuccess();
    } else {
      setOutcomeContentState(outcome);
    }
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
      trackEvent(isAttachment ? 'ONBOARDING_ATTACHMENT_FAILURE' : 'ONBOARDING_CONTRACT_FAILURE', {
        request_id: requestId,
        party_id: onboardingId,
      });
      setErrorCode(
        transcodeErrorCode((uploadDocument as AxiosError<Problem>).response?.data as Problem)
      );
    } else {
      setOpen(true);
      trackEvent(isAttachment ? 'ONBOARDING_ATTACHMENT_FAILURE' : 'ONBOARDING_FAILURE', {
        request_id: requestId,
        party_id: onboardingId,
      });
      setErrorCode('GENERIC');
    }
  }
};
