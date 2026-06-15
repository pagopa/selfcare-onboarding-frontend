import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { checkManager, searchUserId } from '../managerServices';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    checkManager: vi.fn(),
    searchUserId: vi.fn(),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

const setLoading = vi.fn();
const setIsChangedManager = vi.fn();
const addError = vi.fn();
const validateUserData = vi.fn();
const people = { 'manager-initial': { name: 'Mario' } } as any;
const product = { id: 'prod-1' };
const subProduct = undefined;
const selectedParty = { origin: 'IPA', originId: 'or1', taxCode: 'TC1' };
const onboardingFormData = { aooUniqueCode: undefined, uoUniqueCode: undefined } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

it('test checkManager unchanged manager tracks event', async () => {
  vi.mocked(OnboardingApi.checkManager).mockResolvedValue({ result: false } as any);

  await checkManager(
    'u1',
    setLoading,
    setIsChangedManager,
    'PA' as any,
    selectedParty,
    onboardingFormData,
    addError,
    validateUserData,
    people,
    'ext-1',
    product,
    subProduct,
    'req-1'
  );

  expect(setIsChangedManager).toHaveBeenCalledWith(true);
  expect(trackEvent).toHaveBeenCalledWith('CHANGE_LEGAL_REPRESENTATIVE', expect.any(Object));
  expect(validateUserData).not.toHaveBeenCalled();
});

it('test checkManager changed manager validates user', async () => {
  vi.mocked(OnboardingApi.checkManager).mockResolvedValue({ result: true } as any);

  await checkManager(
    'u1',
    setLoading,
    setIsChangedManager,
    'PA' as any,
    selectedParty,
    onboardingFormData,
    addError,
    validateUserData,
    people,
    'ext-1',
    product,
    subProduct,
    'req-1'
  );

  expect(setIsChangedManager).toHaveBeenCalledWith(false);
  expect(validateUserData).toHaveBeenCalled();
  expect(trackEvent).not.toHaveBeenCalled();
});

it('test checkManager on error adds error and validates user', async () => {
  vi.mocked(OnboardingApi.checkManager).mockRejectedValue(new Error('boom'));

  await checkManager(
    'u1',
    setLoading,
    setIsChangedManager,
    'PA' as any,
    selectedParty,
    onboardingFormData,
    addError,
    validateUserData,
    people,
    'ext-1',
    product,
    subProduct,
    'req-1'
  );

  expect(addError).toHaveBeenCalledWith(expect.objectContaining({ id: 'CHECK_MANAGER_ERROR' }));
  expect(validateUserData).toHaveBeenCalled();
});

it('test searchUserId success triggers checkManager', async () => {
  vi.mocked(OnboardingApi.searchUserId).mockResolvedValue({ id: 'user-found' } as any);
  vi.mocked(OnboardingApi.checkManager).mockResolvedValue({ result: true } as any);

  await searchUserId(
    'TC1',
    setLoading,
    addError,
    validateUserData,
    people,
    'ext-1',
    subProduct,
    setIsChangedManager,
    'PA' as any,
    selectedParty,
    onboardingFormData,
    product
  );

  expect(OnboardingApi.searchUserId).toHaveBeenCalledWith({ taxCode: 'TC1' });
  expect(OnboardingApi.checkManager).toHaveBeenCalled();
});

it('test searchUserId on error adds error and validates user', async () => {
  vi.mocked(OnboardingApi.searchUserId).mockRejectedValue(new Error('boom'));

  await searchUserId(
    'TC1',
    setLoading,
    addError,
    validateUserData,
    people,
    'ext-1',
    subProduct,
    setIsChangedManager,
    'PA' as any,
    selectedParty,
    onboardingFormData,
    product
  );

  expect(addError).toHaveBeenCalledWith(expect.objectContaining({ id: 'SEARCH_USER_ERROR' }));
  expect(validateUserData).toHaveBeenCalled();
  expect(OnboardingApi.checkManager).not.toHaveBeenCalled();
});
