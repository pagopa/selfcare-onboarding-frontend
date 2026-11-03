import { it, expect, vi, beforeEach, describe } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { deleteRequest, onboardingContractUpload } from '../requestStatusServices';
import { ENV } from '../../utils/env';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    deleteOnboardingRequest: vi.fn(),
    completeOnboardingContract: vi.fn(),
    completeUsersOnboardingContract: vi.fn(),
    uploadAttachment: vi.fn(),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

const setOutcomeContentState = vi.fn();
const setLoading = vi.fn();
const setLastFileErrorAttempt = vi.fn();
const setOpen = vi.fn();
const setErrorCode = vi.fn();
const transcodeErrorCode = vi.fn();

const file = new File(['data'], 'contract.pdf', { type: 'application/pdf' });

const uploadArgs = (overrides: Partial<Record<string, any>> = {}) =>
  [
    overrides.file ?? file,
    setLoading,
    overrides.onboardingId ?? 'onboarding-1',
    overrides.requestData ?? { productId: 'prod-1' },
    overrides.addUserFlow ?? false,
    setOutcomeContentState,
    overrides.lastFileErrorAttempt,
    setLastFileErrorAttempt,
    setOpen,
    setErrorCode,
    transcodeErrorCode,
    overrides.attachmentName,
    overrides.onAttachmentSuccess,
  ] as const;

beforeEach(() => {
  vi.clearAllMocks();
});

it('test deleteRequest with missing token sets notFound', () => {
  const handler = deleteRequest(undefined, setOutcomeContentState, setLoading);
  handler();

  expect(setLoading).toHaveBeenCalledWith(false);
  expect(setOutcomeContentState).toHaveBeenCalledWith('notFound');
  expect(OnboardingApi.deleteOnboardingRequest).not.toHaveBeenCalled();
});

it('test deleteRequest success tracks success event and sets success outcome', async () => {
  vi.mocked(OnboardingApi.deleteOnboardingRequest).mockResolvedValue(undefined);

  const handler = deleteRequest('token-1', setOutcomeContentState, setLoading);
  handler();

  await vi.waitFor(() => expect(setLoading).toHaveBeenCalledWith(false));

  expect(OnboardingApi.deleteOnboardingRequest).toHaveBeenCalledWith('token-1');
  expect(setOutcomeContentState).toHaveBeenCalledWith('success');
  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_CANCEL_SUCCESS',
    expect.objectContaining({ party_id: 'token-1' })
  );
});

it('test deleteRequest failure tracks failure event and sets error outcome', async () => {
  vi.mocked(OnboardingApi.deleteOnboardingRequest).mockRejectedValue(new Error('boom'));

  const handler = deleteRequest('token-1', setOutcomeContentState, setLoading);
  handler();

  await vi.waitFor(() => expect(setLoading).toHaveBeenCalledWith(false));

  expect(setOutcomeContentState).toHaveBeenCalledWith('error');
  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_CANCEL_FAILURE',
    expect.objectContaining({ party_id: 'token-1' })
  );
});

it('test onboardingContractUpload contract success tracks success and sets outcome', async () => {
  vi.mocked(OnboardingApi.completeOnboardingContract).mockResolvedValue(undefined);

  await onboardingContractUpload(...uploadArgs());

  expect(OnboardingApi.completeOnboardingContract).toHaveBeenCalledWith('onboarding-1', file);
  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_SUCCESS',
    expect.objectContaining({ party_id: 'onboarding-1', product_id: 'prod-1' })
  );
  expect(setOutcomeContentState).toHaveBeenCalledWith('success');
  expect(setErrorCode).not.toHaveBeenCalled();
});

it('test onboardingContractUpload attachment success calls onAttachmentSuccess', async () => {
  vi.mocked(OnboardingApi.uploadAttachment).mockResolvedValue(undefined);
  const onAttachmentSuccess = vi.fn();

  await onboardingContractUpload(...uploadArgs({ attachmentName: 'doc.pdf', onAttachmentSuccess }));

  expect(OnboardingApi.uploadAttachment).toHaveBeenCalledWith('onboarding-1', 'doc.pdf', file);
  expect(onAttachmentSuccess).toHaveBeenCalled();
  expect(setOutcomeContentState).not.toHaveBeenCalled();
});

it('test onboardingContractUpload 400 transcodes the Problem error code', async () => {
  const error = Object.assign(new Error('bad request'), {
    httpStatus: 400,
    httpBody: { errors: [{ code: '002-1000', detail: 'invalid sign' }] },
  });
  vi.mocked(OnboardingApi.completeOnboardingContract).mockRejectedValue(error);
  transcodeErrorCode.mockReturnValue('INVALID_SIGN');

  await onboardingContractUpload(...uploadArgs());

  expect(transcodeErrorCode).toHaveBeenCalledWith(error.httpBody);
  expect(setErrorCode).toHaveBeenCalledWith('INVALID_SIGN');
  expect(setOpen).toHaveBeenCalledWith(true);
  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_CONTRACT_FAILURE', expect.any(Object));
});

it('test onboardingContractUpload generic error sets GENERIC', async () => {
  vi.mocked(OnboardingApi.completeOnboardingContract).mockRejectedValue(
    Object.assign(new Error('boom'), { httpStatus: 500 })
  );

  await onboardingContractUpload(...uploadArgs());

  expect(transcodeErrorCode).not.toHaveBeenCalled();
  expect(setErrorCode).toHaveBeenCalledWith('GENERIC');
  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_FAILURE', expect.any(Object));
});
it('test onboardingContractUpload attachment and add-user flows pick the right api and events', async () => {
  vi.mocked(OnboardingApi.completeUsersOnboardingContract).mockResolvedValue(undefined);

  await onboardingContractUpload(...uploadArgs({ addUserFlow: true }));

  expect(OnboardingApi.completeUsersOnboardingContract).toHaveBeenCalledWith('onboarding-1', file);
  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_USER_COMPLETED',
    expect.objectContaining({ form: 'onboarding/dashboard' })
  );
});

it('test onboardingContractUpload attachment failure tracks the attachment failure event', async () => {
  vi.mocked(OnboardingApi.uploadAttachment).mockRejectedValue(
    Object.assign(new Error('boom'), { httpStatus: 500 })
  );

  await onboardingContractUpload(...uploadArgs({ attachmentName: 'doc.pdf' }));

  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_ATTACHMENT_FAILURE', expect.any(Object));
  expect(setErrorCode).toHaveBeenCalledWith('GENERIC');
});

describe('onboardingContractUpload repeated failures on the same file', () => {
  const sameFileAttempt = (errorCount: number) => ({
    fileName: file.name,
    fileSize: file.size,
    fileLastModifyDate: file.lastModified,
    errorCount,
  });

  beforeEach(() => {
    vi.mocked(OnboardingApi.completeOnboardingContract).mockRejectedValue(
      Object.assign(new Error('boom'), { httpStatus: 500 })
    );
  });

  it('first failure stores an attempt with errorCount 1', async () => {
    await onboardingContractUpload(...uploadArgs());

    expect(setLastFileErrorAttempt).toHaveBeenCalledWith(sameFileAttempt(1));
    expect(setOutcomeContentState).not.toHaveBeenCalled();
  });

  it('a different file restarts the counter', async () => {
    await onboardingContractUpload(
      ...uploadArgs({ lastFileErrorAttempt: { ...sameFileAttempt(5), fileName: 'other.pdf' } })
    );

    expect(setLastFileErrorAttempt).toHaveBeenCalledWith(sameFileAttempt(1));
    expect(setOutcomeContentState).not.toHaveBeenCalled();
  });

  it('the same file increments the counter without giving up below the limit', async () => {
    await onboardingContractUpload(...uploadArgs({ lastFileErrorAttempt: sameFileAttempt(1) }));

    expect(setLastFileErrorAttempt).toHaveBeenCalledWith(sameFileAttempt(2));
    expect(setOutcomeContentState).not.toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalledWith(true);
  });

  it('the same file over the limit closes the modal and sets the error outcome', async () => {
    await onboardingContractUpload(
      ...uploadArgs({ lastFileErrorAttempt: sameFileAttempt(ENV.UPLOAD_CONTRACT_MAX_LOOP_ERROR) })
    );

    expect(setOpen).toHaveBeenNthCalledWith(1, false);
    expect(setOutcomeContentState).toHaveBeenCalledWith('error');
  });
});
