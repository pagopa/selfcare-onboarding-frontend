import { InstitutionType } from '../../../../types';
import { ENV } from '../../../utils/env';
import {
  isCedProduct,
  isConsolidatedEconomicAccountCompany,
  isContractingAuthority,
  isGlobalServiceProvider,
  isInsuranceCompany,
  isPagoPaInsights,
  isPagoPaProduct,
  isPaymentServiceProvider,
  isPrivateInstitution,
  isPrivatePersonInstitution,
  isPublicAdministration,
  isPublicServiceCompany,
  isTechPartner,
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

// ---------------------------------------------------------------------------------------------
// Forward transitions: data and users
// ---------------------------------------------------------------------------------------------

/** `origin` must be the effective one: the submitted billing origin, falling back to the current. */
export const afterBillingData = ({
  institutionType,
  origin,
}: Pick<TransitionContext, 'institutionType' | 'origin'>): Transition => {
  switch (institutionType) {
    case 'GSP':
      return origin === 'IPA' ? goTo('manager') : goTo('additionalInfo');
    case 'GPU':
      return goTo('additionalGpuInfo');
    case 'PT':
      return goTo('admins');
    default:
      return goTo('manager');
  }
};

export const afterAdditionalInfo = (): Transition => goTo('manager');

export const afterAdditionalGpuInfo = (): Transition => goTo('manager');

export const afterManager = (): Transition => goTo('admins');

export const afterAdmins = ({
  isAggregator,
  isApplicantEmailRequired,
}: Pick<TransitionContext, 'isAggregator' | 'isApplicantEmailRequired'>): Transition => {
  if (isAggregator) {
    return goTo('aggregates');
  }
  return isApplicantEmailRequired ? goTo('applicantEmail') : submit();
};

export const afterAggregates = ({
  isApplicantEmailRequired,
}: Pick<TransitionContext, 'isApplicantEmailRequired'>): Transition =>
  isApplicantEmailRequired ? goTo('applicantEmail') : submit();

export const afterApplicantEmail = (): Transition => submit();

// ---------------------------------------------------------------------------------------------
// Back transitions: selection and data steps
// ---------------------------------------------------------------------------------------------

export const backFromInstitutionType = (): Transition => openExitModal();

export const backFromSearchParty = (): Transition => goTo('institutionType');

export const backFromContractsSummary = (): Transition => goTo('searchParty');

const hasPartySearch = (institutionType: InstitutionType | undefined): boolean =>
  isPublicAdministration(institutionType) ||
  isContractingAuthority(institutionType) ||
  isGlobalServiceProvider(institutionType) ||
  isPrivateInstitution(institutionType) ||
  isPrivatePersonInstitution(institutionType);

export const backFromBillingData = ({
  fromDashboard,
  productAvoidStep,
  subunitTypeByQuery,
  institutionType,
  productId,
  externalInstitutionId,
  isRequiredDocumentsFlow,
}: Pick<
  TransitionContext,
  | 'fromDashboard'
  | 'productAvoidStep'
  | 'subunitTypeByQuery'
  | 'institutionType'
  | 'productId'
  | 'externalInstitutionId'
  | 'isRequiredDocumentsFlow'
>): Transition => {
  if (fromDashboard && !productAvoidStep) {
    return goTo('institutionType');
  }
  if ((fromDashboard || subunitTypeByQuery) && productAvoidStep) {
    return openExitModal();
  }
  if (isPaymentServiceProvider(institutionType) || !hasPartySearch(institutionType)) {
    return goTo('institutionType');
  }
  if (fromDashboard && isPagoPaInsights(productId)) {
    // Shadowed by the two fromDashboard branches above: kept to mirror backFunctions 1:1.
    return redirect(`${ENV.URL_FE.DASHBOARD}/${externalInstitutionId}`);
  }
  return isRequiredDocumentsFlow ? goTo('contractsSummary') : goTo('searchParty');
};

export const backFromAdditionalGpuInfo = (): Transition => goTo('billingData');

export const backFromAdditionalInfo = (): Transition => goTo('billingData');

// ---------------------------------------------------------------------------------------------
// Back transitions: users steps
// ---------------------------------------------------------------------------------------------

/**
 * Tech partners never reach the manager step (billing forwards them to the admins); the PT branch
 * keeps the historical `activeStep - 4` target, i.e. the onboardingData step.
 */
export const backFromManager = ({
  institutionType,
  origin,
  selectedProductId,
}: Pick<TransitionContext, 'institutionType' | 'origin' | 'selectedProductId'>): Transition => {
  switch (institutionType) {
    case 'GSP':
      return origin === 'IPA' && isPagoPaProduct(selectedProductId)
        ? goTo('billingData')
        : goTo('additionalInfo');
    case 'GPU':
      return goTo('additionalGpuInfo');
    case 'PT':
      return goTo('onboardingData');
    default:
      return goTo('billingData');
  }
};

export const backFromAdmins = ({
  institutionType,
}: Pick<TransitionContext, 'institutionType'>): Transition =>
  isTechPartner(institutionType) ? goTo('billingData') : goTo('manager');

export const backFromAggregates = (): Transition => goTo('admins');

export const backFromApplicantEmail = ({
  isAggregator,
}: Pick<TransitionContext, 'isAggregator'>): Transition =>
  isAggregator ? goTo('aggregates') : goTo('admins');

export const backFromUploadDocuments = (): Transition => goTo('admins');
