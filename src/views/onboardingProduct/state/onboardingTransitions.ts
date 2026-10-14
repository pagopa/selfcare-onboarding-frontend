import { InstitutionType } from '../../../../types';
import { OnboardingStepName } from './onboardingSteps';

/**
 * Facts about the current onboarding flow needed to decide the next step.
 * Each transition reads only the fields it needs, so callers can pass a partial context.
 */
export type TransitionContext = {
  productId: string;
  selectedProductId?: string;
  institutionType?: InstitutionType;
  /** Effective origin of the selected party (e.g. 'IPA', 'SELC'). */
  origin?: string;
  externalInstitutionId: string;
  fromDashboard: boolean;
  productAvoidStep: boolean;
  subunitTypeByQuery: string;
  isRequiredDocumentsFlow: boolean;
  isAggregator: boolean;
  /** True when the logged user is not among the onboarding users, so the applicant email is asked. */
  isApplicantEmailRequired: boolean;
  /** Mirrors ENV.GSP.NO_IPA. */
  gspNoIpaEnabled: boolean;
};

export type Transition =
  | { kind: 'goTo'; step: OnboardingStepName }
  | { kind: 'stay' }
  | { kind: 'openExitModal' }
  | { kind: 'redirect'; url: string }
  | { kind: 'submit' };

export const goTo = (step: OnboardingStepName): Transition => ({ kind: 'goTo', step });
export const stay = (): Transition => ({ kind: 'stay' });
export const openExitModal = (): Transition => ({ kind: 'openExitModal' });
export const redirect = (url: string): Transition => ({ kind: 'redirect', url });
export const submit = (): Transition => ({ kind: 'submit' });

/**
 * Same check used by the admin and aggregates steps: the applicant email is required when the
 * users are known and none of them is the logged user.
 */
export const requiresApplicantEmail = (
  users: ReadonlyArray<{ taxCode?: string } | undefined> | undefined,
  loggedUserTaxCode: string | undefined
): boolean => users?.every((u) => u?.taxCode !== loggedUserTaxCode) ?? false;
