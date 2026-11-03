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
};

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
  const isVatNumberLocked = isTaxCodeEquals2PIVA || controllers.isPremium;

  return {
    showCheckboxes: !controllers.isForeignInsurance,
    checkboxesMarginBottom: withoutVatnumberInvoiceable && isInsurance ? -3 : 0,
    showTaxCodeEquals2PIVA:
      hasVatnumber && (!isInsurance || hasOnboardingTaxCode) && !isPrivateMerchant,
    isTaxCodeEquals2PIVADisabled: controllers.isPremium || values.taxCode?.length !== 11,
    showPartyWithoutVatNumber:
      !isFideiussioniProduct(productId) &&
      !isFideiussioniGuaranteeProduct(productId) &&
      !isPrivateMerchant,
    partyWithoutVatNumberMarginBottom: withoutVatnumberInvoiceable ? -2 : 0,
    showVatNumber: hasVatnumber && !controllers.isForeignInsurance,
    isVatNumberLocked,
    isVatNumberDisabled: isVatNumberLocked || isPrivateMerchant,
    showVatNumberGroup: isPaymentServiceProvider(institutionType) && hasVatnumber,
    isVatNumberGroupDisabled: controllers.isPremium && !!pspData?.vatNumberGroup,
  };
};
