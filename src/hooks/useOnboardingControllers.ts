import { useMemo } from 'react';
import { InstitutionType } from '../../types';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { canInvoice } from '../utils/constants';
import {
  isPaymentServiceProvider,
  isPublicAdministration,
  isRtpProduct,
} from '../utils/institutionTypeUtils';

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
  isInvoiceable: boolean;
  isForeignInsurance: boolean;
  isDisabled: boolean;
  isCityEditable?: boolean;
  isVatRegistrated?: boolean;
  isFromIPA: boolean;
  isAooUo: boolean;
  /** RTP onboarding of a PSP already onboarded in SelfCare: its registered data is read-only. */
  isRtpPsp: boolean;
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
    const isInvoiceable = canInvoice(institutionType, productId);
    const isForeignInsurance = onboardingFormData?.registerType?.includes('Elenco II') ?? false;
    const isRtpPsp = isRtpProduct(productId) && isPaymentServiceProvider(institutionType);

    const isDisabled =
      isPremium ||
      isRtpPsp ||
      (origin === 'IPA' &&
        !isPublicAdministration(institutionType) &&
        !isPaymentServiceProvider(institutionType)) ||
      isPublicAdministration(institutionType);

    const isFromIPA = origin === 'IPA';
    const isAooUo = !!(onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode);

    return {
      isPremium,
      isInvoiceable,
      isForeignInsurance,
      isDisabled,
      isCityEditable,
      isVatRegistrated,
      isFromIPA,
      isAooUo,
      isRtpPsp,
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
