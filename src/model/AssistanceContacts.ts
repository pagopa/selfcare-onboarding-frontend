import { OnboardingFormData } from './OnboardingFormData';

export type AssistanceContacts = {
  supportEmail?: string;
};

export const assistanceConcatsDto2pspDataRequest = (billingData: OnboardingFormData): AssistanceContacts => ({
    supportEmail: billingData.supportEmail,
});
