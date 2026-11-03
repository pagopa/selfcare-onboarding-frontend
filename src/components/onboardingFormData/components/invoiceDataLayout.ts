import { PRODUCT_IDS } from '@pagopa/selfcare-common-frontend/lib/utils/constants';
import { FormikProps } from 'formik';
import { InstitutionType } from '../../../../types';
import { OnboardingControllers } from '../../../hooks/useOnboardingControllers';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import {
  isInsuranceCompany,
  isIoProduct,
  isPublicAdministration,
} from '../../../utils/institutionTypeUtils';

export type InvoiceLayoutParams = {
  controllers: OnboardingControllers;
  productId?: string;
  subProductId?: string;
  institutionType: InstitutionType;
  onboardingFormData?: Pick<OnboardingFormData, 'uoUniqueCode'>;
  taxCodeInvoicingVisible: boolean;
  formik: Pick<FormikProps<OnboardingFormData>, 'values' | 'initialValues' | 'errors'>;
};

export type InvoiceLayout = {
  showRecipientCode: boolean;
  isPaOrAooUo: boolean;
  isRecipientCodeDisabled: boolean;
  recipientCodeError?: string;
  showTaxCodeInvoicing: boolean;
  showOriginId: boolean;
  originIdMarginTop: number;
};

const hasAtLeast6Chars = (value?: string) => (value?.length ?? 0) >= 6;

export const getInvoiceLayout = ({
  controllers,
  productId,
  subProductId,
  institutionType,
  onboardingFormData,
  taxCodeInvoicingVisible,
  formik,
}: InvoiceLayoutParams): InvoiceLayout => {
  const isIoPremium = subProductId === PRODUCT_IDS.IO_PREMIUM;
  const isPa = isPublicAdministration(institutionType);
  const recipientCodeError = formik.errors.recipientCode;

  return {
    showRecipientCode: controllers.isInvoiceable && (!isIoProduct(productId) || isIoPremium),
    isPaOrAooUo: isPa || controllers.isAooUo,
    isRecipientCodeDisabled:
      controllers.isPremium &&
      !isIoPremium &&
      hasAtLeast6Chars(formik.values.recipientCode) &&
      hasAtLeast6Chars(formik.initialValues.recipientCode) &&
      !recipientCodeError,
    recipientCodeError: recipientCodeError === 'Required' ? undefined : recipientCodeError,
    showTaxCodeInvoicing:
      (!!onboardingFormData?.uoUniqueCode || isPa) &&
      controllers.isInvoiceable &&
      taxCodeInvoicingVisible,
    showOriginId: isInsuranceCompany(institutionType),
    originIdMarginTop: controllers.isForeignInsurance ? -3 : 0,
  };
};
