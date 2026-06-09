import { beforeEach, expect, it, vi } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { getOnboardingInfo, verifyRequest } from '../tokenServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    retrieveOnboardingRequest: vi.fn(),
    verifyOnboarding: vi.fn(),
  },
}));

const setInstitutionId = vi.fn();
const setLoading = vi.fn();
const setOutcomeContentState = vi.fn();
const setRequestData = vi.fn();
const setRequiredLogin = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

it('test getOnboardingInfo success', async () => {
  vi.mocked(OnboardingApi.retrieveOnboardingRequest).mockResolvedValue({
    institutionInfo: { id: 'inst-123' },
  } as any);

  await getOnboardingInfo('onb-1', setInstitutionId, setLoading, setOutcomeContentState);

  expect(OnboardingApi.retrieveOnboardingRequest).toHaveBeenCalledWith('onb-1');
  expect(setLoading).toHaveBeenNthCalledWith(1, true);
  expect(setLoading).toHaveBeenLastCalledWith(false);
  expect(setInstitutionId).toHaveBeenCalledWith('inst-123');
  expect(setOutcomeContentState).toHaveBeenCalledWith('success');
});

it('test getOnboardingInfo failure', async () => {
  vi.mocked(OnboardingApi.retrieveOnboardingRequest).mockRejectedValue(new Error('boom'));

  await getOnboardingInfo('onb-1', setInstitutionId, setLoading, setOutcomeContentState);

  expect(setLoading).toHaveBeenNthCalledWith(1, true);
  expect(setLoading).toHaveBeenLastCalledWith(false);
  expect(setInstitutionId).not.toHaveBeenCalled();
  expect(setOutcomeContentState).toHaveBeenCalledWith('error');
});

it("test verifyRequest with outcome notFound", async () => {
  await verifyRequest({
    onboardingId: undefined,
    setOutcomeContentState,
    setRequestData,
    setRequiredLogin,
  });
  expect(OnboardingApi.verifyOnboarding).not.toHaveBeenCalled();
  expect(setOutcomeContentState).toHaveBeenCalledWith('notFound');
});

it('test verifyRequest with outcome alreadyCompleted', async () => {
  vi.mocked(OnboardingApi.verifyOnboarding).mockResolvedValue({
    status: 'COMPLETED',
    expiringDate: new Date(Date.now() + 86_400_000),
  } as any);

  await verifyRequest({
    onboardingId: 'onb-1',
    setOutcomeContentState,
    setRequestData,
    setRequiredLogin,
  });

  expect(setOutcomeContentState).toHaveBeenCalledWith('alreadyCompleted');
  expect(setRequestData).toHaveBeenCalled();
});

it('test verifyRequest with outcome alreadyRejected', async () => {
  vi.mocked(OnboardingApi.verifyOnboarding).mockResolvedValue({
    status: 'REJECTED',
    expiringDate: new Date(Date.now() + 86_400_000),
  } as any);

  await verifyRequest({
    onboardingId: 'onb-1',
    setOutcomeContentState,
    setRequestData,
    setRequiredLogin,
  });

  expect(setOutcomeContentState).toHaveBeenCalledWith('alreadyRejected');
});

it('test verifyRequest with outcome toBeCompleted', async () => {
  vi.mocked(OnboardingApi.verifyOnboarding).mockResolvedValue({
    status: 'PENDING',
    expiringDate: new Date(Date.now() + 86_400_000),
  } as any);

  await verifyRequest({
    onboardingId: 'onb-1',
    setOutcomeContentState,
    setRequestData,
    setRequiredLogin,
  });

  expect(setOutcomeContentState).toHaveBeenCalledWith('toBeCompleted');
});

it('test verifyRequest with outcome expired', async () => {
  vi.mocked(OnboardingApi.verifyOnboarding).mockResolvedValue({
    status: 'PENDING',
    expiringDate: new Date(Date.now() - 86_400_000),
  } as any);

  await verifyRequest({
    onboardingId: 'onb-1',
    setOutcomeContentState,
    setRequestData,
    setRequiredLogin,
  });

  expect(setOutcomeContentState).toHaveBeenCalledWith('expired');
});

it('test verifyRequest with outcome notFound', async () => {
  const fakeError = { response: { status: 409 } };
  vi.mocked(OnboardingApi.verifyOnboarding).mockRejectedValue(fakeError);

  await verifyRequest({
    onboardingId: 'onb-1',
    setOutcomeContentState,
    setRequestData,
    setRequiredLogin,
  });

  expect(setOutcomeContentState).toHaveBeenCalledWith('notFound');
});
