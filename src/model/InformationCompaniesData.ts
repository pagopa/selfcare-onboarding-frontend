import { OnboardingFormData } from './OnboardingFormData';

export type InformationCompaniesDto = {
  // n. iscrizione al Registro delle Imprese
  commercialRegisterNumber?: string;
  // dati del Responsabile protezione dati (DPO)
  rea?: string;
  // numero iscrizione albo
  shareCapital?: string;
};

export const informationCompaniesDto2pspDataRequest = (billingData: OnboardingFormData): InformationCompaniesDto => ({
    commercialRegisterNumber: billingData.commercialRegisterNumberInformationCompanies,
    rea: billingData.reaInformationCompanies,
    shareCapital: billingData.shareCapitalInformationCompanies
});
