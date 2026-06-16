import { it, expect, vi, beforeEach } from 'vitest';
import { fetchWithLogs } from '../../lib/api-utils';
import { verifyRecipientCodeIsValid } from '../billingDataServices';

vi.mock('../../lib/api-utils', () => ({
  fetchWithLogs: vi.fn(),
}));

const setRecipientCodeStatus = vi.fn();
const setRequiredLogin = vi.fn();
const setFieldValue = vi.fn();
const formik = { setFieldValue } as any;
const uoSelected = { id: 'uo-1' } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

it('test verifyRecipientCodeIsValid success ACCEPTED', async () => {
  vi.mocked(fetchWithLogs).mockResolvedValue({
    status: 200,
    data: 'ACCEPTED',
  } as any);

  await verifyRecipientCodeIsValid(
    'A1B2C3',
    uoSelected,
    formik,
    setRecipientCodeStatus,
    setRequiredLogin,
    'orig-1'
  );

  expect(fetchWithLogs).toHaveBeenCalledWith(
    { endpoint: 'ONBOARDING_RECIPIENT_CODE_VALIDATION' },
    { method: 'GET', params: { recipientCode: 'A1B2C3', originId: 'orig-1' } },
    expect.any(Function)
  );
  expect(setRecipientCodeStatus).toHaveBeenCalledWith('ACCEPTED');
  expect(setFieldValue).not.toHaveBeenCalled();
});

it('test verifyRecipientCodeIsValid resets recipientCode when DENIED_NO_BILLING and uoSelected', async () => {
  vi.mocked(fetchWithLogs).mockResolvedValue({
    status: 200,
    data: 'DENIED_NO_BILLING',
  } as any);

  await verifyRecipientCodeIsValid(
    'A1B2C3',
    uoSelected,
    formik,
    setRecipientCodeStatus,
    setRequiredLogin,
    'orig-1'
  );

  expect(setFieldValue).toHaveBeenCalledWith('recipientCode', undefined);
  expect(setRecipientCodeStatus).toHaveBeenCalledWith('DENIED_NO_BILLING');
});

it('test verifyRecipientCodeIsValid does NOT reset recipientCode when DENIED_NO_BILLING but no uoSelected', async () => {
  vi.mocked(fetchWithLogs).mockResolvedValue({
    status: 200,
    data: 'DENIED_NO_BILLING',
  } as any);

  await verifyRecipientCodeIsValid(
    'A1B2C3',
    undefined,
    formik,
    setRecipientCodeStatus,
    setRequiredLogin,
    'orig-1'
  );

  expect(setFieldValue).not.toHaveBeenCalled();
  expect(setRecipientCodeStatus).toHaveBeenCalledWith('DENIED_NO_BILLING');
});

it('test verifyRecipientCodeIsValid handles error', async () => {
  vi.mocked(fetchWithLogs).mockResolvedValue({
    isAxiosError: true,
    response: { status: 500 },
  } as any);

  await verifyRecipientCodeIsValid(
    'A1B2C3',
    uoSelected,
    formik,
    setRecipientCodeStatus,
    setRequiredLogin,
    'orig-1'
  );

  expect(setRecipientCodeStatus).toHaveBeenCalledWith('DENIED_NO_ASSOCIATION');
});

it('test verifyRecipientCodeIsValid passes originId=undefined when not provided', async () => {
  vi.mocked(fetchWithLogs).mockResolvedValue({
    status: 200,
    data: 'ACCEPTED',
  } as any);

  await verifyRecipientCodeIsValid(
    'A1B2C3',
    uoSelected,
    formik,
    setRecipientCodeStatus,
    setRequiredLogin
  );

  expect(fetchWithLogs).toHaveBeenCalledWith(
    { endpoint: 'ONBOARDING_RECIPIENT_CODE_VALIDATION' },
    { method: 'GET', params: { recipientCode: 'A1B2C3', originId: undefined } },
    expect.any(Function)
  );
});
