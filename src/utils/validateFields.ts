import { emailRegexp } from '@pagopa/selfcare-common-frontend/lib/utils/constants';
import { TFunction } from 'i18next';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { InstitutionType } from '../../types';
import { UoData } from '../model/UoModel';
import {
  requiredError,
  fiveCharactersAllowed,
  fiscalAndVatCodeRegexp,
  onlyCharacters,
  commercialRegisterNumberRegexp,
  numericField,
  reaValidation,
  currencyField,
  PRODUCT_IDS,
} from './constants';
import { ENV } from './env';

const ITALIAN_IBAN_REGEX = /^IT[0-9]{2}[A-Z][0-9]{10}[A-Z0-9]{12}$/;
const IBAN_LENGTH = 27;

const validateEmail = (email: string | undefined, t: TFunction) => {
  if (!email) {
    return requiredError;
  }
  return !emailRegexp.test(email)
    ? t('onboardingFormData.billingDataSection.invalidEmail')
    : undefined;
};

const validateZipCode = (
  zipCode: string | undefined,
  isForeignInsurance: boolean,
  t: TFunction
) => {
  if (!zipCode && !isForeignInsurance) {
    return requiredError;
  }
  if (zipCode && !fiveCharactersAllowed.test(zipCode)) {
    return t('onboardingFormData.billingDataSection.invalidZipCode');
  }
  return undefined;
};

const validateTaxCode = (
  taxCode: string | undefined,
  institutionType: InstitutionType,
  t: TFunction
) => {
  if (!taxCode && institutionType !== 'AS') {
    return requiredError;
  }
  if (taxCode && !fiscalAndVatCodeRegexp.test(taxCode)) {
    return t('onboardingFormData.billingDataSection.invalidFiscalCode');
  }
  return undefined;
};

const validateVatNumber = (
  values: Partial<OnboardingFormData>,
  isVatRegistrated: boolean,
  vatVerificationGenericError: boolean,
  t: TFunction
) => {
  if (!values.vatNumber && values.hasVatnumber) {
    return requiredError;
  }
  if (values.vatNumber && !fiscalAndVatCodeRegexp.test(values.vatNumber)) {
    return t('onboardingFormData.billingDataSection.invalidVatNumber');
  }
  if (isVatRegistrated) {
    return t('onboardingFormData.billingDataSection.vatNumberAlreadyRegistered');
  }
  return vatVerificationGenericError ? requiredError : undefined;
};

const validateCity = (values: Partial<OnboardingFormData>) => {
  if (!values.city) {
    return requiredError;
  }
  if (values.isForeignInsurance && !onlyCharacters.test(values.city)) {
    return true; // TODO: Add error helperText when available
  }
  return undefined;
};

const validateCountry = (values: Partial<OnboardingFormData>, institutionType: InstitutionType) => {
  if (!values.country && values.isForeignInsurance) {
    return requiredError;
  }
  if (institutionType === 'AS' && values?.country && !onlyCharacters.test(values.country)) {
    return true;
  }
  return undefined;
};

const validateIban = (
  iban: string | undefined,
  isPrivateMerchant: boolean,
  isPrivateMerchantPF: boolean,
  t: TFunction
) => {
  if ((isPrivateMerchant || isPrivateMerchantPF) && !iban) {
    return requiredError;
  }
  if (iban?.length === IBAN_LENGTH && !ITALIAN_IBAN_REGEX.test(iban)) {
    return t('onboardingFormData.ibanSection.error.invalidIban');
  }
  return undefined;
};

const validateConfirmIban = (
  confirmIban: string | undefined,
  originalIban: string | undefined,
  isPrivateMerchant: boolean,
  isPrivateMerchantPF: boolean,
  t: TFunction
) => {
  if ((isPrivateMerchant || isPrivateMerchantPF) && !confirmIban) {
    return requiredError;
  }

  if (
    (isPrivateMerchant || isPrivateMerchantPF) &&
    confirmIban &&
    confirmIban.length > 0 &&
    confirmIban.length < IBAN_LENGTH
  ) {
    return requiredError;
  }

  if (confirmIban?.length === IBAN_LENGTH) {
    if (!ITALIAN_IBAN_REGEX.test(confirmIban)) {
      return t('onboardingFormData.ibanSection.error.invalidIban');
    }
    if (originalIban !== confirmIban) {
      return t('onboardingFormData.ibanSection.error.ibanNotMatch');
    }
  }

  return undefined;
};

const validatePspField = (
  value: string | undefined,
  isRequired: boolean,
  validator?: RegExp,
  errorKey?: string,
  t?: TFunction
) => {
  if (isRequired && !value) {
    return requiredError;
  }
  if (value && validator && !validator.test(value) && errorKey && t) {
    return t(errorKey);
  }
  return undefined;
};

const validateRecipientCode = (
  recipientCode: string | undefined,
  isInvoiceable: boolean,
  recipientCodeStatus: string | undefined,
  t: TFunction
) => {
  if (!isInvoiceable) {
    return undefined;
  }

  if (recipientCode && recipientCode.length >= 1 && recipientCode.length < 6) {
    return t('onboardingFormData.billingDataSection.recipientCodeMustBe6Chars');
  }

  if (recipientCode && recipientCode.length >= 6) {
    if (recipientCodeStatus === 'DENIED_NO_ASSOCIATION') {
      return t('onboardingFormData.billingDataSection.invalidRecipientCodeNoAssociation');
    }
    if (recipientCodeStatus === 'DENIED_NO_BILLING') {
      return t('onboardingFormData.billingDataSection.invalidRecipientCodeNoBilling');
    }
    return undefined;
  }

  return requiredError;
};

const validateGeographicTaxonomies = (
  values: Partial<OnboardingFormData>,
  isPremium: boolean,
  institutionAvoidGeotax: boolean
) => {
  if (isPremium) {
    return undefined;
  }

  const shouldValidate = ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY && !institutionAvoidGeotax;
  const hasInvalidTaxonomies =
    !values.geographicTaxonomies ||
    values.geographicTaxonomies.length === 0 ||
    values.geographicTaxonomies.some((gt) => gt?.code === '' || gt === null);

  return shouldValidate && hasInvalidTaxonomies ? requiredError : undefined;
};

const validateConditionalRequired = (value: string | undefined, condition: boolean) =>
  condition && !value ? requiredError : undefined;

const validateFieldWithPattern = (
  value: string | undefined,
  pattern: RegExp,
  errorMessage: string
) => (value && !pattern.test(value as string) ? errorMessage : undefined);

/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */
export const validateFields = (
  values: Partial<OnboardingFormData>,
  t: TFunction<'translation', undefined>,
  institutionType: InstitutionType,
  isVatRegistrated: boolean,
  vatVerificationGenericError: boolean,
  isPaymentServiceProvider: boolean,
  isInvoiceable: boolean,
  uoSelected: UoData | undefined,
  isInformationCompany: boolean,
  institutionAvoidGeotax: boolean,
  isPremium: boolean,
  invalidTaxCodeInvoicing: boolean,
  isPdndPrivate: boolean,
  isPrivateMerchant: boolean,
  isPrivateMerchantPF: boolean,
  recipientCodeStatus?: string,
  productId?: string
) => {
  const isRequiredForInfoCompany = isInformationCompany || isPdndPrivate || isPrivateMerchant || isPrivateMerchantPF;
  const isRequiredForSaOrPrivate = institutionType === 'SA' || isPdndPrivate || isPrivateMerchant || isPrivateMerchantPF;
  const validationRules = {
    businessName: validateConditionalRequired(values.businessName, true),
    registeredOffice: validateConditionalRequired(values.registeredOffice, true),
    zipCode: validateZipCode(values.zipCode, !!values.isForeignInsurance, t),
    taxCode: validateTaxCode(values.taxCode, institutionType, t),
    vatNumber: validateVatNumber(values, isVatRegistrated, vatVerificationGenericError, t),
    city: validateCity(values),
    county: validateConditionalRequired(values.county, institutionType !== 'AS'),
    country: validateCountry(values, institutionType),
    digitalAddress: validateEmail(values.digitalAddress, t),
    originId: validateConditionalRequired(values.originId, institutionType === 'AS'),
    holder: validateConditionalRequired(values.holder, isPrivateMerchant),
    iban: validateIban(values.iban, isPrivateMerchant, isPrivateMerchantPF, t),
    confirmIban: validateConfirmIban(values.confirmIban, values.iban, isPrivateMerchant, isPrivateMerchantPF, t),
    businessRegisterPlace: validateConditionalRequired(
      values.businessRegisterPlace,
      isRequiredForSaOrPrivate
    ),
    rea:
      isRequiredForInfoCompany && !values.rea
        ? requiredError
        : validateFieldWithPattern(
            values.rea,
            reaValidation,
            t('onboardingFormData.billingDataSection.invalidReaField')
          ),
    shareCapital:
      (institutionType === 'SA' || isPdndPrivate) && !values.shareCapital
        ? requiredError
        : validateFieldWithPattern(
            values.shareCapital,
            currencyField,
            t('onboardingFormData.billingDataSection.invalidShareCapitalField')
          ),
    commercialRegisterNumber: validatePspField(
      values.commercialRegisterNumber,
      isPaymentServiceProvider,
      commercialRegisterNumberRegexp,
      'onboardingFormData.billingDataSection.pspDataSection.invalidCommercialRegisterNumber',
      t
    ),
    registrationInRegister: validateConditionalRequired(
      values.registrationInRegister,
      isPaymentServiceProvider
    ),
    address: validateConditionalRequired(values.address, isPaymentServiceProvider),
    registerNumber: validatePspField(
      values.registerNumber,
      isPaymentServiceProvider,
      numericField,
      'onboardingFormData.billingDataSection.pspDataSection.invalidregisterNumber',
      t
    ),
    abiCode: validatePspField(
      values.abiCode,
      isPaymentServiceProvider,
      fiveCharactersAllowed,
      'onboardingFormData.billingDataSection.pspDataSection.invalidabiCode',
      t
    ),
    email: isPaymentServiceProvider ? validateEmail(values.email, t) : undefined,
    pec: isPaymentServiceProvider ? validateEmail(values.pec, t) : undefined,
    taxCodeInvoicing:
      isInvoiceable &&
      uoSelected &&
      (!values.taxCodeInvoicing ||
        (values.taxCodeInvoicing && !fiscalAndVatCodeRegexp.test(values.taxCodeInvoicing)))
        ? requiredError
        : invalidTaxCodeInvoicing
          ? t('onboardingFormData.billingDataSection.invalidTaxCodeInvoicing')
          : undefined,

    recipientCode: validateRecipientCode(
      values.recipientCode,
      isInvoiceable,
      recipientCodeStatus,
      t
    ),
    geographicTaxonomies: validateGeographicTaxonomies(values, isPremium, institutionAvoidGeotax),
    supportEmail:
      !institutionAvoidGeotax && !values.supportEmail && productId === PRODUCT_IDS.IO_SIGN
        ? requiredError
        : !emailRegexp.test(values.supportEmail as string) && values.supportEmail
          ? t('onboardingFormData.billingDataSection.invalidMailSupport')
          : undefined,
  };

  return Object.entries(validationRules).filter(([_key, value]) => value);
};
