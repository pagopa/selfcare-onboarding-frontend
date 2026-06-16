import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { onExitPremiumFlow, handleSearchUserParties } from '../subProductServices';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    getInstitutions: vi.fn(),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

const setParties = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  const win = window as any;
  delete win.location;
  win.location = { assign: vi.fn() };
});

it('test onExitPremiumFlow redirects to dashboard when parties exist', async () => {
  vi.mocked(OnboardingApi.getInstitutions).mockResolvedValue([
    { id: '1', description: 'Party 1' },
  ] as any);

  await onExitPremiumFlow('prod-io');

  expect(trackEvent).toHaveBeenCalledWith('PREMIUM_USER EXIT');
  expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining('/'));
});

it('test onExitPremiumFlow redirects to PagoPA site when parties empty', async () => {
  vi.mocked(OnboardingApi.getInstitutions).mockResolvedValue([] as any);

  await onExitPremiumFlow('prod-io');

  expect(window.location.assign).toHaveBeenCalledWith(
    'https://www.pagopa.it/it/prodotti-e-servizi/app-io'
  );
});

it('test onExitPremiumFlow on error tracks failure with detail', async () => {
  const error = Object.assign(new Error('boom'), {
    httpStatus: 500,
    httpBody: { detail: 'server exploded' },
  });
  vi.mocked(OnboardingApi.getInstitutions).mockRejectedValue(error);

  await onExitPremiumFlow('prod-io');

  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_REDIRECT_TO_ONBOARDING_FAILURE',
    expect.objectContaining({ product_id: 'prod-io', reason: 'server exploded' })
  );
});

it('test handleSearchUserParties maps parties with urlLogo on success', async () => {
  vi.mocked(OnboardingApi.getInstitutions).mockResolvedValue([
    { id: 'p1', description: 'P 1' },
    { id: 'p2', description: 'P 2' },
  ] as any);

  await handleSearchUserParties(setParties, 'prod', 'sub-prod');

  expect(OnboardingApi.getInstitutions).toHaveBeenCalledWith('sub-prod');
  expect(setParties).toHaveBeenCalledWith([
    expect.objectContaining({ id: 'p1', urlLogo: expect.any(String) }),
    expect.objectContaining({ id: 'p2', urlLogo: expect.any(String) }),
  ]);
});

it('test handleSearchUserParties sets empty parties on error', async () => {
  vi.mocked(OnboardingApi.getInstitutions).mockRejectedValue(new Error('boom'));

  await handleSearchUserParties(setParties, 'prod', 'sub-prod');

  expect(setParties).toHaveBeenCalledWith([]);
});
