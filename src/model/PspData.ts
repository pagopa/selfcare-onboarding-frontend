import { DpoData } from "./DpoData";
import { OnboardingFormData } from "./OnboardingFormData";

export type PspDataDto = {
    // codice ABI
    abiCode: string;
    // n. iscrizione al Registro delle Imprese
    businessRegisterNumber: string;
    // dati del Responsabile protezione dati (DPO)
    dpoData: DpoData;
    // numero iscrizione albo
    legalRegisterNumber: string;
    // iscrizione all'Albo
    legalRegisterName: string;
    // La partita IVA è di gruppo
    vatNumberGroup: boolean;
};
  

export const pspData2pspDataRequest = (billingData: OnboardingFormData): PspDataDto => ({
    abiCode: billingData.abiCode ?? '',
    businessRegisterNumber: billingData.commercialRegisterNumber ?? '',
    dpoData: {
      address: billingData.dpoAddress ?? '',
      pec: billingData.dpoPecAddress ?? '',
      email: billingData.dopEmailAddress ?? '',
    },
    legalRegisterNumber: billingData.registerNumber ?? '',
    legalRegisterName: billingData.registrationInRegister ?? '',
    vatNumberGroup: billingData.vatNumberGroup ?? false,
  });