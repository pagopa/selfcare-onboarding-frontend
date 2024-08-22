import { OnboardingFormData } from './OnboardingFormData';

export type BillingDataDto = {
  businessName: string;
  digitalAddress: string;
  recipientCode?: string;
  registeredOffice: string;
  taxCode?: string;
  taxCodeInvoicing?: string;
  vatNumber?: string;
  zipCode?: string;
};

export const billingData2billingDataRequest = (
  billingData: OnboardingFormData
): BillingDataDto => ({
  businessName: billingData?.uoName ?? billingData?.aooName ?? billingData?.businessName,
  digitalAddress: billingData.digitalAddress,
  recipientCode: billingData.recipientCode ? billingData.recipientCode.toUpperCase() : undefined,
  registeredOffice: billingData.registeredOffice,
  taxCode: billingData.taxCode,
  taxCodeInvoicing: billingData.taxCodeInvoicing,
  vatNumber: billingData.vatNumber,
  zipCode: billingData.zipCode,
});
