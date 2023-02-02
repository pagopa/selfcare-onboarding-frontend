import { OnboardingFormData } from './OnboardingFormData';

export type CompanyInformationsDto = {
  // n. Iscrizione al Registro Imprese
  businessRegisterPlace?: string;
  // codice REA
  rea?: string;
  // capitale sociale
  shareCapital?: string;
};

export const companyInformationsDto2pspDataRequest = (billingData: OnboardingFormData): CompanyInformationsDto => ({
  businessRegisterPlace: billingData.businessRegisterPlace,
    rea: billingData.rea,
    shareCapital: billingData.shareCapital
});
