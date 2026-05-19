import { InstitutionType } from '../../../types';
import {
  mockedANACParties,
  mockedAoos,
  mockedInsuranceResource,
  mockedParties,
  mockedPartiesFromInfoCamere,
  mockedPdndVisuraInfomacere,
  mockedUos,
  mockPartyRegistry,
} from '../../lib/__mocks__/mockApiRequests';
import {
  isContractingAuthority,
  isGlobalServiceProvider,
  isGpuInstitution,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isInteropProduct,
  isIoProduct,
  isIoSignProduct,
  isPagoPaProduct,
  isPaymentServiceProvider,
  isPrivateInstitution,
  isPrivateOrPersonInstitution,
  isPublicServiceCompany,
  isTechPartner,
} from '../institutionTypeUtils';
import type { BillingResolverParams } from './billingDataResolvers-test';
import type { Search, Source } from './helpersFunction-test';

export const resolveOrigin = (
  from: Source | undefined,
  institutionType: string,
  productId: string
): string | undefined => {
  if (from === 'IPA') {
    return 'IPA';
  }
  if (from === 'IVASS') {
    return 'IVASS';
  }
  if (from === 'INFOCAMERE') {
    return 'INFOCAMERE';
  }
  if (from === 'PDND_INFOCAMERE') {
    return 'PDND_INFOCAMERE';
  }
  if (from === 'ANAC') {
    return 'ANAC';
  }
  const isSelc =
    from === 'SELC' ||
    (from === 'NO_IPA' && isPaymentServiceProvider(institutionType as InstitutionType)) ||
    isPaymentServiceProvider(institutionType as InstitutionType) ||
    isGpuInstitution(institutionType as InstitutionType) ||
    isTechPartner(institutionType as InstitutionType) ||
    (isPrivateInstitution(institutionType as InstitutionType) &&
      !isInteropProduct(productId) &&
      !isIdpayMerchantProduct(productId)) ||
    (isGlobalServiceProvider(institutionType as InstitutionType) && from === 'NO_IPA');
  return isSelc ? 'SELC' : undefined;
};

// eslint-disable-next-line complexity
export const resolveOriginId = (
  from: Source,
  institutionType: string,
  productId: string,
  typeOfSearch: Search,
  isPrivateMerchant: boolean,
  errorOnSubmit: boolean,
  haveTaxCode: boolean,
  isForeignInsurance: boolean
  // eslint-disable-next-line sonarjs/cognitive-complexity
): string | undefined => {
  if (errorOnSubmit) {
    return mockPartyRegistry.items[1].originId;
  }
  if (isPrivateMerchant) {
    return typeOfSearch === 'personalTaxCode'
      ? mockedPdndVisuraInfomacere[5].businessTaxId
      : mockedPdndVisuraInfomacere[0].businessTaxId;
  }
  if (from === 'NO_IPA') {
    return mockPartyRegistry.items[0].taxCode;
  }
  if (from === 'ANAC') {
    return mockedANACParties[0].originId;
  }
  if (from === 'IVASS') {
    return haveTaxCode
      ? isForeignInsurance
        ? mockedInsuranceResource.items[0].originId
        : mockedInsuranceResource.items[2].originId
      : mockedInsuranceResource.items[4].originId;
  }
  if (from === 'INFOCAMERE') {
    return undefined;
  }
  if (from === 'PDND_INFOCAMERE') {
    return '00112233445';
  }
  if (from === 'SELC') {
    return mockPartyRegistry.items[0].taxCode;
  }
  // IPA and default
  if (typeOfSearch === 'taxCode') {
    return mockedParties[0].originId;
  }
  if (typeOfSearch === 'aooCode') {
    return mockedAoos[0].codiceUniAoo;
  }
  if (typeOfSearch === 'uoCode') {
    return mockedUos[0].codiceUniUo;
  }
  if (
    (isTechPartner(institutionType as InstitutionType) ||
      isGpuInstitution(institutionType as InstitutionType) ||
      isGlobalServiceProvider(institutionType as InstitutionType)) &&
    isPagoPaProduct(productId)
  ) {
    return '991';
  }
  if (isPagoPaProduct(productId) && isPrivateInstitution(institutionType as InstitutionType)) {
    return mockPartyRegistry.items[0].taxCode;
  }
  if (
    isGpuInstitution(institutionType as InstitutionType) &&
    (isInteropProduct(productId) || isIoSignProduct(productId) || isIoProduct(productId))
  ) {
    return undefined;
  }
  return '991';
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const resolveVerifyTaxCode = (p: BillingResolverParams): string | undefined => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].taxCode;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'personalTaxCode') {
    return mockedPdndVisuraInfomacere[5].businessTaxId;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'taxCode') {
    return mockedPdndVisuraInfomacere[0].businessTaxId;
  }
  if (p.from === 'NO_IPA') {
    return '00000000000';
  }
  if (p.from === 'ANAC') {
    return mockedANACParties[0].taxCode;
  }
  if (p.from === 'INFOCAMERE' || p.from === 'PDND_INFOCAMERE') {
    return mockedPartiesFromInfoCamere[0].businessTaxId;
  }
  if (p.from === 'IVASS') {
    return p.haveTaxCode
      ? p.isForeignInsurance
        ? (mockedInsuranceResource.items[0].taxCode ?? '')
        : (mockedInsuranceResource.items[2].taxCode ?? '')
      : mockedInsuranceResource.items[4]?.taxCode;
  }
  // IPA and default
  if (p.typeOfSearch === 'taxCode') {
    return mockedParties[0].taxCode;
  }
  if (p.typeOfSearch === 'personalTaxCode') {
    return mockedPdndVisuraInfomacere[5].businessTaxId;
  }
  if (p.typeOfSearch === 'aooCode') {
    return mockedAoos[0].codiceFiscaleEnte;
  }
  if (p.typeOfSearch === 'uoCode') {
    return mockedUos[0].codiceFiscaleEnte;
  }
  return mockPartyRegistry.items[0].taxCode;
};

type CompanyInfoParams = {
  from: Source;
  institutionType: string;
  productId: string;
  isPrivateMerchant: boolean;
  typeOfSearch: Search;
};

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
export const resolveCompanyInformations = (p: CompanyInfoParams) => {
  const shouldInclude =
    ((p.from === 'ANAC' ||
      p.from === 'INFOCAMERE' ||
      p.from === 'PDND_INFOCAMERE' ||
      ((isGlobalServiceProvider(p.institutionType as InstitutionType) ||
        isGpuInstitution(p.institutionType as InstitutionType)) &&
        p.from !== 'IPA')) &&
      !isTechPartner(p.institutionType as InstitutionType)) ||
    (isPrivateInstitution(p.institutionType as InstitutionType) && isPagoPaProduct(p.productId)) ||
    p.isPrivateMerchant;

  if (!shouldInclude) {
    return undefined;
  }

  return {
    businessRegisterPlace:
      p.from === 'ANAC' ||
      (isPrivateOrPersonInstitution(p.institutionType as InstitutionType) &&
        (isPagoPaProduct(p.productId) ||
          isInteropProduct(p.productId) ||
          isIdpayMerchantProduct(p.productId)))
        ? '01234567891'
        : undefined,
    shareCapital:
      p.from === 'ANAC' ||
      (isPrivateInstitution(p.institutionType as InstitutionType) && isInteropProduct(p.productId))
        ? 332323
        : undefined,
    rea:
      p.from === 'INFOCAMERE' || p.from === 'PDND_INFOCAMERE'
        ? p.isPrivateMerchant && p.typeOfSearch === 'personalTaxCode'
          ? mockedPdndVisuraInfomacere[5].nRea
          : p.isPrivateMerchant && p.typeOfSearch === 'taxCode'
            ? mockedPdndVisuraInfomacere[0].nRea
            : mockedPartiesFromInfoCamere[0].cciaa.concat('-', mockedPartiesFromInfoCamere[0].nRea)
        : isPrivateInstitution(p.institutionType as InstitutionType) && isPagoPaProduct(p.productId)
          ? undefined
          : 'MO-123456',
  };
};

type LocationParams = {
  from: Source;
  institutionType: string;
  productId: string;
  isForeignInsurance?: boolean;
};

export const resolveInstitutionLocationData = (p: LocationParams) => {
  if (p.isForeignInsurance) {
    return { city: 'Valencia', county: undefined, country: 'ES' };
  }
  if (
    (isPublicServiceCompany(p.institutionType as InstitutionType) ||
      (isPrivateInstitution(p.institutionType as InstitutionType) &&
        isInteropProduct(p.productId))) &&
    (p.from === 'INFOCAMERE' || p.from === 'PDND_INFOCAMERE')
  ) {
    return {
      city: mockedPartiesFromInfoCamere[0].city,
      county: mockedPartiesFromInfoCamere[0].county,
      country:
        (isPublicServiceCompany(p.institutionType as InstitutionType) &&
          isInteropProduct(p.productId)) ||
        isPrivateInstitution(p.institutionType as InstitutionType)
          ? 'IT'
          : undefined,
    };
  }
  return { city: 'Milano', county: 'MI', country: 'IT' };
};

// --- Expected value helpers for checkCorrectBodyBillingData ---

export type BillingBodyCheckParams = {
  institutionType: string;
  isPrivateMerchant: boolean;
  haveTaxCode?: boolean;
  isForeignInsurance?: boolean;
};

export const expectedBillingBusinessName = (
  p: BillingBodyCheckParams,
  fallback: string
): string => {
  if (isContractingAuthority(p.institutionType as InstitutionType)) {
    return mockedANACParties[0].description;
  }
  if (isInsuranceCompany(p.institutionType as InstitutionType)) {
    return p.haveTaxCode
      ? p.isForeignInsurance
        ? mockedInsuranceResource.items[0].description
        : mockedInsuranceResource.items[2].description
      : mockedInsuranceResource.items[4].description;
  }
  if (
    isPublicServiceCompany(p.institutionType as InstitutionType) ||
    (isPrivateInstitution(p.institutionType as InstitutionType) && !p.isPrivateMerchant)
  ) {
    return mockedPartiesFromInfoCamere[0].businessName;
  }
  if (p.isPrivateMerchant) {
    return 'Rossi Costruzioni S.r.l.';
  }
  return fallback;
};

export const expectedBillingDigitalAddress = (
  p: BillingBodyCheckParams,
  fallback: string
): string => {
  if (isContractingAuthority(p.institutionType as InstitutionType)) {
    return mockedANACParties[0].digitalAddress;
  }
  if (isInsuranceCompany(p.institutionType as InstitutionType)) {
    return p.haveTaxCode
      ? p.isForeignInsurance
        ? mockedInsuranceResource.items[0].digitalAddress
        : mockedInsuranceResource.items[2].digitalAddress
      : mockedInsuranceResource.items[4].digitalAddress;
  }
  if (
    isPublicServiceCompany(p.institutionType as InstitutionType) ||
    (isPrivateInstitution(p.institutionType as InstitutionType) && !p.isPrivateMerchant)
  ) {
    return mockedPartiesFromInfoCamere[0].digitalAddress;
  }
  if (p.isPrivateMerchant) {
    return 'rossi.costruzioni@pec.it';
  }
  return fallback;
};

export const expectedBillingTaxCode = (p: BillingBodyCheckParams, fallback: string): string => {
  if (isContractingAuthority(p.institutionType as InstitutionType)) {
    return mockedANACParties[0].taxCode;
  }
  if (isInsuranceCompany(p.institutionType as InstitutionType)) {
    return p.isForeignInsurance
      ? (mockedInsuranceResource.items[0].taxCode ?? '')
      : (mockedInsuranceResource.items[2].taxCode ?? '');
  }
  if (
    isPublicServiceCompany(p.institutionType as InstitutionType) ||
    (isPrivateInstitution(p.institutionType as InstitutionType) && !p.isPrivateMerchant)
  ) {
    return mockedPartiesFromInfoCamere[0].businessTaxId;
  }
  if (p.isPrivateMerchant) {
    return '12345678901';
  }
  return fallback;
};

export const expectedBillingZipCode = (p: BillingBodyCheckParams, fallback: string): string => {
  if (
    isPublicServiceCompany(p.institutionType as InstitutionType) ||
    (isPrivateInstitution(p.institutionType as InstitutionType) && !p.isPrivateMerchant)
  ) {
    return mockedPartiesFromInfoCamere[0].zipCode;
  }
  if (p.isPrivateMerchant) {
    return '09010';
  }
  return fallback;
};

export const expectedBillingCity = (p: BillingBodyCheckParams, fallback: string): string => {
  if (
    isPublicServiceCompany(p.institutionType as InstitutionType) ||
    (isPrivateInstitution(p.institutionType as InstitutionType) && !p.isPrivateMerchant)
  ) {
    return mockedPartiesFromInfoCamere[0].city;
  }
  if (p.isPrivateMerchant) {
    return 'Milano';
  }
  return fallback;
};

export const expectedBillingCounty = (p: BillingBodyCheckParams, fallback: string): string => {
  if (
    isPublicServiceCompany(p.institutionType as InstitutionType) ||
    (isPrivateInstitution(p.institutionType as InstitutionType) && !p.isPrivateMerchant)
  ) {
    return mockedPartiesFromInfoCamere[0].county;
  }
  if (p.isPrivateMerchant) {
    return 'MO';
  }
  return fallback;
};

export const expectedBillingRegisteredOffice = (
  p: BillingBodyCheckParams,
  fallback: string
): string => {
  if (
    isPublicServiceCompany(p.institutionType as InstitutionType) ||
    isPrivateInstitution(p.institutionType as InstitutionType)
  ) {
    return mockedPartiesFromInfoCamere[0].address;
  }
  return fallback;
};
