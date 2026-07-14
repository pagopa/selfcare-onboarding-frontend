import { it, expect, vi, beforeEach } from 'vitest';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { postOnboardingSubmit, postSubProductOnboardingSubmit } from '../onboardingSubmitServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    onboardingInstitution: vi.fn(),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

const setLoading = vi.fn();
const setOutcome = vi.fn();
const setError = vi.fn();
const setConflictError = vi.fn();
const forward = vi.fn();

const outcomeContent = { success: 'SUCCESS', error: 'ERROR' } as any;
const notAllowedError = 'NOT_ALLOWED' as any;
const onboardingFormData = { businessName: 'ACME', digitalAddress: 'a@b.it' } as any;
const requestIdRef = { current: 'req-1' } as any;

const submitArgs = (onSuccess?: () => void) =>
  [
    setLoading,
    'prod-1',
    { id: 'prod-1' } as any,
    setOutcome,
    onboardingFormData,
    requestIdRef,
    'ext-inst-1',
    undefined,
    undefined,
    'PA' as any,
    'IPA',
    outcomeContent,
    notAllowedError,
    undefined,
    [{ taxCode: 'RSSMRA80A01H501Z' }] as any,
    null,
    undefined,
    onSuccess,
  ] as const;

const subProductArgs = () =>
  [
    'ext-inst-1',
    { id: 'subprod-1' } as any,
    [{ taxCode: 'RSSMRA80A01H501Z' }] as any,
    onboardingFormData,
    'PA' as any,
    'req-1',
    { id: 'prod-1' } as any,
    setError,
    forward,
    'IPA',
    'origin-id-1',
    setConflictError,
  ] as const;

beforeEach(() => {
  vi.clearAllMocks();
});

it('test postOnboardingSubmit success tracks success and forwards', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);
  const onSuccess = vi.fn();

  await postOnboardingSubmit(...submitArgs(onSuccess));

  expect(OnboardingApi.onboardingInstitution).toHaveBeenCalled();
  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_SEND_SUCCESS', expect.any(Object));
  expect(setOutcome).toHaveBeenCalledWith('SUCCESS');
  expect(onSuccess).toHaveBeenCalled();
  expect(setLoading).toHaveBeenLastCalledWith(false);
});

it('test postOnboardingSubmit success with onRequiredDocuments enters the document flow instead of the outcome', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);
  const onRequiredDocuments = vi.fn();

  await postOnboardingSubmit(...submitArgs(), onRequiredDocuments);

  expect(onRequiredDocuments).toHaveBeenCalled();
  expect(setOutcome).not.toHaveBeenCalled();
});

it('test postOnboardingSubmit 409 tracks conflict failure', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockRejectedValue(
    Object.assign(new Error('conflict'), { httpStatus: 409 })
  );

  await postOnboardingSubmit(...submitArgs());

  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_SEND_CONFLICT_ERROR_FAILURE',
    expect.any(Object)
  );
});

it('test postOnboardingSubmit 403 tracks not-allowed and sets notAllowedError', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockRejectedValue(
    Object.assign(new Error('forbidden'), { httpStatus: 403 })
  );

  await postOnboardingSubmit(...submitArgs());

  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_NOT_ALLOWED_ERROR', expect.any(Object));
  expect(setOutcome).toHaveBeenCalledWith(notAllowedError);
});

it('test postSubProductOnboardingSubmit success tracks premium success and forwards', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);

  await postSubProductOnboardingSubmit(...subProductArgs());

  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_PREMIUM_SEND_SUCCESS', expect.any(Object));
  expect(forward).toHaveBeenCalled();
});

it('test postSubProductOnboardingSubmit 409 sets conflict and tracks reason from detail', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockRejectedValue(
    Object.assign(new Error('conflict'), { httpStatus: 409, httpBody: { detail: 'already there' } })
  );

  await postSubProductOnboardingSubmit(...subProductArgs());

  expect(setConflictError).toHaveBeenCalledWith(true);
  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_PREMIUM_SEND_CONFLICT_ERROR_FAILURE',
    expect.objectContaining({ reason: 'already there' })
  );
  expect(setError).toHaveBeenCalledWith(true);
});
