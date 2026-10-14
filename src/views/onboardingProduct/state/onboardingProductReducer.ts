import { SetStateAction } from 'react';
import { InstitutionType, Product, RequestOutcomeMessage } from '../../../../types';
import { AdditionalGpuInformations } from '../../../model/AdditionalGpuInformations';
import { AdditionalInformations } from '../../../model/AdditionalInformations';
import { AggregateInstitution } from '../../../model/AggregateInstitution';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { selected2OnboardingData } from '../../../utils/selected2OnboardingData';
import { OnboardingStepName } from './onboardingSteps';
import {
  afterGspNoIpa,
  afterInstitutionType,
  afterPartySelection,
  goTo,
  isGspWithoutIpa,
  isPrivateWithoutPartySearch,
  skipsPartySearch,
  Transition,
} from './onboardingTransitions';

export type UploadDocumentsContext = {
  onboardingId: string;
  productId: string;
  institutionType: string;
  origin: string;
};

/** Whole state of the product onboarding wizard. */
export type OnboardingProductState = {
  activeStep: OnboardingStepName;
  loading: boolean;
  outcome?: RequestOutcomeMessage | null;
  selectedProduct?: Product | null;
  pricingPlan?: string;
  institutionType?: InstitutionType;
  origin?: string;
  externalInstitutionId: string;
  onboardingFormData?: OnboardingFormData;
  /** Users collected by the manager/admins steps (legacy `Partial<FormData>` shape). */
  formData?: Partial<FormData>;
  additionalInformations?: AdditionalInformations;
  additionalGPUInformations?: AdditionalGpuInformations;
  aggregatesData?: Array<AggregateInstitution>;
  filterCategoriesResponse?: any;
  categoriesLoaded: boolean;
  openExitModal: boolean;
  onExitAction?: () => void;
  uploadDocumentsContext: UploadDocumentsContext | null;
};

export const createInitialState = (
  overrides: Partial<OnboardingProductState> = {}
): OnboardingProductState => ({
  activeStep: 'institutionType',
  loading: true,
  externalInstitutionId: '',
  categoriesLoaded: false,
  openExitModal: false,
  uploadDocumentsContext: null,
  ...overrides,
});

export const emptyBillingData = (): OnboardingFormData => ({
  businessName: '',
  registeredOffice: '',
  zipCode: '',
  digitalAddress: '',
  taxCode: '',
  vatNumber: '',
  recipientCode: '',
  geographicTaxonomies: [],
});

/** Applies a value or an updater with the same semantics as React's `setState`. */
export const resolveSetStateAction = <T>(action: SetStateAction<T>, previous: T): T =>
  typeof action === 'function' ? (action as (prev: T) => T)(previous) : action;

/** Moves to the transition target; non-navigation transitions are side effects handled outside. */
const applyTransition = (
  state: OnboardingProductState,
  transition: Transition
): OnboardingProductState =>
  transition.kind === 'goTo' ? { ...state, activeStep: transition.step } : state;

export type OnboardingProductAction =
  | { type: 'INSTITUTION_TYPE_SELECTED'; institutionType: InstitutionType; productId: string }
  | {
      type: 'PARTY_SELECTED';
      party: OnboardingFormData;
      institutionType: InstitutionType;
      gspNoIpaEnabled: boolean;
    }
  | { type: 'GSP_NO_IPA_SELECTED'; from: OnboardingStepName };

const selectInstitutionType = (
  state: OnboardingProductState,
  institutionType: InstitutionType,
  productId: string
): OnboardingProductState => {
  const onboardingFormData = isPrivateWithoutPartySearch(institutionType, productId)
    ? selected2OnboardingData(null, undefined, institutionType, productId)
    : skipsPartySearch(institutionType)
      ? institutionType !== state.institutionType
        ? emptyBillingData()
        : state.onboardingFormData
      : state.onboardingFormData;

  return applyTransition(
    { ...state, institutionType, onboardingFormData },
    afterInstitutionType(institutionType, { productId })
  );
};

const selectGspNoIpa = (
  state: OnboardingProductState,
  from: OnboardingStepName
): OnboardingProductState =>
  applyTransition(
    {
      ...state,
      origin: 'SELC',
      onboardingFormData: emptyBillingData(),
      externalInstitutionId: '',
    },
    afterGspNoIpa(from)
  );

/**
 * A searched party: records it and, once it has an externalId and an institution type, merges it
 * into the users form data and moves on (previously the `pendingForward` effects).
 */
const selectParty = (
  state: OnboardingProductState,
  party: OnboardingFormData,
  institutionType: InstitutionType,
  gspNoIpaEnabled: boolean
): OnboardingProductState => {
  if (isGspWithoutIpa(party, institutionType)) {
    return gspNoIpaEnabled
      ? applyTransition(state, goTo('contractsSummary'))
      : selectGspNoIpa(state, 'searchParty');
  }

  const externalInstitutionId = party?.externalId ?? '';
  const canMergeParty = !!externalInstitutionId && !!institutionType;
  const transition = afterPartySelection(party, institutionType, {
    gspNoIpaEnabled,
    hasFormData: !!state.formData,
  });

  return applyTransition(
    {
      ...state,
      institutionType,
      onboardingFormData: party,
      externalInstitutionId,
      origin: institutionType === 'GSP' && party?.originId ? 'IPA' : party?.origin || state.origin,
      formData: canMergeParty
        ? { ...state.formData, ...(party as Partial<FormData>) }
        : state.formData,
    },
    transition
  );
};

export const onboardingProductReducer = (
  state: OnboardingProductState,
  action: OnboardingProductAction
): OnboardingProductState => {
  switch (action.type) {
    case 'INSTITUTION_TYPE_SELECTED':
      return selectInstitutionType(state, action.institutionType, action.productId);
    case 'PARTY_SELECTED':
      return selectParty(state, action.party, action.institutionType, action.gspNoIpaEnabled);
    case 'GSP_NO_IPA_SELECTED':
      return selectGspNoIpa(state, action.from);
    default:
      return state;
  }
};
