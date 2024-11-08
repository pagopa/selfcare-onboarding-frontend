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
} from './constants';
import { ENV } from './env';

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
  recipientCodeStatus?: string,
  productId?: string
) =>
  Object.entries({
    businessName: !values.businessName ? requiredError : undefined,
    registeredOffice: !values.registeredOffice ? requiredError : undefined,
    zipCode:
      !values.zipCode && !values.isForeignInsurance
        ? requiredError
        : values.zipCode && !fiveCharactersAllowed.test(values.zipCode ?? '')
        ? t('onboardingFormData.billingDataSection.invalidZipCode')
        : undefined,
    taxCode:
      !values.taxCode && institutionType !== 'AS'
        ? requiredError
        : values.taxCode && !fiscalAndVatCodeRegexp.test(values.taxCode)
        ? t('onboardingFormData.billingDataSection.invalidFiscalCode')
        : undefined,
    taxCodeInvoicing:
      isInvoiceable &&
      uoSelected &&
      (!values.taxCodeInvoicing ||
        (values.taxCodeInvoicing && !fiscalAndVatCodeRegexp.test(values.taxCodeInvoicing)))
        ? requiredError
        : invalidTaxCodeInvoicing
        ? t('onboardingFormData.billingDataSection.invalidTaxCodeInvoicing')
        : undefined,
    vatNumber:
      !values.vatNumber && values.hasVatnumber
        ? requiredError
        : values.vatNumber && !fiscalAndVatCodeRegexp.test(values.vatNumber)
        ? t('onboardingFormData.billingDataSection.invalidVatNumber')
        : isVatRegistrated
        ? t('onboardingFormData.billingDataSection.vatNumberAlreadyRegistered')
        : vatVerificationGenericError
        ? requiredError
        : undefined,
    city: !values.city
      ? requiredError
      : values.isForeignInsurance
      ? !onlyCharacters.test(values.city) // TODO Add error helperText when available
      : undefined,
    county: !values.county && institutionType !== 'AS' ? requiredError : undefined,
    country:
      !values.country && values.isForeignInsurance
        ? requiredError
        : institutionType === 'AS' && values?.country
        ? !onlyCharacters.test(values.country)
        : undefined,
    originId: institutionType === 'AS' && !values.originId ? requiredError : undefined,
    digitalAddress: !values.digitalAddress
      ? requiredError
      : !emailRegexp.test(values.digitalAddress)
      ? t('onboardingFormData.billingDataSection.invalidEmail')
      : undefined,
    commercialRegisterNumber:
      isPaymentServiceProvider && !values.commercialRegisterNumber
        ? requiredError
        : values.commercialRegisterNumber &&
          !commercialRegisterNumberRegexp.test(values.commercialRegisterNumber) &&
          isPaymentServiceProvider
        ? t('onboardingFormData.billingDataSection.pspDataSection.invalidCommercialRegisterNumber')
        : undefined,
    businessRegisterPlace:
      (institutionType === 'SA' || isPdndPrivate) && !values.businessRegisterPlace
        ? requiredError
        : undefined,
    registrationInRegister:
      isPaymentServiceProvider && !values.registrationInRegister ? requiredError : undefined,
    dpoAddress: isPaymentServiceProvider && !values.dpoAddress ? requiredError : undefined,
    registerNumber:
      isPaymentServiceProvider && !values.registerNumber
        ? requiredError
        : isPaymentServiceProvider &&
          values.registerNumber &&
          !numericField.test(values.registerNumber)
        ? t('onboardingFormData.billingDataSection.pspDataSection.invalidregisterNumber')
        : undefined,
    abiCode:
      isPaymentServiceProvider && !values.abiCode
        ? requiredError
        : isPaymentServiceProvider && values.abiCode && !fiveCharactersAllowed.test(values.abiCode)
        ? t('onboardingFormData.billingDataSection.pspDataSection.invalidabiCode')
        : undefined,
    dpoEmailAddress:
      isPaymentServiceProvider && !values.dpoEmailAddress
        ? requiredError
        : isPaymentServiceProvider &&
          values.dpoEmailAddress &&
          !emailRegexp.test(values.dpoEmailAddress)
        ? t('onboardingFormData.billingDataSection.invalidEmail')
        : undefined,
    dpoPecAddress:
      isPaymentServiceProvider && !values.dpoPecAddress
        ? requiredError
        : isPaymentServiceProvider &&
          values.dpoPecAddress &&
          !emailRegexp.test(values.dpoPecAddress)
        ? t('onboardingFormData.billingDataSection.invalidEmail')
        : undefined,
    recipientCode: isInvoiceable
      ? values.recipientCode && values.recipientCode.length >= 6
        ? recipientCodeStatus === 'DENIED_NO_ASSOCIATION'
          ? t('onboardingFormData.billingDataSection.invalidRecipientCodeNoAssociation')
          : recipientCodeStatus === 'DENIED_NO_BILLING'
          ? t('onboardingFormData.billingDataSection.invalidRecipientCodeNoBilling')
          : undefined
        : requiredError
      : undefined,
    geographicTaxonomies:
      ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY &&
      !institutionAvoidGeotax &&
      (!values.geographicTaxonomies ||
        values.geographicTaxonomies.length === 0 ||
        values.geographicTaxonomies.some((gt) => gt?.code === '' || gt === null))
        ? requiredError
        : undefined,
    rea:
      (isInformationCompany || isPdndPrivate) && !values.rea
        ? requiredError
        : values.rea && !reaValidation.test(values.rea as string)
        ? t('onboardingFormData.billingDataSection.invalidReaField')
        : undefined,
    shareCapital:
      (institutionType === 'SA' || isPdndPrivate) && !values.shareCapital
        ? requiredError
        : values.shareCapital && !currencyField.test(values.shareCapital)
        ? t('onboardingFormData.billingDataSection.invalidShareCapitalField')
        : undefined,
    supportEmail:
      !institutionAvoidGeotax && !values.supportEmail && !isPremium && productId === 'prod-io-sign'
        ? requiredError
        : !emailRegexp.test(values.supportEmail as string) && values.supportEmail
        ? t('onboardingFormData.billingDataSection.invalidMailSupport')
        : undefined,
  }).filter(([_key, value]) => value);
