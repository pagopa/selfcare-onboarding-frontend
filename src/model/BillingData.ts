import { OnboardingFormData } from './OnboardingFormData';

export type BillingDataDto = {
  // Ragione sociale
  businessName: string;
  // Indirizzo PEC
  digitalAddress: string;
  // Codice destinatario
  recipientCode?: string;
  // Sede legale
  registeredOffice: string;
  // Codice fiscale
  taxCode: string;
  // Partita iva
  vatNumber: string;
  // CAP
  zipCode: string;
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
