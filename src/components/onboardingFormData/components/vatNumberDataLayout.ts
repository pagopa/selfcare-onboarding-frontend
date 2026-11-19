import { InstitutionType, PaymentServiceProviderDto } from '../../../../types';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import {
  isFideiussioniGuaranteeProduct,
  isFideiussioniProduct,
  isInsuranceCompany,
  isPaymentServiceProvider,
  isPrivateMerchantInstitution,
} from '../../../utils/institutionTypeUtils';

export type VatNumberLayoutParams = {
  controllers: OnboardingControllers;
  values: Pick<OnboardingFormData, 'hasVatnumber' | 'taxCode'>;
  institutionType: InstitutionType;
  productId?: string;
  onboardingFormData?: Pick<OnboardingFormData, 'taxCode'>;
  isTaxCodeEquals2PIVA: boolean;
  pspData?: PaymentServiceProviderDto;
};

export type VatNumberLayout = {
  showCheckboxes: boolean;
  checkboxesMarginBottom: number;
  showTaxCodeEquals2PIVA: boolean;
  isTaxCodeEquals2PIVADisabled: boolean;
  showPartyWithoutVatNumber: boolean;
  partyWithoutVatNumberMarginBottom: number;
  showVatNumber: boolean;
  isVatNumberLocked: boolean;
  isVatNumberDisabled: boolean;
  showVatNumberGroup: boolean;
  isVatNumberGroupDisabled: boolean;
  isPartyWithoutVatNumberDisabled: boolean;
};

// Premium and RTP PSP start from the registered data, which the user must not change
const isVatNumberGroupLocked = (
  controllers: OnboardingControllers,
  pspData?: PaymentServiceProviderDto
) => (controllers.isPremium && !!pspData?.vatNumberGroup) || (controllers.isRtpPsp && !!pspData);

export const getVatNumberLayout = ({
  controllers,
  values,
  institutionType,
  productId,
  onboardingFormData,
  isTaxCodeEquals2PIVA,
  pspData,
}: VatNumberLayoutParams): VatNumberLayout => {
  const hasVatnumber = !!values.hasVatnumber;
  const isInsurance = isInsuranceCompany(institutionType);
  const isPrivateMerchant = isPrivateMerchantInstitution(institutionType, productId);
  const hasOnboardingTaxCode = !!onboardingFormData?.taxCode;
  const withoutVatnumberInvoiceable = !hasVatnumber && controllers.isInvoiceable;
  const isPrefilled = controllers.isPremium || controllers.isRtpPsp;
  const isVatNumberLocked = isTaxCodeEquals2PIVA || isPrefilled;

  return {
    showCheckboxes: !controllers.isForeignInsurance,
    checkboxesMarginBottom: withoutVatnumberInvoiceable && isInsurance ? -3 : 0,
    showTaxCodeEquals2PIVA:
      hasVatnumber && (!isInsurance || hasOnboardingTaxCode) && !isPrivateMerchant,
    isTaxCodeEquals2PIVADisabled: isPrefilled || values.taxCode?.length !== 11,
    showPartyWithoutVatNumber:
      !isFideiussioniProduct(productId) &&
      !isFideiussioniGuaranteeProduct(productId) &&
      !isPrivateMerchant,
    partyWithoutVatNumberMarginBottom: withoutVatnumberInvoiceable ? -2 : 0,
    showVatNumber: hasVatnumber && !controllers.isForeignInsurance,
    isVatNumberLocked,
    isVatNumberDisabled: isVatNumberLocked || isPrivateMerchant,
    showVatNumberGroup: isPaymentServiceProvider(institutionType) && hasVatnumber,
    isVatNumberGroupDisabled: isVatNumberGroupLocked(controllers, pspData),
    isPartyWithoutVatNumberDisabled: controllers.isRtpPsp,
  };
};
