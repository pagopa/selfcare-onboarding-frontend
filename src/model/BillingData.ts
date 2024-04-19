import { OnboardingFormData } from './OnboardingFormData';

export type BillingDataDto = {
  businessName: string;
  digitalAddress: string;
  recipientCode?: string;
  registeredOffice: string;
  taxCode?: string;
  vatNumber?: string;
  zipCode?: string;
};

export const billingData2billingDataRequest = (
  billingData: OnboardingFormData
): BillingDataDto => ({
  businessName: billingData.businessName,
  digitalAddress: billingData.digitalAddress,
  recipientCode: billingData.recipientCode ? billingData.recipientCode.toUpperCase() : undefined,
  registeredOffice: billingData.registeredOffice,
  taxCode: billingData.taxCode,
  vatNumber: billingData.vatNumber,
  zipCode: billingData.zipCode,
});
