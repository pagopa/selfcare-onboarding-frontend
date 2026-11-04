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

type SearchTable<T> = Partial<Record<Search, () => T>>;

/** Returns the value mapped to the search type, or the fallback when the search type is not mapped. */
export const pickBySearch = <T>(
  typeOfSearch: Search,
  table: SearchTable<T>,
  fallback: () => T
): T => (table[typeOfSearch] ?? fallback)();

export const isInfocamereSource = (from?: Source): boolean =>
  from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE';

/** Visura selected by a private merchant, available only for the tax code searches. */
export const privateMerchantVisura = (
  p: Pick<BillingResolverParams, 'isPrivateMerchant' | 'typeOfSearch'>
) =>
  p.isPrivateMerchant
    ? pickBySearch(
        p.typeOfSearch,
        {
          personalTaxCode: () => mockedPdndVisuraInfomacere[5],
          taxCode: () => mockedPdndVisuraInfomacere[0],
        },
        () => undefined
      )
    : undefined;

type InsuranceParams = Pick<BillingResolverParams, 'haveTaxCode' | 'isForeignInsurance'>;

export const insuranceResource = (p: InsuranceParams) => {
  if (!p.haveTaxCode) {
    return mockedInsuranceResource.items[4];
  }
  return p.isForeignInsurance ? mockedInsuranceResource.items[0] : mockedInsuranceResource.items[2];
};

export const insuranceTaxCode = (p: InsuranceParams): string | undefined =>
  p.haveTaxCode ? (insuranceResource(p).taxCode ?? '') : insuranceResource(p).taxCode;

export const resolveBusinessName = (p: BillingResolverParams): string => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].description;
  }
  const visura = privateMerchantVisura(p);
  if (visura) {
    return visura.businessName;
  }
  if (p.from === 'NO_IPA') {
    return 'businessNameInput';
  }
  if (p.from === 'ANAC') {
    return mockedANACParties[0].description;
  }
  if (isInfocamereSource(p.from)) {
    return p.typeOfSearch === 'personalTaxCode'
      ? mockedPdndVisuraInfomacere[5].businessName
      : mockedPartiesFromInfoCamere[0].businessName;
  }
  if (p.from === 'IVASS') {
    return insuranceResource(p).description;
  }
  return pickBySearch(
    p.typeOfSearch,
    {
      taxCode: () => mockedParties[0].description,
      aooCode: () => mockedAoos[0].denominazioneAoo,
      uoCode: () => mockedUos[0].descrizioneUo,
    },
    () => mockPartyRegistry.items[0].description
  );
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

export const resolveDigitalAddress = (p: BillingResolverParams): string => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].digitalAddress;
  }
  const visura = privateMerchantVisura(p);
  if (visura) {
    return visura.digitalAddress;
  }
  if (p.from === 'NO_IPA') {
    return 'a@a.it';
  }
  if (p.from === 'ANAC') {
    return mockedANACParties[0].digitalAddress;
  }
  if (isInfocamereSource(p.from)) {
    return p.typeOfSearch === 'personalTaxCode'
      ? mockedPdndVisuraInfomacere[5].digitalAddress
      : mockedPartiesFromInfoCamere[0].digitalAddress;
  }
  if (p.from === 'IVASS') {
    return insuranceResource(p).digitalAddress;
  }
  return pickBySearch(
    p.typeOfSearch,
    {
      taxCode: () => mockedParties[0].digitalAddress,
      aooCode: () => mockedAoos[0].mail1,
      uoCode: () => mockedUos[0].mail1,
    },
    () => mockPartyRegistry.items[0].digitalAddress
  );
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
    return mockedAoos[0].cap;
  }
  if (p.typeOfSearch === 'uoCode') {
    return mockedUos[0].cap;
  }
  return mockPartyRegistry.items[0].zipCode;
};

export const resolveTaxCode = (p: BillingResolverParams): string | undefined => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].taxCode;
  }
  const visura = privateMerchantVisura(p);
  if (visura) {
    return visura.businessTaxId;
  }
  if (p.from === 'IPA') {
    return pickBySearch(
      p.typeOfSearch,
      {
        taxCode: () => mockedParties[0].taxCode,
        aooCode: () => mockedAoos[0].codiceFiscaleEnte,
        uoCode: () => mockedUos[0].codiceFiscaleEnte,
      },
      () => mockPartyRegistry.items[0].taxCode
    );
  }
  if (p.from === 'NO_IPA') {
    return '00000000000';
  }
  if (p.from === 'ANAC') {
    return mockedANACParties[0].taxCode;
  }
  if (isInfocamereSource(p.from)) {
    return mockedPartiesFromInfoCamere[0].businessTaxId;
  }
  if (p.from === 'IVASS') {
    return insuranceTaxCode(p);
  }
  return '12345678911';
};

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
