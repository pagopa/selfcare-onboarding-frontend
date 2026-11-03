import { FormikErrors } from 'formik';
import { InstitutionType, PaymentServiceProviderDto } from '../../../../types';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import {
  isContractingAuthority,
  isIdpayMerchantProduct,
  isPagoPaProduct,
  isPaymentServiceProvider,
  isPdndPrivate,
  isPrivateInstitution,
  isPrivateMerchantInstitution,
} from '../../../utils/institutionTypeUtils';
import { showCommercialRegisterSection } from '../../../utils/validateFields';

export type CommercialRegisterLayoutParams = {
  isInfoCompany: boolean;
  institutionType: InstitutionType;
  productId?: string;
  isDisabled: boolean;
  pspData?: PaymentServiceProviderDto;
  errors: FormikErrors<OnboardingFormData>;
};

export type PspFieldsDisabled = {
  commercialRegisterNumber: boolean;
  registrationInRegister: boolean;
  registerNumber: boolean;
  abiCode: boolean;
};

export type CommercialRegisterLayout = {
  showCommercialRegister: boolean;
  isContractingAuthority: boolean;
  isRegisterPlaceRequired: boolean;
  isReaRequired: boolean;
  isShareCapitalRequired: boolean;
  showShareCapitalHelper: boolean;
  showPspFields: boolean;
  pspFieldsDisabled: PspFieldsDisabled;
};

const NOT_AVAILABLE = 'N/A';

const isAvailable = (value?: string) => !!value && value !== NOT_AVAILABLE;

// PSP fields filled from the registry are locked, unless they are invalid or not available
export const getPspFieldsDisabled = (
  isDisabled: boolean,
  errors: FormikErrors<OnboardingFormData>,
  pspData?: PaymentServiceProviderDto
): PspFieldsDisabled => ({
  commercialRegisterNumber:
    isDisabled && !!pspData?.businessRegisterNumber && !errors.commercialRegisterNumber,
  registrationInRegister: isDisabled && isAvailable(pspData?.legalRegisterName),
  registerNumber: isDisabled && isAvailable(pspData?.legalRegisterNumber) && !errors.registerNumber,
  abiCode: isDisabled && !!pspData?.abiCode && !errors.abiCode,
});

export const getCommercialRegisterLayout = ({
  isInfoCompany,
  institutionType,
  productId,
  isDisabled,
  pspData,
  errors,
}: CommercialRegisterLayoutParams): CommercialRegisterLayout => {
  const isSa = isContractingAuthority(institutionType);
  const isPdnd = isPdndPrivate(institutionType, productId);

  return {
    showCommercialRegister: showCommercialRegisterSection(
      isInfoCompany,
      institutionType,
      productId
    ),
    isContractingAuthority: isSa,
    isRegisterPlaceRequired:
      isSa || isPdnd || isPrivateMerchantInstitution(institutionType, productId),
    isReaRequired: !(isPrivateInstitution(institutionType) && isPagoPaProduct(productId)),
    isShareCapitalRequired: isSa || isPdnd,
    showShareCapitalHelper: isIdpayMerchantProduct(productId),
    showPspFields: isPaymentServiceProvider(institutionType),
    pspFieldsDisabled: getPspFieldsDisabled(isDisabled, errors, pspData),
  };
};
