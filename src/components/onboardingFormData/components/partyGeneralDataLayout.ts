import { InstitutionType } from '../../../../types';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import {
  OnboardingFormData,
  OnboardingFormDataStringField,
} from '../../../model/OnboardingFormData';
import { isInsuranceCompany } from '../../../utils/institutionTypeUtils';
import {
  isAddressDisabled,
  isBusinessNameDisabled,
  isDigitalAddressDisabled,
  isFieldLockedForPrivate,
  isTaxCodeFieldDisabled,
  showTaxCodeField,
} from '../../../utils/validateFields';

export type SubunitField = {
  field: OnboardingFormDataStringField;
  labelKey: string;
};

export type SubunitFields = { name: SubunitField; code: SubunitField };

export type PartyGeneralLayoutParams = {
  controllers: OnboardingControllers;
  institutionType: InstitutionType;
  isInfoCompany: boolean;
  onboardingFormData?: OnboardingFormData;
  productId?: string;
};

export type PartyGeneralLayout = {
  subunitFields?: SubunitFields;
  isBusinessNameDisabled: boolean;
  isAddressDisabled: boolean;
  isForeignInsuranceCompany: boolean;
  isCityAutocompleteDisabled: boolean;
  isCityLocked: boolean;
  showCityPopupIcon: boolean;
  isDigitalAddressDisabled: boolean;
  showTaxCode: boolean;
  isTaxCodeDisabled: boolean;
};

const UO_FIELDS: SubunitFields = {
  name: { field: 'uoName', labelKey: 'onboardingFormData.billingDataSection.uoName' },
  code: { field: 'uoUniqueCode', labelKey: 'onboardingFormData.billingDataSection.uoUniqueCode' },
};

const AOO_FIELDS: SubunitFields = {
  name: { field: 'aooName', labelKey: 'onboardingFormData.billingDataSection.aooName' },
  code: {
    field: 'aooUniqueCode',
    labelKey: 'onboardingFormData.billingDataSection.aooUniqueCode',
  },
};

// A UO wins over an AOO; without subunit the business name is shown instead
export const getSubunitFields = (
  onboardingFormData?: Pick<OnboardingFormData, 'uoUniqueCode' | 'aooUniqueCode'>
): SubunitFields | undefined => {
  if (onboardingFormData?.uoUniqueCode) {
    return UO_FIELDS;
  }
  return onboardingFormData?.aooUniqueCode ? AOO_FIELDS : undefined;
};

export const getPartyGeneralLayout = ({
  controllers,
  institutionType,
  isInfoCompany,
  onboardingFormData,
  productId,
}: PartyGeneralLayoutParams): PartyGeneralLayout => {
  const lockedForPrivate = isFieldLockedForPrivate(institutionType, productId);
  const isLocked = (isFieldDisabled: typeof isBusinessNameDisabled) =>
    !!isFieldDisabled(
      controllers,
      institutionType,
      isInfoCompany,
      onboardingFormData,
      lockedForPrivate
    );
  const isCityFromRegistry = controllers.isFromIPA || controllers.isAooUo;

  return {
    subunitFields: getSubunitFields(onboardingFormData),
    isBusinessNameDisabled: isLocked(isBusinessNameDisabled),
    isAddressDisabled: isAddressDisabled(controllers, institutionType),
    isForeignInsuranceCompany:
      isInsuranceCompany(institutionType) && controllers.isForeignInsurance,
    isCityAutocompleteDisabled: controllers.isPremium || isCityFromRegistry,
    isCityLocked: !controllers.isCityEditable || isCityFromRegistry,
    showCityPopupIcon: !(controllers.isFromIPA || !controllers.isCityEditable),
    isDigitalAddressDisabled: isLocked(isDigitalAddressDisabled),
    showTaxCode: showTaxCodeField(institutionType, onboardingFormData),
    isTaxCodeDisabled: isLocked(isTaxCodeFieldDisabled),
  };
};
