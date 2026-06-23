import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { PartyRegistryProxyApi } from '../../api/PartyRegistryProxyApiClient';
import { verifyRecipientCodeIsValid, verifyTaxCodeInvoicing } from '../billingDataServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    verifyRecipientCode: vi.fn(),
  },
}));

vi.mock('../../api/PartyRegistryProxyApiClient', () => ({
  PartyRegistryProxyApi: {
    getUoList: vi.fn(),
  },
}));

const setRecipientCodeStatus = vi.fn();
const setInvalidTaxCodeInvoicing = vi.fn();
const setFieldValue = vi.fn();
const formik = { setFieldValue, values: { taxCode: 'ENTE123' } } as any;
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
  vi.mocked(OnboardingApi.verifyRecipientCode).mockRejectedValue(new Error('HTTP 500'));

  await verifyRecipientCodeIsValid('A1B2C3', uoSelected, formik, setRecipientCodeStatus, 'orig-1');

  expect(setRecipientCodeStatus).toHaveBeenCalledWith('DENIED_NO_ASSOCIATION');
});

it('test verifyRecipientCodeIsValid passes originId="" when not provided', async () => {
  vi.mocked(OnboardingApi.verifyRecipientCode).mockResolvedValue('ACCEPTED');

  await verifyRecipientCodeIsValid('A1B2C3', uoSelected, formik, setRecipientCodeStatus);

  expect(OnboardingApi.verifyRecipientCode).toHaveBeenCalledWith('', 'A1B2C3');
});

it('test verifyTaxCodeInvoicing valid when a UO matches the taxCode', async () => {
  vi.mocked(PartyRegistryProxyApi.getUoList).mockResolvedValue({
    count: 1,
    items: [{ codiceFiscaleEnte: 'ENTE123' }],
  } as any);

  await verifyTaxCodeInvoicing('9988776655', formik, setInvalidTaxCodeInvoicing);

  expect(PartyRegistryProxyApi.getUoList).toHaveBeenCalledWith('9988776655');
  expect(setInvalidTaxCodeInvoicing).toHaveBeenCalledWith(false);
});

it('test verifyTaxCodeInvoicing invalid when no UO matches the taxCode', async () => {
  vi.mocked(PartyRegistryProxyApi.getUoList).mockResolvedValue({
    count: 1,
    items: [{ codiceFiscaleEnte: 'OTHER999' }],
  } as any);

  await verifyTaxCodeInvoicing('9988776655', formik, setInvalidTaxCodeInvoicing);

  expect(setInvalidTaxCodeInvoicing).toHaveBeenCalledWith(true);
});

it('test verifyTaxCodeInvoicing leaves flag untouched on error', async () => {
  vi.mocked(PartyRegistryProxyApi.getUoList).mockRejectedValue(new Error('HTTP 500'));

  await verifyTaxCodeInvoicing('9988776655', formik, setInvalidTaxCodeInvoicing);

  expect(setInvalidTaxCodeInvoicing).not.toHaveBeenCalled();
});
