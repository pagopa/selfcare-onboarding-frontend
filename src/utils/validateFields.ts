import { emailRegexp } from '@pagopa/selfcare-common-frontend/lib/utils/constants';
import { TFunction } from 'i18next';
import { InstitutionType } from '../../types';
import { OnboardingControllers } from '../hooks/useOnboardingControllers';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { UoData } from '../model/UoModel';
import {
  commercialRegisterNumberRegexp,
  currencyField,
  fiscalAndVatCodeRegexp,
  fiveCharactersAllowed,
  numericField,
  onlyCharacters,
  PRODUCT_IDS,
  reaValidation,
  requiredError,
} from './constants';
import { ENV } from './env';
import {
  isCedProduct,
  isContractingAuthority,
  isGpuInstitution,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isInteropProduct,
  isPagoPaProduct,
  isPrivateInstitution,
  isPrivateOrPersonInstitution,
  isPublicServiceCompany,
} from './institutionTypeUtils';

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
  if (!taxCode && !isInsuranceCompany(institutionType)) {
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
  if (
    isInsuranceCompany(institutionType) &&
    values?.country &&
    !onlyCharacters.test(values.country)
  ) {
    return true;
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
  t: TFunction,
  productId: string | undefined,
  subProductId: string | undefined
) => {
  // prod-io hides the SDI code, but its premium sub-product shows it as an editable field,
  // so the base-product exemption must not apply to the prod-io-premium flow.
  const isSdiCodeHidden = productId === PRODUCT_IDS.IO && subProductId !== PRODUCT_IDS.IO_PREMIUM;

  if (!isInvoiceable || isSdiCodeHidden) {
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

export const isPecEmail = (email: string): boolean => /(@pec\.|\.pec\.)/i.test(email);

const validateConditionalRequired = (value: string | undefined, condition: boolean) =>
  condition && !value ? requiredError : undefined;

const validateFieldWithPattern = (
  value: string | undefined,
  pattern: RegExp,
  errorMessage: string
) => (value && !pattern.test(value) ? errorMessage : undefined);

export const validateRea = (rea: string | undefined, isRequired: boolean, t: TFunction) =>
  isRequired && !rea
    ? requiredError
    : validateFieldWithPattern(
        rea,
        reaValidation,
        t('onboardingFormData.billingDataSection.invalidReaField')
      );

export const validateShareCapital = (
  shareCapital: string | undefined,
  isRequired: boolean,
  t: TFunction
) =>
  isRequired && !shareCapital
    ? requiredError
    : validateFieldWithPattern(
        shareCapital,
        currencyField,
        t('onboardingFormData.billingDataSection.invalidShareCapitalField')
      );

// A missing or malformed tax code for invoicing is reported as required, as the field is mandatory for UOs
export const validateTaxCodeInvoicing = (
  taxCodeInvoicing: string | undefined,
  isRequired: boolean,
  isInvalid: boolean,
  t: TFunction
) => {
  if (isRequired && (!taxCodeInvoicing || !fiscalAndVatCodeRegexp.test(taxCodeInvoicing))) {
    return requiredError;
  }
  return isInvalid ? t('onboardingFormData.billingDataSection.invalidTaxCodeInvoicing') : undefined;
};

export const validateSupportEmail = (
  supportEmail: string | undefined,
  isRequired: boolean,
  t: TFunction
) => {
  if (isRequired && !supportEmail) {
    return requiredError;
  }
  return supportEmail && !emailRegexp.test(supportEmail)
    ? t('onboardingFormData.billingDataSection.invalidMailSupport')
    : undefined;
};

export const validatePspSection = (
  values: Partial<OnboardingFormData>,
  isPaymentServiceProvider: boolean,
  t: TFunction
) => ({
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
});

export type ValidationContext = {
  institutionType: InstitutionType;
  isVatRegistrated: boolean;
  vatVerificationGenericError: boolean;
  isPaymentServiceProvider: boolean;
  isInvoiceable: boolean;
  uoSelected?: UoData;
  isInformationCompany: boolean;
  institutionAvoidGeotax: boolean;
  isPremium: boolean;
  invalidTaxCodeInvoicing: boolean;
  isPdndPrivate: boolean;
  isPrivateMerchantInstitution: boolean;
  recipientCodeStatus?: string;
  productId?: string;
  subProductId?: string;
};

export const validateFields = (
  values: Partial<OnboardingFormData>,
  t: TFunction<'translation', undefined>,
  {
    institutionType,
    isVatRegistrated,
    vatVerificationGenericError,
    isPaymentServiceProvider,
    isInvoiceable,
    uoSelected,
    isInformationCompany,
    institutionAvoidGeotax,
    isPremium,
    invalidTaxCodeInvoicing,
    isPdndPrivate,
    isPrivateMerchantInstitution,
    recipientCodeStatus,
    productId,
    subProductId,
  }: ValidationContext
) => {
  const isRequiredForInfoCompany =
    isInformationCompany || isPdndPrivate || isPrivateMerchantInstitution;
  const isRequiredForSaOrPrivate =
    isContractingAuthority(institutionType) || isPdndPrivate || isPrivateMerchantInstitution;
  const validationRules = {
    businessName: validateConditionalRequired(values.businessName, true),
    registeredOffice: validateConditionalRequired(values.registeredOffice, true),
    zipCode: validateZipCode(values.zipCode, !!values.isForeignInsurance, t),
    taxCode: validateTaxCode(values.taxCode, institutionType, t),
    vatNumber: validateVatNumber(values, isVatRegistrated, vatVerificationGenericError, t),
    city: validateCity(values),
    county: validateConditionalRequired(values.county, !isInsuranceCompany(institutionType)),
    country: validateCountry(values, institutionType),
    digitalAddress: validateEmail(values.digitalAddress, t),
    originId: validateConditionalRequired(values.originId, isInsuranceCompany(institutionType)),
    businessRegisterPlace: validateConditionalRequired(
      values.businessRegisterPlace,
      isRequiredForSaOrPrivate
    ),
    rea: validateRea(values.rea, isRequiredForInfoCompany, t),
    shareCapital: validateShareCapital(
      values.shareCapital,
      isContractingAuthority(institutionType) || isPdndPrivate,
      t
    ),
    ...validatePspSection(values, isPaymentServiceProvider, t),
    taxCodeInvoicing: validateTaxCodeInvoicing(
      values.taxCodeInvoicing,
      isInvoiceable && !!uoSelected,
      invalidTaxCodeInvoicing,
      t
    ),
    recipientCode: validateRecipientCode(
      values.recipientCode,
      isInvoiceable,
      recipientCodeStatus,
      t,
      productId,
      subProductId
    ),
    geographicTaxonomies: validateGeographicTaxonomies(values, isPremium, institutionAvoidGeotax),
    supportEmail: validateSupportEmail(
      values.supportEmail,
      !institutionAvoidGeotax && productId === PRODUCT_IDS.IO_SIGN,
      t
    ),
  };

  return Object.entries(validationRules).filter(([_key, value]) => value);
};

export const isBusinessNameDisabled = (
  controllers: OnboardingControllers,
  institutionType: InstitutionType,
  isInfoCompany: boolean,
  onboardingFormData?: OnboardingFormData,
  isFieldLockedForPrivate?: boolean
) =>
  controllers.isDisabled ||
  isContractingAuthority(institutionType) ||
  isInsuranceCompany(institutionType) ||
  (isInfoCompany && !!onboardingFormData?.businessName) ||
  isFieldLockedForPrivate;

export const isDigitalAddressDisabled = (
  controllers: OnboardingControllers,
  institutionType: InstitutionType,
  isInfoCompany: boolean,
  onboardingFormData?: OnboardingFormData,
  isFieldLockedForPrivate?: boolean
) =>
  controllers.isDisabled ||
  isContractingAuthority(institutionType) ||
  isInsuranceCompany(institutionType) ||
  (isInfoCompany && !!onboardingFormData?.digitalAddress) ||
  isFieldLockedForPrivate;

export const isTaxCodeFieldDisabled = (
  controllers: OnboardingControllers,
  institutionType: InstitutionType,
  isInfoCompany: boolean,
  onboardingFormData?: OnboardingFormData,
  isFieldLockedForPrivate?: boolean
) =>
  controllers.isDisabled ||
  isContractingAuthority(institutionType) ||
  isInsuranceCompany(institutionType) ||
  (isInfoCompany && !!onboardingFormData?.taxCode) ||
  isFieldLockedForPrivate;

export const isAddressDisabled = (
  controllers: OnboardingControllers,
  institutionType: InstitutionType
) => !controllers.isAooUo && controllers.isDisabled && !isInsuranceCompany(institutionType);

export const showTaxCodeField = (
  institutionType: InstitutionType,
  onboardingFormData?: OnboardingFormData
) =>
  !isInsuranceCompany(institutionType) ||
  (!!onboardingFormData?.taxCode && onboardingFormData.taxCode !== '');

export const isFieldLockedForPrivate = (institutionType: InstitutionType, productId?: string) =>
  isPrivateOrPersonInstitution(institutionType) &&
  !isPagoPaProduct(productId) &&
  !isCedProduct(productId);

export const showCommercialRegisterSection = (
  isInfoCompany: boolean,
  institutionType: InstitutionType,
  productId?: string
) =>
  isInfoCompany ||
  isContractingAuthority(institutionType) ||
  ((isInteropProduct(productId) ||
    isPagoPaProduct(productId) ||
    isIdpayMerchantProduct(productId) ||
    isCedProduct(productId)) &&
    (isPublicServiceCompany(institutionType) ||
      isPrivateInstitution(institutionType) ||
      isPrivateOrPersonInstitution(institutionType) ||
      isGpuInstitution(institutionType)));
