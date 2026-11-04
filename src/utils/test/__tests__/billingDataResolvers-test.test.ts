import {
  mockedANACParties,
  mockedAoos,
  mockedInsuranceResource,
  mockedParties,
  mockedPartiesFromInfoCamere,
  mockedPdndVisuraInfomacere,
  mockedUos,
  mockPartyRegistry,
} from '../../../lib/__mocks__/mockApiRequests';
import {
  type BillingResolverParams,
  resolveBusinessName,
  resolveDigitalAddress,
  resolveTaxCode,
} from '../billingDataResolvers-test';

const params = (overrides: Partial<BillingResolverParams> = {}): BillingResolverParams => ({
  isPrivateMerchant: false,
  typeOfSearch: 'businessName',
  from: 'IPA',
  haveTaxCode: true,
  isForeignInsurance: false,
  ...overrides,
});

type Case<T> = [string, Partial<BillingResolverParams>, T];

const visuraByPersonalTaxCode = mockedPdndVisuraInfomacere[5];
const visuraByTaxCode = mockedPdndVisuraInfomacere[0];
const infocamereParty = mockedPartiesFromInfoCamere[0];
const foreignInsurance = mockedInsuranceResource.items[0];
const italianInsurance = mockedInsuranceResource.items[2];
const insuranceWithoutTaxCode = mockedInsuranceResource.items[4];

describe('resolveBusinessName', () => {
  it.each<Case<string>>([
    ['error on submit', { errorOnSubmit: true }, mockPartyRegistry.items[1].description],
    [
      'private merchant by personal tax code',
      { isPrivateMerchant: true, typeOfSearch: 'personalTaxCode' },
      visuraByPersonalTaxCode.businessName,
    ],
    [
      'private merchant by tax code',
      { isPrivateMerchant: true, typeOfSearch: 'taxCode' },
      visuraByTaxCode.businessName,
    ],
    ['NO_IPA', { from: 'NO_IPA' }, 'businessNameInput'],
    ['ANAC', { from: 'ANAC' }, mockedANACParties[0].description],
    [
      'INFOCAMERE by personal tax code',
      { from: 'INFOCAMERE', typeOfSearch: 'personalTaxCode' },
      visuraByPersonalTaxCode.businessName,
    ],
    ['PDND_INFOCAMERE', { from: 'PDND_INFOCAMERE' }, infocamereParty.businessName],
    ['IVASS foreign', { from: 'IVASS', isForeignInsurance: true }, foreignInsurance.description],
    ['IVASS italian', { from: 'IVASS' }, italianInsurance.description],
    [
      'IVASS without tax code',
      { from: 'IVASS', haveTaxCode: false },
      insuranceWithoutTaxCode.description,
    ],
    ['IPA by tax code', { typeOfSearch: 'taxCode' }, mockedParties[0].description],
    ['IPA by AOO', { typeOfSearch: 'aooCode' }, mockedAoos[0].denominazioneAoo],
    ['IPA by UO', { typeOfSearch: 'uoCode' }, mockedUos[0].descrizioneUo],
    ['IPA by business name', {}, mockPartyRegistry.items[0].description],
    ['SELC uses the IPA search result', { from: 'SELC' }, mockPartyRegistry.items[0].description],
  ])('%s', (_, overrides, expected) => {
    expect(resolveBusinessName(params(overrides))).toBe(expected);
  });
});

describe('resolveDigitalAddress', () => {
  it.each<Case<string>>([
    ['error on submit', { errorOnSubmit: true }, mockPartyRegistry.items[1].digitalAddress],
    [
      'private merchant by personal tax code',
      { isPrivateMerchant: true, typeOfSearch: 'personalTaxCode' },
      visuraByPersonalTaxCode.digitalAddress,
    ],
    [
      'private merchant by tax code',
      { isPrivateMerchant: true, typeOfSearch: 'taxCode' },
      visuraByTaxCode.digitalAddress,
    ],
    ['NO_IPA', { from: 'NO_IPA' }, 'a@a.it'],
    ['ANAC', { from: 'ANAC' }, mockedANACParties[0].digitalAddress],
    [
      'INFOCAMERE by personal tax code',
      { from: 'INFOCAMERE', typeOfSearch: 'personalTaxCode' },
      visuraByPersonalTaxCode.digitalAddress,
    ],
    ['PDND_INFOCAMERE', { from: 'PDND_INFOCAMERE' }, infocamereParty.digitalAddress],
    ['IVASS foreign', { from: 'IVASS', isForeignInsurance: true }, foreignInsurance.digitalAddress],
    ['IVASS italian', { from: 'IVASS' }, italianInsurance.digitalAddress],
    [
      'IVASS without tax code',
      { from: 'IVASS', haveTaxCode: false },
      insuranceWithoutTaxCode.digitalAddress,
    ],
    ['IPA by tax code', { typeOfSearch: 'taxCode' }, mockedParties[0].digitalAddress],
    ['IPA by AOO', { typeOfSearch: 'aooCode' }, mockedAoos[0].mail1],
    ['IPA by UO', { typeOfSearch: 'uoCode' }, mockedUos[0].mail1],
    ['IPA by business name', {}, mockPartyRegistry.items[0].digitalAddress],
  ])('%s', (_, overrides, expected) => {
    expect(resolveDigitalAddress(params(overrides))).toBe(expected);
  });
});

describe('resolveTaxCode', () => {
  it.each<Case<string | undefined>>([
    ['error on submit', { errorOnSubmit: true }, mockPartyRegistry.items[1].taxCode],
    [
      'private merchant by personal tax code',
      { isPrivateMerchant: true, typeOfSearch: 'personalTaxCode' },
      visuraByPersonalTaxCode.businessTaxId,
    ],
    [
      'private merchant by tax code',
      { isPrivateMerchant: true, typeOfSearch: 'taxCode' },
      visuraByTaxCode.businessTaxId,
    ],
    ['IPA by tax code', { typeOfSearch: 'taxCode' }, mockedParties[0].taxCode],
    ['IPA by AOO', { typeOfSearch: 'aooCode' }, mockedAoos[0].codiceFiscaleEnte],
    ['IPA by UO', { typeOfSearch: 'uoCode' }, mockedUos[0].codiceFiscaleEnte],
    ['IPA by business name', {}, mockPartyRegistry.items[0].taxCode],
    ['NO_IPA', { from: 'NO_IPA' }, '00000000000'],
    ['ANAC', { from: 'ANAC' }, mockedANACParties[0].taxCode],
    ['INFOCAMERE', { from: 'INFOCAMERE' }, infocamereParty.businessTaxId],
    ['PDND_INFOCAMERE', { from: 'PDND_INFOCAMERE' }, infocamereParty.businessTaxId],
    ['IVASS foreign', { from: 'IVASS', isForeignInsurance: true }, foreignInsurance.taxCode ?? ''],
    ['IVASS italian', { from: 'IVASS' }, italianInsurance.taxCode ?? ''],
    [
      'IVASS without tax code',
      { from: 'IVASS', haveTaxCode: false },
      insuranceWithoutTaxCode.taxCode,
    ],
    ['SELC', { from: 'SELC' }, '12345678911'],
  ])('%s', (_, overrides, expected) => {
    expect(resolveTaxCode(params(overrides))).toBe(expected);
  });
});
