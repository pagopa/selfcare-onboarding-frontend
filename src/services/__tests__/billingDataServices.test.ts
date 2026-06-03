import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { verifyRecipientCodeIsValid } from '../billingDataServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    verifyRecipientCode: vi.fn(),
  },
}));

const setRecipientCodeStatus = vi.fn();
const setFieldValue = vi.fn();
const formik = { setFieldValue } as any;
const uoSelected = { id: 'uo-1' } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

it('test verifyRecipientCodeIsValid success ACCEPTED', async () => {
  vi.mocked(OnboardingApi.verifyRecipientCode).mockResolvedValue('ACCEPTED');

  await verifyRecipientCodeIsValid('A1B2C3', uoSelected, formik, setRecipientCodeStatus, 'orig-1');

  expect(OnboardingApi.verifyRecipientCode).toHaveBeenCalledWith('orig-1', 'A1B2C3');
  expect(setRecipientCodeStatus).toHaveBeenCalledWith('ACCEPTED');
  expect(setFieldValue).not.toHaveBeenCalled();
});

it('test verifyRecipientCodeIsValid resets recipientCode when DENIED_NO_BILLING and uoSelected', async () => {
  vi.mocked(OnboardingApi.verifyRecipientCode).mockResolvedValue('DENIED_NO_BILLING');

  await verifyRecipientCodeIsValid('A1B2C3', uoSelected, formik, setRecipientCodeStatus, 'orig-1');

  expect(setFieldValue).toHaveBeenCalledWith('recipientCode', undefined);
  expect(setRecipientCodeStatus).toHaveBeenCalledWith('DENIED_NO_BILLING');
});

it('test verifyRecipientCodeIsValid does NOT reset recipientCode when DENIED_NO_BILLING but no uoSelected', async () => {
  vi.mocked(OnboardingApi.verifyRecipientCode).mockResolvedValue('DENIED_NO_BILLING');

  await verifyRecipientCodeIsValid('A1B2C3', undefined, formik, setRecipientCodeStatus, 'orig-1');

  expect(setFieldValue).not.toHaveBeenCalled();
  expect(setRecipientCodeStatus).toHaveBeenCalledWith('DENIED_NO_BILLING');
});

it('test verifyRecipientCodeIsValid handles error', async () => {
  vi.mocked(OnboardingApi.verifyRecipientCode).mockRejectedValue(new Error('boom'));

  await verifyRecipientCodeIsValid('A1B2C3', uoSelected, formik, setRecipientCodeStatus, 'orig-1');

  expect(setRecipientCodeStatus).toHaveBeenCalledWith('error');
});

it('test verifyRecipientCodeIsValid uses empty string when originId is undefined', async () => {
  vi.mocked(OnboardingApi.verifyRecipientCode).mockResolvedValue('ACCEPTED');

  await verifyRecipientCodeIsValid('A1B2C3', uoSelected, formik, setRecipientCodeStatus);

  expect(OnboardingApi.verifyRecipientCode).toHaveBeenCalledWith('', 'A1B2C3');
});
