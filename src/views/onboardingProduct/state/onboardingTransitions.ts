import { InstitutionType } from '../../../../types';
import {
  isCedProduct,
  isConsolidatedEconomicAccountCompany,
  isContractingAuthority,
  isGlobalServiceProvider,
  isInsuranceCompany,
  isPagoPaProduct,
  isPrivateInstitution,
  isPublicAdministration,
  isPublicServiceCompany,
} from '../../../utils/institutionTypeUtils';
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

// ---------------------------------------------------------------------------------------------
// Forward transitions: party selection
// ---------------------------------------------------------------------------------------------

/** Institution types that are not searched in a registry and go straight to the billing data. */
export const skipsPartySearch = (institutionType: InstitutionType): boolean =>
  !isGlobalServiceProvider(institutionType) &&
  !isPublicAdministration(institutionType) &&
  !isContractingAuthority(institutionType) &&
  !isInsuranceCompany(institutionType) &&
  !isPublicServiceCompany(institutionType) &&
  !isPrivateInstitution(institutionType) &&
  !isConsolidatedEconomicAccountCompany(institutionType);

/** Private institutions on prod-pagopa / CED products skip the party search with empty data. */
export const isPrivateWithoutPartySearch = (
  institutionType: InstitutionType,
  productId: string
): boolean =>
  isPrivateInstitution(institutionType) && (isPagoPaProduct(productId) || isCedProduct(productId));

export const afterInstitutionType = (
  selectedInstitutionType: InstitutionType,
  { productId }: Pick<TransitionContext, 'productId'>
): Transition =>
  isPrivateWithoutPartySearch(selectedInstitutionType, productId) ||
  skipsPartySearch(selectedInstitutionType)
    ? goTo('billingData')
    : goTo('searchParty');

export type SelectedParty = {
  taxCode?: string;
  originId?: string;
  externalId?: string;
};

/** A GSP chosen without a registry match (no tax code, no originId). */
export const isGspWithoutIpa = (
  party: SelectedParty | undefined,
  institutionType: InstitutionType | undefined
): boolean => party?.taxCode === '' && party?.originId === undefined && institutionType === 'GSP';

/**
 * GSP without IPA: confirmed from the search step it lands on the onboardingData pass-through
 * (which immediately forwards to the billing data); from the contracts summary it lands on the
 * billing data.
 */
export const afterGspNoIpa = (from: OnboardingStepName): Transition =>
  from === 'contractsSummary' ? goTo('billingData') : goTo('onboardingData');

/**
 * A party selected in the search step moves to the onboarding verification (skipping the
 * GSP-only contracts summary) once it has an externalId and an institution type, or straight
 * away when users data were already collected in a previous pass.
 */
export const afterPartySelection = (
  party: SelectedParty | undefined,
  selectedInstitutionType: InstitutionType | undefined,
  {
    gspNoIpaEnabled,
    hasFormData,
  }: Pick<TransitionContext, 'gspNoIpaEnabled'> & {
    hasFormData: boolean;
  }
): Transition => {
  if (isGspWithoutIpa(party, selectedInstitutionType)) {
    return gspNoIpaEnabled ? goTo('contractsSummary') : afterGspNoIpa('searchParty');
  }
  return (party?.externalId && selectedInstitutionType) || hasFormData
    ? goTo('verifyOnboarding')
    : stay();
};

export const afterVerifyOnboarding = (): Transition => goTo('onboardingData');

export const afterOnboardingData = (): Transition => goTo('billingData');
