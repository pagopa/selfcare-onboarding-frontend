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
import { canInvoice } from '../constants';
import {
  isCedProduct,
  isGlobalServiceProvider,
  isGpuInstitution,
  isIoProduct,
  isPaymentServiceProvider,
} from '../institutionTypeUtils';
import type { Search, Source } from './helpersFunction-test';

export type BillingResolverParams = {
  errorOnSubmit?: boolean;
  isPrivateMerchant: boolean;
  typeOfSearch: Search;
  from: Source;
  haveTaxCode?: boolean;
  isForeignInsurance?: boolean;
  institutionType?: string;
  productId?: string;
  SfeAvailable?: boolean;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const resolveBusinessName = (p: BillingResolverParams): string => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].description;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'personalTaxCode') {
    return mockedPdndVisuraInfomacere[5].businessName;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'taxCode') {
    return mockedPdndVisuraInfomacere[0].businessName;
  }
  if (p.from === 'NO_IPA') {
    return 'businessNameInput';
  }
  if (p.from === 'ANAC') {
    return mockedANACParties[0].description;
  }
  if (p.from === 'INFOCAMERE' || p.from === 'PDND_INFOCAMERE') {
    return p.typeOfSearch === 'personalTaxCode'
      ? mockedPdndVisuraInfomacere[5].businessName
      : mockedPartiesFromInfoCamere[0].businessName;
  }
  if (p.from === 'IVASS') {
    return p.haveTaxCode
      ? p.isForeignInsurance
        ? mockedInsuranceResource.items[0].description
        : mockedInsuranceResource.items[2].description
      : mockedInsuranceResource.items[4].description;
  }
  if (p.typeOfSearch === 'taxCode') {
    return mockedParties[0].description;
  }
  if (p.typeOfSearch === 'aooCode') {
    return mockedAoos[0].denominazioneAoo;
  }
  if (p.typeOfSearch === 'uoCode') {
    return mockedUos[0].descrizioneUo;
  }
  return mockPartyRegistry.items[0].description;
};

export const resolveRegisteredOffice = (p: BillingResolverParams): string => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].address;
  }
  if (p.from === 'INFOCAMERE' || p.from === 'PDND_INFOCAMERE') {
    return mockedPartiesFromInfoCamere[0].address;
  }
  if (p.from !== 'IPA') {
    return 'registeredOfficeInput';
  }
  if (p.typeOfSearch === 'taxCode') {
    return mockedParties[0].address;
  }
  if (p.typeOfSearch === 'aooCode') {
    return mockedAoos[0].indirizzo;
  }
  if (p.typeOfSearch === 'uoCode') {
    return mockedUos[0].indirizzo;
  }
  return mockPartyRegistry.items[0].address;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const resolveDigitalAddress = (p: BillingResolverParams): string => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].digitalAddress;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'personalTaxCode') {
    return mockedPdndVisuraInfomacere[5].digitalAddress;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'taxCode') {
    return mockedPdndVisuraInfomacere[0].digitalAddress;
  }
  if (p.from === 'NO_IPA') {
    return 'a@a.it';
  }
  if (p.from === 'ANAC') {
    return mockedANACParties[0].digitalAddress;
  }
  if (p.from === 'INFOCAMERE' || p.from === 'PDND_INFOCAMERE') {
    return p.typeOfSearch === 'personalTaxCode'
      ? mockedPdndVisuraInfomacere[5].digitalAddress
      : mockedPartiesFromInfoCamere[0].digitalAddress;
  }
  if (p.from === 'IVASS') {
    return p.haveTaxCode
      ? p.isForeignInsurance
        ? mockedInsuranceResource.items[0].digitalAddress
        : mockedInsuranceResource.items[2].digitalAddress
      : mockedInsuranceResource.items[4].digitalAddress;
  }
  if (p.typeOfSearch === 'taxCode') {
    return mockedParties[0].digitalAddress;
  }
  if (p.typeOfSearch === 'aooCode') {
    return mockedAoos[0].mail1;
  }
  if (p.typeOfSearch === 'uoCode') {
    return mockedUos[0].mail1;
  }
  return mockPartyRegistry.items[0].digitalAddress;
};

export const resolveZipCode = (p: BillingResolverParams): string | undefined => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].zipCode;
  }
  if (p.isForeignInsurance) {
    return undefined;
  }
  if (p.from === 'INFOCAMERE' || p.from === 'PDND_INFOCAMERE') {
    return mockedPartiesFromInfoCamere[0].zipCode;
  }
  if (p.from !== 'IPA') {
    return '09010';
  }
  if (p.typeOfSearch === 'taxCode') {
    return mockedParties[0].zipCode;
  }
  if (p.typeOfSearch === 'aooCode') {
    return mockedAoos[0].CAP;
  }
  if (p.typeOfSearch === 'uoCode') {
    return mockedUos[0].CAP;
  }
  return mockPartyRegistry.items[0].zipCode;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const resolveTaxCode = (p: BillingResolverParams): string | undefined => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].taxCode;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'personalTaxCode') {
    return mockedPdndVisuraInfomacere[5].businessTaxId;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'taxCode') {
    return mockedPdndVisuraInfomacere[0].businessTaxId;
  }
  if (p.from === 'IPA') {
    if (p.typeOfSearch === 'taxCode') {
      return mockedParties[0].taxCode;
    }
    if (p.typeOfSearch === 'aooCode') {
      return mockedAoos[0].codiceFiscaleEnte;
    }
    if (p.typeOfSearch === 'uoCode') {
      return mockedUos[0].codiceFiscaleEnte;
    }
    return mockPartyRegistry.items[0].taxCode;
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
      : mockedInsuranceResource.items[4].taxCode;
  }
  return '12345678911';
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const resolveVatNumber = (p: BillingResolverParams): string | undefined => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].taxCode;
  }
  if (p.isPrivateMerchant) {
    return mockedPdndVisuraInfomacere[0].businessTaxId;
  }
  if (p.from === 'INFOCAMERE' || p.from === 'PDND_INFOCAMERE') {
    return mockedPartiesFromInfoCamere[0].businessTaxId;
  }
  if (p.from === 'IPA') {
    if (p.typeOfSearch === 'taxCode') {
      return mockedParties[0].taxCode;
    }
    if (p.typeOfSearch === 'aooCode') {
      return mockedAoos[0].codiceFiscaleEnte;
    }
    if (p.typeOfSearch === 'uoCode') {
      return mockedUos[0].codiceFiscaleEnte;
    }
    return mockPartyRegistry.items[0].taxCode;
  }
  if (p.from === 'NO_IPA' || p.from === 'ANAC') {
    return '00000000000';
  }
  if (p.from === 'IVASS') {
    return p.isForeignInsurance ? undefined : '00000000000';
  }
  return '12345678911';
};

export const resolveTaxCodeInvoicing = (p: BillingResolverParams): string | undefined => {
  if (!p.SfeAvailable) {
    return undefined;
  }
  if (p.errorOnSubmit) {
    return '75656445456';
  }
  return p.typeOfSearch === 'taxCode' ? '998877665544' : '87654321098';
};

export const resolveRecipientCode = (p: BillingResolverParams): string | undefined => {
  if (p.isPrivateMerchant || isIoProduct(p.productId) || isCedProduct(p.productId)) {
    return undefined;
  }
  if (p.errorOnSubmit) {
    return 'A2B3C4';
  }
  if (isPaymentServiceProvider(p.institutionType as InstitutionType)) {
    return 'A1B2C3';
  }
  const canGetRecipientCode =
    canInvoice(p.institutionType, p.productId) &&
    (p.from === 'IPA' ||
      isGlobalServiceProvider(p.institutionType as InstitutionType) ||
      (p.from === 'NO_IPA' && isGpuInstitution(p.institutionType as InstitutionType))) &&
    p.typeOfSearch !== 'aooCode';
  if (canGetRecipientCode) {
    return p.typeOfSearch === 'taxCode' ? 'A3B4C5' : 'A1B2C3';
  }
  return undefined;
};

export const resolveLegalForm = (p: BillingResolverParams): string | undefined => {
  if (p.isPrivateMerchant && p.typeOfSearch === 'personalTaxCode') {
    return mockedPdndVisuraInfomacere[5].legalForm;
  }
  if (p.isPrivateMerchant && p.typeOfSearch === 'taxCode') {
    return mockedPdndVisuraInfomacere[0].legalForm;
  }
  return undefined;
};
