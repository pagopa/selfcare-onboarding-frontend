import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { FileErrorAttempt, Problem, RequestOutcomeComplete } from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { getErrorStatus, HttpError } from '../lib/error-utils';
import { customErrors } from '../utils/constants';
import { ENV } from '../utils/env';

export const deleteRequest =
  (
    token: string | undefined,
    setOutcomeContentState: Dispatch<SetStateAction<RequestOutcomeComplete | null>>,
    setLoading: Dispatch<SetStateAction<boolean>>
  ) =>
  () => {
    const requestId = uniqueId('contract-reject-');
    async function asyncSendDeleteRequest() {
      try {
        await OnboardingApi.deleteOnboardingRequest(token as string);
        trackEvent('ONBOARDING_CANCEL_SUCCESS', { request_id: requestId, party_id: token });
        setOutcomeContentState('success');
      } catch {
        trackEvent('ONBOARDING_CANCEL_FAILURE', { request_id: requestId, party_id: token });
        setOutcomeContentState('error');
      } finally {
        setLoading(false);
      }
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

  try {
    if (isAttachment) {
      await OnboardingApi.uploadAttachment(onboardingId as string, attachmentName as string, file);
    } else if (addUserFlow) {
      await OnboardingApi.completeUsersOnboardingContract(onboardingId as string, file);
    } else {
      await OnboardingApi.completeOnboardingContract(onboardingId as string, file);
    }

    setLoading(false);

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
      setOutcomeContentState('success');
    }
  } catch (error) {
    setLoading(false);

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

    const errorBody = (error as HttpError).httpBody as Problem | undefined;
    if (getErrorStatus(error) === 400 && errorBody) {
      setOpen(true);
      trackEvent(isAttachment ? 'ONBOARDING_ATTACHMENT_FAILURE' : 'ONBOARDING_CONTRACT_FAILURE', {
        request_id: requestId,
        party_id: onboardingId,
      });
      setErrorCode(transcodeErrorCode(errorBody));
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
