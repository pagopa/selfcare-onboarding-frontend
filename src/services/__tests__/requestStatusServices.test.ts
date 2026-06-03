import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { deleteRequest } from '../requestStatusServices';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    deleteOnboardingRequest: vi.fn(),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

const setOutcomeContentState = vi.fn();
const setLoading = vi.fn();

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