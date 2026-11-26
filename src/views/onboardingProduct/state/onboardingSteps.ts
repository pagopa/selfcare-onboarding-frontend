/**
 * Wizard steps of the product onboarding flow, in the same order in which OnboardingProduct renders them.
 * The index of each name is the step index used by the stepper.
 */
export const ONBOARDING_STEPS = [
  'institutionType',
  'searchParty',
  'contractsSummary',
  'verifyOnboarding',
  'onboardingData',
  'billingData',
  'additionalGpuInfo',
  'additionalInfo',
  'manager',
  'admins',
  'aggregates',
  'applicantEmail',
] as const;

export type OnboardingStepName = (typeof ONBOARDING_STEPS)[number];

export const stepIndex = (step: OnboardingStepName): number => ONBOARDING_STEPS.indexOf(step);

export const stepName = (index: number): OnboardingStepName | undefined => ONBOARDING_STEPS[index];
