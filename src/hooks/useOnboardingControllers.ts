import { useMemo } from 'react';
import { InstitutionType } from '../../types';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { canInvoice, PRODUCT_IDS } from '../utils/constants';

interface OnboardingControllersParams {
  subProductId?: string;
  institutionType?: InstitutionType;
  productId?: string;
  origin?: string;
  onboardingFormData?: OnboardingFormData;
  isCityEditable?: boolean;
  isVatRegistrated?: boolean;
}

export interface OnboardingControllers {
  isPremium: boolean;
  isPaymentServiceProvider: boolean;
  isPdndPrivate: boolean;
  isPrivateMerchant: boolean;
  isInformationCompany: boolean;
  isInvoiceable: boolean;
  isForeignInsurance: boolean;
  isProdFideiussioni: boolean;
  isDisabled: boolean;
  isCityEditable?: boolean;
  isVatRegistrated?: boolean;
  isFromIPA: boolean;
  isContractingAuthority: boolean;
  isInsuranceCompany: boolean;
  isAooUo: boolean;
}

/**
 * Custom hook per calcolare i controller dello stato dell'onboarding
 * Gestisce tutte le condizioni logiche per determinare lo stato dei vari campi
 */

export const useOnboardingControllers = (
  params: OnboardingControllersParams
): OnboardingControllers => {
  const {
    subProductId,
    institutionType,
    productId,
    origin,
    onboardingFormData,
    isCityEditable,
    isVatRegistrated,
  } = params;

  return useMemo(() => {
    const isPremium = !!subProductId;
    const isPaymentServiceProvider = institutionType === 'PSP';
    const isPdndPrivate = institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP;

    const isPrivateMerchant =
      (institutionType === 'PRV' || institutionType === 'PRV_PF') &&
      productId === PRODUCT_IDS.IDPAY_MERCHANT;

    const isInformationCompany =
      origin !== 'IPA' &&
      institutionType !== 'PRV' &&
      institutionType !== 'PRV_PF' &&
      (institutionType === 'GSP' || institutionType === 'SCP') &&
      (productId === PRODUCT_IDS.IO ||
        productId === PRODUCT_IDS.IO_SIGN ||
        productId === PRODUCT_IDS.PAGOPA ||
        productId === PRODUCT_IDS.INTEROP);

    const isProdFideiussioni = productId?.startsWith(PRODUCT_IDS.FD) ?? false;

    const isInvoiceable = canInvoice(institutionType, productId);

    const isForeignInsurance = onboardingFormData?.registerType?.includes('Elenco II') ?? false;

    const isDisabled =
      isPremium ||
      (origin === 'IPA' && institutionType !== 'PA' && !isPaymentServiceProvider) ||
      institutionType === 'PA';

    const isFromIPA = origin === 'IPA';
    const isContractingAuthority = institutionType === 'SA';
    const isInsuranceCompany = institutionType === 'AS';
    const isAooUo = !!(onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode);

    return {
      isPremium,
      isPaymentServiceProvider,
      isPdndPrivate,
      isPrivateMerchant,
      isInformationCompany,
      isInvoiceable,
      isForeignInsurance,
      isProdFideiussioni,
      isDisabled,
      isCityEditable,
      isVatRegistrated,
      isFromIPA,
      isContractingAuthority,
      isInsuranceCompany,
      isAooUo,
    };
  }, [
    subProductId,
    institutionType,
    productId,
    origin,
    onboardingFormData?.registerType,
    onboardingFormData?.uoUniqueCode,
    onboardingFormData?.aooUniqueCode,
    isCityEditable,
    isVatRegistrated,
  ]);
};
