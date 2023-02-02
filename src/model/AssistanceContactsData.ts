import { OnboardingFormData } from './OnboardingFormData';

export type AssistanceContactsDataDto = {
  // n. Iscrizione al Registro Imprese
  supportEmail?: string;

};

export const assistanceConcatsDto2pspDataRequest = (billingData: OnboardingFormData): AssistanceContactsDataDto => ({
    supportEmail: billingData.supportEmail,
});
