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
  isCedProduct,
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
import {
  type BillingResolverParams,
  insuranceResource,
  insuranceTaxCode,
  isInfocamereSource,
  pickBySearch,
  privateMerchantVisura,
} from './billingDataResolvers-test';
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

type SourceOriginIdParams = { haveTaxCode: boolean; isForeignInsurance: boolean };

// Origin id of the sources that do not depend on the IPA search type
const SOURCE_ORIGIN_IDS: Partial<Record<Source, (p: SourceOriginIdParams) => string | undefined>> =
  {
    NO_IPA: () => mockPartyRegistry.items[0].taxCode,
    ANAC: () => mockedANACParties[0].originId,
    IVASS: (p) => insuranceResource(p).originId,
    INFOCAMERE: () => undefined,
    PDND_INFOCAMERE: () => '00112233445',
    SELC: () => mockPartyRegistry.items[0].taxCode,
  };

const resolveIpaPartyOriginId = (
  institutionType: InstitutionType,
  productId: string
): string | undefined => {
  const isPagoPa = isPagoPaProduct(productId);
  if (
    isPagoPa &&
    (isTechPartner(institutionType) ||
      isGpuInstitution(institutionType) ||
      isGlobalServiceProvider(institutionType))
  ) {
    return '991';
  }
  if (isPagoPa && isPrivateInstitution(institutionType)) {
    return mockPartyRegistry.items[0].taxCode;
  }
  const isGpuWithoutOriginId =
    isGpuInstitution(institutionType) &&
    (isInteropProduct(productId) || isIoSignProduct(productId) || isIoProduct(productId));
  return isGpuWithoutOriginId ? undefined : '991';
};

export const resolveOriginId = (
  from: Source,
  institutionType: string,
  productId: string,
  typeOfSearch: Search,
  isPrivateMerchant: boolean,
  errorOnSubmit: boolean,
  haveTaxCode: boolean,
  isForeignInsurance: boolean
): string | undefined => {
  if (errorOnSubmit) {
    return mockPartyRegistry.items[1].originId;
  }
  if (isPrivateMerchant) {
    return typeOfSearch === 'personalTaxCode'
      ? mockedPdndVisuraInfomacere[5].businessTaxId
      : mockedPdndVisuraInfomacere[0].businessTaxId;
  }
  if (isCedProduct(productId) && isPrivateInstitution(institutionType as InstitutionType)) {
    return mockPartyRegistry.items[0].taxCode;
  }
  const sourceOriginId = SOURCE_ORIGIN_IDS[from];
  if (sourceOriginId) {
    return sourceOriginId({ haveTaxCode, isForeignInsurance });
  }
  // IPA and default
  return pickBySearch<string | undefined>(
    typeOfSearch,
    {
      taxCode: () => mockedParties[0].originId,
      aooCode: () => mockedAoos[0].codiceUniAoo,
      uoCode: () => mockedUos[0].codiceUniUo,
    },
    () => resolveIpaPartyOriginId(institutionType as InstitutionType, productId)
  );
};

export const resolveVerifyTaxCode = (p: BillingResolverParams): string | undefined => {
  if (p.errorOnSubmit) {
    return mockPartyRegistry.items[1].taxCode;
  }
  const visura = privateMerchantVisura(p);
  if (visura) {
    return visura.businessTaxId;
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
  // IPA and default
  return pickBySearch(
    p.typeOfSearch,
    {
      taxCode: () => mockedParties[0].taxCode,
      personalTaxCode: () => mockedPdndVisuraInfomacere[5].businessTaxId,
      aooCode: () => mockedAoos[0].codiceFiscaleEnte,
      uoCode: () => mockedUos[0].codiceFiscaleEnte,
    },
    () => mockPartyRegistry.items[0].taxCode
  );
};

type CompanyInfoParams = {
  from: Source;
  institutionType: string;
  productId: string;
  isPrivateMerchant: boolean;
  typeOfSearch: Search;
};

const shouldIncludeCompanyInformations = (p: CompanyInfoParams): boolean => {
  const institutionType = p.institutionType as InstitutionType;
  const isCompanyRegistrySource =
    p.from === 'ANAC' ||
    isInfocamereSource(p.from) ||
    ((isGlobalServiceProvider(institutionType) || isGpuInstitution(institutionType)) &&
      p.from !== 'IPA');
  const isPrivatePagoPa = isPrivateInstitution(institutionType) && isPagoPaProduct(p.productId);
  return (
    (isCompanyRegistrySource && !isTechPartner(institutionType)) ||
    isPrivatePagoPa ||
    p.isPrivateMerchant
  );
};

const resolveBusinessRegisterPlace = (p: CompanyInfoParams): string | undefined => {
  const hasCompanyRegistryProduct =
    isPagoPaProduct(p.productId) ||
    isInteropProduct(p.productId) ||
    isIdpayMerchantProduct(p.productId);
  return p.from === 'ANAC' ||
    (isPrivateOrPersonInstitution(p.institutionType as InstitutionType) &&
      hasCompanyRegistryProduct)
    ? '01234567891'
    : undefined;
};

const resolveShareCapital = (p: CompanyInfoParams): number | undefined =>
  p.from === 'ANAC' ||
  (isPrivateInstitution(p.institutionType as InstitutionType) && isInteropProduct(p.productId))
    ? 332323
    : undefined;

const resolveRea = (p: CompanyInfoParams): string | undefined => {
  if (isInfocamereSource(p.from)) {
    const visura = privateMerchantVisura(p);
    const infocamereParty = mockedPartiesFromInfoCamere[0];
    return visura ? visura.nRea : infocamereParty.cciaa.concat('-', infocamereParty.nRea);
  }
  return isPrivateInstitution(p.institutionType as InstitutionType) && isPagoPaProduct(p.productId)
    ? undefined
    : 'MO-123456';
};

export const resolveCompanyInformations = (p: CompanyInfoParams) =>
  shouldIncludeCompanyInformations(p)
    ? {
        businessRegisterPlace: resolveBusinessRegisterPlace(p),
        shareCapital: resolveShareCapital(p),
        rea: resolveRea(p),
      }
    : undefined;

// --- Expected value helpers for verifySubmit (ONBOARDING_POST_LEGALS body) ---

export const resolveAdditionalInformations = (
  from: Source | undefined,
  institutionType: string,
  productId: string
) =>
  isPagoPaProduct(productId) &&
  isGlobalServiceProvider(institutionType as InstitutionType) &&
  from !== 'IPA'
    ? {
        agentOfPublicService: false,
        agentOfPublicServiceNote: '',
        belongRegulatedMarket: false,
        establishedByRegulatoryProvision: false,
        establishedByRegulatoryProvisionNote: '',
        ipa: false,
        ipaCode: '',
        otherNote: 'optionalPartyInformations-note',
        regulatedMarketNote: '',
      }
    : undefined;

export const resolveGpuData = (institutionType: string, productId: string) =>
  isGpuInstitution(institutionType as InstitutionType) && isPagoPaProduct(productId)
    ? {
        businessRegisterNumber: 'Comunale 12',
        legalRegisterNumber: '250301',
        legalRegisterName: 'SkiPass',
        longTermPayments: true,
        manager: true,
        managerAuthorized: true,
        managerEligible: true,
        managerProsecution: true,
        institutionCourtMeasures: true,
      }
    : undefined;

export const resolvePspData = (institutionType: string) =>
  isPaymentServiceProvider(institutionType as InstitutionType)
    ? {
        abiCode: '23321',
        businessRegisterNumber: '12344555667',
        dpoData: {
          address: 'Via milano 5',
          email: 'dpomail@mailtest.com',
          pec: 'dpopec@mailtest.com',
        },
        legalRegisterName: '123',
        legalRegisterNumber: '24',
        vatNumberGroup: true,
      }
    : undefined;

const LOGGED_USER = {
  email: 'a@a.aa',
  name: 'Mattia',
  surname: 'Sisti',
  taxCode: 'SSTMTT76C23F205T',
  uid: '0',
};

const expectedManager = (productId: string) =>
  isCedProduct(productId)
    ? { ...LOGGED_USER, role: 'MANAGER' }
    : {
        email: 'b@b.bb',
        name: 'NAME',
        role: 'MANAGER',
        surname: 'SURNAME',
        taxCode: 'SRNNMA80A01A794F',
      };

// Logged user data is used when the applicant checkbox stays checked (isAddApplicantEmail=false)
const expectedDelegate = (isAddApplicantEmail?: boolean) =>
  isAddApplicantEmail
    ? {
        email: 'a@a.aa',
        name: 'LUCA',
        role: 'DELEGATE',
        surname: 'ROSSI',
        taxCode: 'RSSLCU80A01F205N',
      }
    : { ...LOGGED_USER, role: 'DELEGATE' };

export const resolveSubmitUsers = (
  institutionType: string,
  productId: string,
  isAddApplicantEmail?: boolean
) => {
  const users = [expectedManager(productId), expectedDelegate(isAddApplicantEmail)];
  return isTechPartner(institutionType as InstitutionType)
    ? users.filter((u) => u.role !== 'MANAGER')
    : users;
};

export const resolveAssistanceContacts = (
  from: Source | undefined,
  institutionType: string,
  productId: string,
  typeOfSearch: Search
) =>
  isIoSignProduct(productId) &&
  typeOfSearch !== 'aooCode' &&
  !isTechPartner(institutionType as InstitutionType) &&
  !isGpuInstitution(institutionType as InstitutionType) &&
  (from === 'IPA' || from === 'NO_IPA')
    ? { supportEmail: 'a@a.it' }
    : undefined;

export const resolveSubunitType = (typeOfSearch: Search): string | undefined =>
  pickBySearch<string | undefined>(
    typeOfSearch,
    { aooCode: () => 'AOO', uoCode: () => 'UO' },
    () => undefined
  );

export const resolveSubunitCode = (typeOfSearch: Search): string | undefined =>
  pickBySearch<string | undefined>(
    typeOfSearch,
    { aooCode: () => mockedAoos[0].codiceUniAoo, uoCode: () => mockedUos[0].codiceUniUo },
    () => undefined
  );

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
