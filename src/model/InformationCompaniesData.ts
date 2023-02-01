import { OnboardingFormData } from './OnboardingFormData';

export type InformationCompaniesDto = {
  // n. Iscrizione al Registro Imprese
  businessRegisterPlace?: string;
  // codice REA
  rea?: string;
  // capitale sociale
  shareCapital?: string;
};

export const informationCompaniesDto2pspDataRequest = (billingData: OnboardingFormData): InformationCompaniesDto => ({
  businessRegisterPlace: billingData.businessRegisterPlace,
    rea: billingData.rea,
    shareCapital: billingData.shareCapital
});
