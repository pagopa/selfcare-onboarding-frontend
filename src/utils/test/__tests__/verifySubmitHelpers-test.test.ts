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
import { PRODUCT_IDS } from '../../constants';
import type { BillingResolverParams } from '../billingDataResolvers-test';
import type { Search, Source } from '../helpersFunction-test';
import {
  resolveCompanyInformations,
  resolveOriginId,
  resolveVerifyTaxCode,
} from '../verifySubmitHelpers-test';

const visuraByPersonalTaxCode = mockedPdndVisuraInfomacere[5];
const visuraByTaxCode = mockedPdndVisuraInfomacere[0];
const infocamereParty = mockedPartiesFromInfoCamere[0];
const foreignInsurance = mockedInsuranceResource.items[0];
const italianInsurance = mockedInsuranceResource.items[2];
const insuranceWithoutTaxCode = mockedInsuranceResource.items[4];

type OriginIdArgs = {
  from: Source;
  institutionType: string;
  productId: string;
  typeOfSearch: Search;
  isPrivateMerchant: boolean;
  errorOnSubmit: boolean;
  haveTaxCode: boolean;
  isForeignInsurance: boolean;
};

const originId = (overrides: Partial<OriginIdArgs>) => {
  const a: OriginIdArgs = {
    from: 'IPA',
    institutionType: 'PA',
    productId: PRODUCT_IDS.IO,
    typeOfSearch: 'businessName',
    isPrivateMerchant: false,
    errorOnSubmit: false,
    haveTaxCode: true,
    isForeignInsurance: false,
    ...overrides,
  };
  return resolveOriginId(
    a.from,
    a.institutionType,
    a.productId,
    a.typeOfSearch,
    a.isPrivateMerchant,
    a.errorOnSubmit,
    a.haveTaxCode,
    a.isForeignInsurance
  );
};

describe('resolveOriginId', () => {
  it.each<[string, Partial<OriginIdArgs>, string | undefined]>([
    ['error on submit', { errorOnSubmit: true }, mockPartyRegistry.items[1].originId],
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
    [
      'CED private institution',
      { institutionType: 'PRV', productId: PRODUCT_IDS.CED },
      mockPartyRegistry.items[0].taxCode,
    ],
    ['NO_IPA', { from: 'NO_IPA' }, mockPartyRegistry.items[0].taxCode],
    ['ANAC', { from: 'ANAC' }, mockedANACParties[0].originId],
    ['IVASS foreign', { from: 'IVASS', isForeignInsurance: true }, foreignInsurance.originId],
    ['IVASS italian', { from: 'IVASS' }, italianInsurance.originId],
    [
      'IVASS without tax code',
      { from: 'IVASS', haveTaxCode: false },
      insuranceWithoutTaxCode.originId,
    ],
    ['INFOCAMERE', { from: 'INFOCAMERE' }, undefined],
    ['PDND_INFOCAMERE', { from: 'PDND_INFOCAMERE' }, '00112233445'],
    ['SELC', { from: 'SELC' }, mockPartyRegistry.items[0].taxCode],
    ['IPA by tax code', { typeOfSearch: 'taxCode' }, mockedParties[0].originId],
    ['IPA by AOO', { typeOfSearch: 'aooCode' }, mockedAoos[0].codiceUniAoo],
    ['IPA by UO', { typeOfSearch: 'uoCode' }, mockedUos[0].codiceUniUo],
    ['IPA tech partner on pagoPA', { institutionType: 'PT', productId: PRODUCT_IDS.PAGOPA }, '991'],
    ['IPA GPU on pagoPA', { institutionType: 'GPU', productId: PRODUCT_IDS.PAGOPA }, '991'],
    ['IPA GSP on pagoPA', { institutionType: 'GSP', productId: PRODUCT_IDS.PAGOPA }, '991'],
    [
      'IPA private institution on pagoPA',
      { institutionType: 'PRV', productId: PRODUCT_IDS.PAGOPA },
      mockPartyRegistry.items[0].taxCode,
    ],
    ['IPA GPU on interop', { institutionType: 'GPU', productId: PRODUCT_IDS.INTEROP }, undefined],
    ['IPA GPU on io-sign', { institutionType: 'GPU', productId: PRODUCT_IDS.IO_SIGN }, undefined],
    ['IPA GPU on io', { institutionType: 'GPU', productId: PRODUCT_IDS.IO }, undefined],
    ['IPA GPU on send', { institutionType: 'GPU', productId: PRODUCT_IDS.SEND }, '991'],
    ['IPA PA on io', {}, '991'],
  ])('%s', (_, overrides, expected) => {
    expect(originId(overrides)).toBe(expected);
  });
});

describe('resolveVerifyTaxCode', () => {
  const params = (overrides: Partial<BillingResolverParams>): BillingResolverParams => ({
    isPrivateMerchant: false,
    typeOfSearch: 'businessName',
    from: 'IPA',
    haveTaxCode: true,
    isForeignInsurance: false,
    ...overrides,
  });

  it.each<[string, Partial<BillingResolverParams>, string | undefined]>([
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
    ['IPA by tax code', { typeOfSearch: 'taxCode' }, mockedParties[0].taxCode],
    [
      'IPA by personal tax code',
      { typeOfSearch: 'personalTaxCode' },
      visuraByPersonalTaxCode.businessTaxId,
    ],
    ['IPA by AOO', { typeOfSearch: 'aooCode' }, mockedAoos[0].codiceFiscaleEnte],
    ['IPA by UO', { typeOfSearch: 'uoCode' }, mockedUos[0].codiceFiscaleEnte],
    ['IPA by business name', {}, mockPartyRegistry.items[0].taxCode],
    ['SELC', { from: 'SELC' }, mockPartyRegistry.items[0].taxCode],
  ])('%s', (_, overrides, expected) => {
    expect(resolveVerifyTaxCode(params(overrides))).toBe(expected);
  });
});

describe('resolveCompanyInformations', () => {
  type CompanyInfoArgs = Parameters<typeof resolveCompanyInformations>[0];
  const params = (overrides: Partial<CompanyInfoArgs>): CompanyInfoArgs => ({
    from: 'IPA',
    institutionType: 'PA',
    productId: PRODUCT_IDS.IO,
    isPrivateMerchant: false,
    typeOfSearch: 'businessName',
    ...overrides,
  });
  const infocamereRea = infocamereParty.cciaa.concat('-', infocamereParty.nRea);

  it.each<[string, Partial<CompanyInfoArgs>, ReturnType<typeof resolveCompanyInformations>]>([
    ['PA from IPA', {}, undefined],
    ['GSP from IPA', { institutionType: 'GSP', productId: PRODUCT_IDS.PAGOPA }, undefined],
    ['tech partner from ANAC', { from: 'ANAC', institutionType: 'PT' }, undefined],
    [
      'contracting authority from ANAC',
      { from: 'ANAC', institutionType: 'SA', productId: PRODUCT_IDS.INTEROP },
      { businessRegisterPlace: '01234567891', shareCapital: 332323, rea: 'MO-123456' },
    ],
    [
      'public service company from INFOCAMERE',
      { from: 'INFOCAMERE', institutionType: 'SCP', productId: PRODUCT_IDS.INTEROP },
      { businessRegisterPlace: undefined, shareCapital: undefined, rea: infocamereRea },
    ],
    [
      'private institution on interop from INFOCAMERE',
      { from: 'INFOCAMERE', institutionType: 'PRV', productId: PRODUCT_IDS.INTEROP },
      { businessRegisterPlace: '01234567891', shareCapital: 332323, rea: infocamereRea },
    ],
    [
      'private merchant by tax code from PDND_INFOCAMERE',
      {
        from: 'PDND_INFOCAMERE',
        institutionType: 'PRV',
        productId: PRODUCT_IDS.IDPAY_MERCHANT,
        isPrivateMerchant: true,
        typeOfSearch: 'taxCode',
      },
      { businessRegisterPlace: '01234567891', shareCapital: undefined, rea: visuraByTaxCode.nRea },
    ],
    [
      'private merchant by personal tax code from PDND_INFOCAMERE',
      {
        from: 'PDND_INFOCAMERE',
        institutionType: 'PRV_PF',
        productId: PRODUCT_IDS.IDPAY_MERCHANT,
        isPrivateMerchant: true,
        typeOfSearch: 'personalTaxCode',
      },
      {
        businessRegisterPlace: '01234567891',
        shareCapital: undefined,
        rea: visuraByPersonalTaxCode.nRea,
      },
    ],
    [
      'private merchant from IPA',
      {
        institutionType: 'PRV',
        productId: PRODUCT_IDS.IDPAY_MERCHANT,
        isPrivateMerchant: true,
      },
      { businessRegisterPlace: '01234567891', shareCapital: undefined, rea: 'MO-123456' },
    ],
    [
      'GSP without IPA',
      { from: 'NO_IPA', institutionType: 'GSP', productId: PRODUCT_IDS.PAGOPA },
      { businessRegisterPlace: undefined, shareCapital: undefined, rea: 'MO-123456' },
    ],
    [
      'GPU from SELC',
      { from: 'SELC', institutionType: 'GPU', productId: PRODUCT_IDS.PAGOPA },
      { businessRegisterPlace: undefined, shareCapital: undefined, rea: 'MO-123456' },
    ],
    [
      'private institution on pagoPA',
      { institutionType: 'PRV', productId: PRODUCT_IDS.PAGOPA },
      { businessRegisterPlace: '01234567891', shareCapital: undefined, rea: undefined },
    ],
  ])('%s', (_, overrides, expected) => {
    expect(resolveCompanyInformations(params(overrides))).toEqual(expected);
  });
});
