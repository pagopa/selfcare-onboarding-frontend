import { it, expect, vi, beforeEach } from 'vitest';
import { PartyRegistryProxyApi } from '../../api/PartyRegistryProxyApiClient';
import {
  handleSearchByTaxCode,
  getUoInfoFromRecipientCode,
  handleSearchExternalId,
  getECDataByCF,
} from '../institutionServices';

vi.mock('../../api/PartyRegistryProxyApiClient', () => ({
  PartyRegistryProxyApi: {
    findInstitution: vi.fn(),
    getUoInfo: vi.fn(),
  },
}));

const setRetrievedIstat = vi.fn();
const setOriginId4Premium = vi.fn();
const setDisableTaxCodeInvoicing = vi.fn();
const setApiLoading = vi.fn();
const setEcData = vi.fn();
const setFieldValue = vi.fn();
const formik = { setFieldValue } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

it('test handleSearchByTaxCode success sets istat and originId', async () => {
  vi.mocked(PartyRegistryProxyApi.findInstitution).mockResolvedValue({
    istatCode: 'IST1',
    originId: 'OR1',
  } as any);

  await handleSearchByTaxCode('tc1', 'cat-x', setRetrievedIstat, setOriginId4Premium);

  expect(PartyRegistryProxyApi.findInstitution).toHaveBeenCalledWith('tc1', 'IPA', 'cat-x');
  expect(setRetrievedIstat).toHaveBeenCalledWith('IST1');
  expect(setOriginId4Premium).toHaveBeenCalledWith('OR1');
});

it('test handleSearchByTaxCode on error does nothing', async () => {
  vi.mocked(PartyRegistryProxyApi.findInstitution).mockRejectedValue(new Error('boom'));

  await handleSearchByTaxCode('tc1', undefined, setRetrievedIstat, setOriginId4Premium);

  expect(setRetrievedIstat).not.toHaveBeenCalled();
  expect(setOriginId4Premium).not.toHaveBeenCalled();
});

it('test getUoInfoFromRecipientCode success sets formik and disables field', async () => {
  vi.mocked(PartyRegistryProxyApi.getUoInfo).mockResolvedValue({
    codiceFiscaleSfe: '998877665544',
  } as any);

  await getUoInfoFromRecipientCode('A1B2C3', setDisableTaxCodeInvoicing, formik);

  expect(PartyRegistryProxyApi.getUoInfo).toHaveBeenCalledWith('A1B2C3');
  expect(setFieldValue).toHaveBeenCalledWith('taxCodeInvoicing', '998877665544');
  expect(setDisableTaxCodeInvoicing).toHaveBeenCalledWith(true);
});

it('test getUoInfoFromRecipientCode on error disables field=false', async () => {
  vi.mocked(PartyRegistryProxyApi.getUoInfo).mockRejectedValue(new Error('boom'));

  await getUoInfoFromRecipientCode('UO1', setDisableTaxCodeInvoicing, formik);

  expect(setDisableTaxCodeInvoicing).toHaveBeenCalledWith(false);
  expect(setFieldValue).not.toHaveBeenCalled();
});

it('test handleSearchExternalId success returns party data', async () => {
  vi.mocked(PartyRegistryProxyApi.findInstitution).mockResolvedValue({ id: 'p1' } as any);

  const result = await handleSearchExternalId('ext-1');

  expect(PartyRegistryProxyApi.findInstitution).toHaveBeenCalledWith('ext-1');
  expect(result).toMatchObject({ id: 'p1' });
});

it('test handleSearchExternalId on error returns null', async () => {
  vi.mocked(PartyRegistryProxyApi.findInstitution).mockRejectedValue(new Error('boom'));
  const result = await handleSearchExternalId('ext-1');
  expect(result).toBeNull();
});

it('test getECDataByCF success sets data and toggles loading', async () => {
  vi.mocked(PartyRegistryProxyApi.findInstitution).mockResolvedValue({ id: 'p1' } as any);

  await getECDataByCF('tc1', setApiLoading, setEcData);

  expect(setApiLoading).toHaveBeenNthCalledWith(1, true);
  expect(setApiLoading).toHaveBeenLastCalledWith(false);
  expect(setEcData).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
});

it('test getECDataByCF on 404 sets null', async () => {
  const err404 = Object.assign(new Error('not found'), { httpStatus: 404 });
  vi.mocked(PartyRegistryProxyApi.findInstitution).mockRejectedValue(err404);

  await getECDataByCF('tc1', setApiLoading, setEcData);

  expect(setEcData).toHaveBeenCalledWith(null);
});

it('test getECDataByCF on other error does not change ecData', async () => {
  const err500 = Object.assign(new Error('boom'), { httpStatus: 500 });
  vi.mocked(PartyRegistryProxyApi.findInstitution).mockRejectedValue(err500);

  await getECDataByCF('tc1', setApiLoading, setEcData);

  expect(setEcData).not.toHaveBeenCalled();
  expect(setApiLoading).toHaveBeenLastCalledWith(false);
});
