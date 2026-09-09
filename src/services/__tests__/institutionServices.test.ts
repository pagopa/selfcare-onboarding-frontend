import { it, expect, vi, beforeEach } from 'vitest';
import { PartyRegistryProxyApi } from '../../api/PartyRegistryProxyApiClient';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import {
  handleSearchByTaxCode,
  getUoInfoFromRecipientCode,
  handleSearchExternalId,
  getECDataByCF,
  fetchInstitutionsByName,
  handleSearchByAooCode,
  handleSearchByUoCode,
  contractingInsuranceFromTaxId,
  fetchInstitutionByTaxCode,
  handleSearchByReaCode,
} from '../institutionServices';

vi.mock('../../api/PartyRegistryProxyApiClient', () => ({
  PartyRegistryProxyApi: {
    findInstitution: vi.fn(),
    getUoInfo: vi.fn(),
    searchInstitutions: vi.fn(),
    searchSaParties: vi.fn(),
    searchInsuranceCompanies: vi.fn(),
    getAooInfo: vi.fn(),
    getSaPartyByTaxId: vi.fn(),
    getInsuranceByTaxId: vi.fn(),
    getInfocamereByTaxCode: vi.fn(),
    getVisuraByTaxCode: vi.fn(),
    getVisuraByRea: vi.fn(),
  },
}));

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    getInstitutionsByFilters: vi.fn(),
  },
}));

vi.mock('../../lib/api-utils', () => ({
  fetchWithLogs: vi.fn(),
}));

const setRetrievedIstat = vi.fn();
const setOriginId4Premium = vi.fn();
const setDisableTaxCodeInvoicing = vi.fn();
const setApiLoading = vi.fn();
const setEcData = vi.fn();
const setFieldValue = vi.fn();
const setOptions = vi.fn();
const setAooResult = vi.fn();
const setAooResultHistory = vi.fn();
const setUoResult = vi.fn();
const setUoResultHistory = vi.fn();
const setCfResult = vi.fn();
const setDisabled = vi.fn();
const setRequiredLogin = vi.fn();
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
  vi.mocked(PartyRegistryProxyApi.getUoInfo).mockRejectedValue(new Error('HTTP 500'));

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

it('test fetchInstitutionsByName dispatches to searchInstitutions and maps options', async () => {
  vi.mocked(PartyRegistryProxyApi.searchInstitutions).mockResolvedValue({
    count: 1,
    items: [{ id: 'i1', description: 'Ente 1' }],
  } as any);

  await fetchInstitutionsByName(
    'Ente',
    { endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' },
    setOptions,
    (d: any) => d.items,
    setRequiredLogin,
    10,
    undefined
  );

  expect(PartyRegistryProxyApi.searchInstitutions).toHaveBeenCalledWith({
    limit: 10,
    page: 1,
    search: 'Ente',
    categories: undefined,
  });
  expect(setOptions).toHaveBeenCalledWith([{ id: 'i1', description: 'Ente 1' }]);
});

it('test fetchInstitutionsByName on 404 sets empty options', async () => {
  vi.mocked(PartyRegistryProxyApi.searchInstitutions).mockRejectedValue(
    Object.assign(new Error('nf'), { httpStatus: 404 })
  );

  await fetchInstitutionsByName(
    'Ente',
    { endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' },
    setOptions,
    (d: any) => d.items,
    setRequiredLogin
  );

  expect(setOptions).toHaveBeenCalledWith([]);
});

it('test handleSearchByAooCode dispatches to getAooInfo and sets result', async () => {
  vi.mocked(PartyRegistryProxyApi.getAooInfo).mockResolvedValue({
    codiceUniAoo: 'AOO12345',
    cap: '20100',
  } as any);

  await handleSearchByAooCode('AOO1234', setAooResult, setAooResultHistory, setRequiredLogin);

  expect(PartyRegistryProxyApi.getAooInfo).toHaveBeenCalledWith('AOO1234', undefined);
  expect(setAooResult).toHaveBeenCalledWith({ codiceUniAoo: 'AOO12345', cap: '20100' });
  expect(setAooResultHistory).toHaveBeenCalledWith({ codiceUniAoo: 'AOO12345', cap: '20100' });
});

it('test handleSearchByUoCode dispatches to getUoInfo and sets result', async () => {
  vi.mocked(PartyRegistryProxyApi.getUoInfo).mockResolvedValue({
    codiceUniUo: 'UO123',
    cap: '20100',
  } as any);

  await handleSearchByUoCode('UO123', setUoResult, setUoResultHistory, setRequiredLogin);

  expect(PartyRegistryProxyApi.getUoInfo).toHaveBeenCalledWith('UO123');
  expect(setUoResult).toHaveBeenCalledWith({ codiceUniUo: 'UO123', cap: '20100' });
});

it('test handleSearchByUoCode on 404 resets result', async () => {
  vi.mocked(PartyRegistryProxyApi.getUoInfo).mockRejectedValue(
    Object.assign(new Error('nf'), { httpStatus: 404 })
  );

  await handleSearchByUoCode('UO123', setUoResult, setUoResultHistory, setRequiredLogin);

  expect(setUoResult).toHaveBeenCalledWith(undefined);
});

it('test contractingInsuranceFromTaxId dispatches insurance by taxId', async () => {
  vi.mocked(PartyRegistryProxyApi.getInsuranceByTaxId).mockResolvedValue({
    id: 'ins1',
    taxCode: '12345678901',
  } as any);

  await contractingInsuranceFromTaxId(
    false,
    'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE',
    {},
    '12345678901',
    'AS' as any,
    setApiLoading,
    setCfResult,
    setRequiredLogin
  );

  expect(PartyRegistryProxyApi.getInsuranceByTaxId).toHaveBeenCalledWith('12345678901');
  expect(setCfResult).toHaveBeenCalledWith({ id: 'ins1', taxCode: '12345678901' });
});

it('test contractingInsuranceFromTaxId addUser dispatches to getInstitutionsByFilters', async () => {
  vi.mocked(OnboardingApi.getInstitutionsByFilters).mockResolvedValue([
    { id: 'p1', description: 'P1' },
  ] as any);

  await contractingInsuranceFromTaxId(
    true,
    'ONBOARDING_GET_INSTITUTIONS',
    { productId: 'prod-1', taxCode: '12345678901' },
    '12345678901',
    'SA' as any,
    setApiLoading,
    setCfResult,
    setRequiredLogin
  );

  expect(OnboardingApi.getInstitutionsByFilters).toHaveBeenCalledWith({
    productId: 'prod-1',
    taxCode: '12345678901',
  });
  expect(setCfResult).toHaveBeenCalledWith({ id: 'p1', description: 'P1' });
});

it('test fetchInstitutionByTaxCode dispatches to infocamere and sets cfResult', async () => {
  vi.mocked(PartyRegistryProxyApi.getInfocamereByTaxCode).mockResolvedValue({
    businessTaxId: '12345678901',
    atecoCodes: ['62.01'],
  } as any);

  await fetchInstitutionByTaxCode(
    false,
    'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE',
    {},
    '12345678901',
    'prod-1',
    'PT' as any,
    undefined,
    undefined,
    setCfResult,
    undefined,
    setDisabled,
    setRequiredLogin
  );

  expect(PartyRegistryProxyApi.getInfocamereByTaxCode).toHaveBeenCalledWith('12345678901');
  expect(setCfResult).toHaveBeenCalledWith({
    businessTaxId: '12345678901',
    atecoCodes: ['62.01'],
  });
});

it('test handleSearchByReaCode dispatches to getVisuraByRea', async () => {
  vi.mocked(PartyRegistryProxyApi.getVisuraByRea).mockResolvedValue({
    businessTaxId: '999',
  } as any);

  await handleSearchByReaCode(
    false,
    'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA',
    {},
    'AB-123456',
    setApiLoading,
    setCfResult,
    setDisabled,
    setRequiredLogin,
    { id: 'prod-1' } as any,
    undefined,
    undefined,
    undefined
  );

  expect(PartyRegistryProxyApi.getVisuraByRea).toHaveBeenCalledWith('AB-123456');
  expect(setCfResult).toHaveBeenCalledWith({ businessTaxId: '999' });
});

it('test handleSearchByReaCode invalid rea pattern resets without calling api', async () => {
  await handleSearchByReaCode(
    false,
    'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA',
    {},
    'not-a-rea',
    setApiLoading,
    setCfResult,
    setDisabled,
    setRequiredLogin,
    { id: 'prod-1' } as any,
    undefined,
    undefined,
    undefined
  );

  expect(PartyRegistryProxyApi.getVisuraByRea).not.toHaveBeenCalled();
  expect(setCfResult).toHaveBeenCalledWith(undefined);
});
