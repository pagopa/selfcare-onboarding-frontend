import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { deleteRequest, onboardingContractUpload } from '../requestStatusServices';
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

  await onboardingContractUpload(
    ...uploadArgs({ attachmentName: 'doc.pdf', onAttachmentSuccess })
  );

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