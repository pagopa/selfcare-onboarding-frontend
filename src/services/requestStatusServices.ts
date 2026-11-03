import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { FileErrorAttempt, Problem, RequestOutcomeComplete } from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { OnboardingVerify } from '../api/generated/onboarding/OnboardingVerify';
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

export type UploadContext = {
  onboardingId: string | undefined;
  requestData: Pick<OnboardingVerify, 'productId'> | undefined;
  addUserFlow: boolean;
  attachmentName?: string;
  lastFileErrorAttempt: FileErrorAttempt | undefined;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setOutcomeContentState: Dispatch<SetStateAction<RequestOutcomeComplete | null>>;
  setLastFileErrorAttempt: Dispatch<SetStateAction<FileErrorAttempt | undefined>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setErrorCode: Dispatch<SetStateAction<keyof typeof customErrors>>;
  transcodeErrorCode: (data: Problem) => keyof typeof customErrors;
  onAttachmentSuccess?: () => void;
};

const uploadByKind = (file: File, { onboardingId, addUserFlow, attachmentName }: UploadContext) => {
  if (attachmentName) {
    return OnboardingApi.uploadAttachment(onboardingId as string, attachmentName, file);
  }
  return addUserFlow
    ? OnboardingApi.completeUsersOnboardingContract(onboardingId as string, file)
    : OnboardingApi.completeOnboardingContract(onboardingId as string, file);
};

export const getSuccessEvent = (isAttachment: boolean, addUserFlow: boolean) => {
  if (isAttachment) {
    return 'ONBOARDING_ATTACHMENT_SUCCESS';
  }
  return addUserFlow ? 'ONBOARDING_USER_COMPLETED' : 'ONBOARDING_SUCCESS';
};

export const nextFileErrorAttempt = (
  last: FileErrorAttempt | undefined,
  file: File
): { attempt: FileErrorAttempt; repeated: boolean } => {
  const repeated =
    !!last &&
    last.fileName === file.name &&
    last.fileSize === file.size &&
    last.fileLastModifyDate === file.lastModified;

  return repeated
    ? { attempt: { ...last, errorCount: last.errorCount + 1 }, repeated }
    : {
        attempt: {
          fileName: file.name,
          fileSize: file.size,
          fileLastModifyDate: file.lastModified,
          errorCount: 1,
        },
        repeated,
      };
};

const getFailureEvent = (isAttachment: boolean, isProblem: boolean) => {
  if (isAttachment) {
    return 'ONBOARDING_ATTACHMENT_FAILURE';
  }
  return isProblem ? 'ONBOARDING_CONTRACT_FAILURE' : 'ONBOARDING_FAILURE';
};

const handleUploadError = (error: unknown, file: File, requestId: string, ctx: UploadContext) => {
  const isAttachment = !!ctx.attachmentName;
  ctx.setLoading(false);

  const { attempt, repeated } = nextFileErrorAttempt(ctx.lastFileErrorAttempt, file);
  ctx.setLastFileErrorAttempt(attempt);
  if (repeated && attempt.errorCount > ENV.UPLOAD_CONTRACT_MAX_LOOP_ERROR) {
    ctx.setOpen(false);
    ctx.setOutcomeContentState('error');
  }

  const errorBody = (error as HttpError).httpBody as Problem | undefined;
  const problem = getErrorStatus(error) === 400 ? errorBody : undefined;
  ctx.setOpen(true);
  trackEvent(getFailureEvent(isAttachment, !!problem), {
    request_id: requestId,
    party_id: ctx.onboardingId,
  });
  ctx.setErrorCode(problem ? ctx.transcodeErrorCode(problem) : 'GENERIC');
};

export const onboardingContractUpload = async (file: File, ctx: UploadContext) => {
  const isAttachment = !!ctx.attachmentName;
  const requestId = uniqueId(isAttachment ? 'upload-attachment-' : 'upload-contract-');
  trackEvent(isAttachment ? 'ONBOARDING_ATTACHMENT_UPLOAD' : 'ONBOARDING_CONTRACT_UPLOAD', {
    request_id: requestId,
    party_id: ctx.onboardingId,
  });

  ctx.setLoading(true);

  try {
    await uploadByKind(file, ctx);
  } catch (error) {
    handleUploadError(error, file, requestId, ctx);
    return;
  }

  ctx.setLoading(false);
  trackEvent(getSuccessEvent(isAttachment, ctx.addUserFlow), {
    request_id: requestId,
    party_id: ctx.onboardingId,
    product_id: ctx.requestData?.productId,
    form: ctx.addUserFlow ? 'onboarding/dashboard' : undefined,
  });
  if (isAttachment && ctx.onAttachmentSuccess) {
    ctx.onAttachmentSuccess();
  } else {
    ctx.setOutcomeContentState('success');
  }
};
