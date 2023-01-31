import { OnboardingFormData } from './OnboardingFormData';

export type InformationCompaniesDto = {
  // n. Iscrizione al Registro Imprese (facoltativo)
  commercialRegisterNumber?: string;
  // codice REA
  rea?: string;
  // capitale sociale
  shareCapital?: string;
};

export const informationCompaniesDto2pspDataRequest = (billingData: OnboardingFormData): InformationCompaniesDto => ({
    commercialRegisterNumber: billingData.commercialRegisterNumberInformationCompanies,
    rea: billingData.reaInformationCompanies,
    shareCapital: billingData.shareCapitalInformationCompanies
});
