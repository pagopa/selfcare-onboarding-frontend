import { SetStateAction } from 'react';
import { InstitutionType, Product, RequestOutcomeMessage } from '../../../../types';
import { AdditionalGpuInformations } from '../../../model/AdditionalGpuInformations';
import { AdditionalInformations } from '../../../model/AdditionalInformations';
import { AggregateInstitution } from '../../../model/AggregateInstitution';
import { OnboardingFormData, UserRequester } from '../../../model/OnboardingFormData';
import { selected2OnboardingData } from '../../../utils/selected2OnboardingData';
import { OnboardingStepName } from './onboardingSteps';
import {
  afterAdditionalGpuInfo,
  afterAdditionalInfo,
  afterAdmins,
  afterAggregates,
  afterBillingData,
  afterGspNoIpa,
  afterInstitutionType,
  afterManager,
  afterOnboardingData,
  afterPartySelection,
  backFromUploadDocuments,
  goTo,
  isGspWithoutIpa,
  isPrivateWithoutPartySearch,
  requiresApplicantEmail,
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
  | { type: 'GSP_NO_IPA_SELECTED'; from: OnboardingStepName }
  | {
      type: 'ONBOARDING_DATA_LOADED';
      onboardingFormData?: OnboardingFormData;
      institutionType?: InstitutionType;
    }
  | { type: 'BILLING_DATA_SUBMITTED'; onboardingFormData: OnboardingFormData }
  | { type: 'ADDITIONAL_INFO_SUBMITTED'; additionalInformations: AdditionalInformations }
  | {
      type: 'ADDITIONAL_GPU_INFO_SUBMITTED';
      additionalGPUInformations: AdditionalGpuInformations;
    }
  | {
      type: 'USERS_SUBMITTED';
      from: 'manager' | 'admins';
      formData?: Partial<FormData>;
      loggedUserTaxCode?: string;
    }
  | {
      type: 'AGGREGATES_SUBMITTED';
      aggregates?: Array<AggregateInstitution>;
      loggedUserTaxCode?: string;
    }
  | { type: 'APPLICANT_EMAIL_SUBMITTED'; userRequester: UserRequester }
  | { type: 'GO_TO_STEP'; step: OnboardingStepName }
  | OnboardingProductUiAction;

/** Actions mirroring plain setters (value or updater) and UI toggles. */
export type OnboardingProductUiAction =
  | { type: 'SET_LOADING'; loading: SetStateAction<boolean> }
  | { type: 'SET_OUTCOME'; outcome: SetStateAction<RequestOutcomeMessage | null | undefined> }
  | { type: 'PRODUCT_LOADED'; product: SetStateAction<Product | null | undefined> }
  | { type: 'PRICING_PLAN_LOADED'; pricingPlan?: string }
  | { type: 'SET_INSTITUTION_TYPE'; institutionType: SetStateAction<InstitutionType | undefined> }
  | { type: 'SET_ORIGIN'; origin: SetStateAction<string | undefined> }
  | { type: 'CATEGORIES_LOADING' }
  | { type: 'FILTER_CATEGORIES_RECEIVED'; response: SetStateAction<any> }
  | { type: 'CATEGORIES_LOADED' }
  | { type: 'SET_EXIT_MODAL_OPEN'; open: SetStateAction<boolean> }
  | { type: 'SET_EXIT_ACTION'; onExitAction: SetStateAction<(() => void) | undefined> }
  | { type: 'OPEN_EXIT_MODAL'; onExitAction: () => void }
  | { type: 'CLOSE_EXIT_MODAL' }
  | { type: 'OPEN_UPLOAD_DOCUMENTS'; context: UploadDocumentsContext }
  | { type: 'UPLOAD_DOCUMENTS_BACK' }
  | { type: 'UPLOAD_DOCUMENTS_COMPLETED'; outcome: RequestOutcomeMessage };

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

export const usersOf = (
  formData: Partial<FormData> | undefined
): Array<{ taxCode?: string }> | undefined => (formData as any)?.users;

/** Manager and admins steps: merge the users into the form data and move on. */
const submitUsers = (
  state: OnboardingProductState,
  from: 'manager' | 'admins',
  newFormData: Partial<FormData> | undefined,
  loggedUserTaxCode: string | undefined
): OnboardingProductState => {
  const formData = { ...state.formData, ...newFormData };
  const transition =
    from === 'manager'
      ? afterManager()
      : afterAdmins({
          isAggregator: !!state.onboardingFormData?.isAggregator,
          isApplicantEmailRequired: requiresApplicantEmail(usersOf(formData), loggedUserTaxCode),
        });
  return applyTransition({ ...state, formData }, transition);
};

const uiReducer = (
  state: OnboardingProductState,
  action: OnboardingProductUiAction
): OnboardingProductState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: resolveSetStateAction(action.loading, state.loading) };
    case 'SET_OUTCOME':
      return { ...state, outcome: resolveSetStateAction(action.outcome, state.outcome) };
    case 'PRODUCT_LOADED':
      return {
        ...state,
        selectedProduct: resolveSetStateAction(action.product, state.selectedProduct),
      };
    case 'PRICING_PLAN_LOADED':
      return { ...state, pricingPlan: action.pricingPlan };
    case 'SET_INSTITUTION_TYPE':
      return {
        ...state,
        institutionType: resolveSetStateAction(action.institutionType, state.institutionType),
      };
    case 'SET_ORIGIN':
      return { ...state, origin: resolveSetStateAction(action.origin, state.origin) };
    case 'CATEGORIES_LOADING':
      return { ...state, categoriesLoaded: false };
    case 'FILTER_CATEGORIES_RECEIVED':
      return {
        ...state,
        filterCategoriesResponse: resolveSetStateAction(
          action.response,
          state.filterCategoriesResponse
        ),
      };
    case 'CATEGORIES_LOADED':
      return { ...state, categoriesLoaded: true };
    case 'SET_EXIT_MODAL_OPEN':
      return { ...state, openExitModal: resolveSetStateAction(action.open, state.openExitModal) };
    case 'SET_EXIT_ACTION':
      return {
        ...state,
        onExitAction: resolveSetStateAction(action.onExitAction, state.onExitAction),
      };
    case 'OPEN_EXIT_MODAL':
      return { ...state, openExitModal: true, onExitAction: action.onExitAction };
    case 'CLOSE_EXIT_MODAL':
      return { ...state, openExitModal: false, onExitAction: undefined };
    case 'OPEN_UPLOAD_DOCUMENTS':
      return { ...state, uploadDocumentsContext: action.context };
    case 'UPLOAD_DOCUMENTS_BACK':
      return applyTransition({ ...state, uploadDocumentsContext: null }, backFromUploadDocuments());
    case 'UPLOAD_DOCUMENTS_COMPLETED':
      return { ...state, uploadDocumentsContext: null, outcome: action.outcome };
    default:
      return state;
  }
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
    case 'ONBOARDING_DATA_LOADED':
      return applyTransition(
        {
          ...state,
          onboardingFormData: action.onboardingFormData ?? state.onboardingFormData,
          institutionType: action.institutionType,
        },
        afterOnboardingData()
      );
    case 'BILLING_DATA_SUBMITTED':
      return applyTransition(
        { ...state, onboardingFormData: action.onboardingFormData },
        afterBillingData({
          institutionType: state.institutionType,
          origin: action.onboardingFormData?.origin || state.origin,
        })
      );
    case 'ADDITIONAL_INFO_SUBMITTED':
      return applyTransition(
        { ...state, additionalInformations: action.additionalInformations },
        afterAdditionalInfo()
      );
    case 'ADDITIONAL_GPU_INFO_SUBMITTED':
      return applyTransition(
        { ...state, additionalGPUInformations: action.additionalGPUInformations },
        afterAdditionalGpuInfo()
      );
    case 'USERS_SUBMITTED':
      return submitUsers(state, action.from, action.formData, action.loggedUserTaxCode);
    case 'AGGREGATES_SUBMITTED':
      // Without the applicant email step the onboarding is submitted: nothing changes here.
      return requiresApplicantEmail(usersOf(state.formData), action.loggedUserTaxCode)
        ? applyTransition(
            { ...state, aggregatesData: action.aggregates, loading: false },
            afterAggregates({ isApplicantEmailRequired: true })
          )
        : state;
    case 'APPLICANT_EMAIL_SUBMITTED':
      return {
        ...state,
        onboardingFormData: {
          ...state.onboardingFormData,
          userRequester: action.userRequester,
        } as OnboardingFormData,
      };
    case 'GO_TO_STEP':
      return applyTransition(state, goTo(action.step));
    default:
      return uiReducer(state, action);
  }
};
