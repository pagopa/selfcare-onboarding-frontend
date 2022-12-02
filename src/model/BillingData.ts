import { OnboardingFormData } from "./OnboardingFormData";

export type BillingDataDto = {
    // Ragione sociale
    businessName: string;
    // Indirizzo PEC
    digitalAddress: string;
    // servizi pubblici
    publicServices?: boolean;
    // Codice destinatario
    recipientCode: string;
    // Sede legale
    registeredOffice: string;
    // Codice fiscale
    taxCode: string;
    // Partita iva
    vatNumber: string;
    // Codice di avviamento postale
    zipCode: string;
};
  

export const billingData2billingDataRequest = (
    billingData: OnboardingFormData
  ): BillingDataDto => ({
    businessName: billingData.businessName,
    digitalAddress: billingData.digitalAddress,
    publicServices: billingData.publicServices,
    recipientCode: billingData.recipientCode,
    registeredOffice: billingData.registeredOffice,
    taxCode: billingData.taxCode,
    vatNumber: billingData.vatNumber,
    zipCode: billingData.zipCode,
  });