import { Dispatch, SetStateAction, useMemo, useReducer, useRef } from 'react';
import { InstitutionType, Product, RequestOutcomeMessage } from '../../../types';
import {
  createInitialState,
  onboardingProductReducer,
  OnboardingProductAction,
  OnboardingProductState,
  UploadDocumentsContext,
} from './state/onboardingProductReducer';

export type OnboardingProductSetters = {
  setLoading: Dispatch<SetStateAction<boolean>>;
  setOutcome: Dispatch<SetStateAction<RequestOutcomeMessage | null | undefined>>;
  setOpenExitModal: Dispatch<SetStateAction<boolean>>;
  setOnExitAction: Dispatch<SetStateAction<(() => void) | undefined>>;
  setSelectedProduct: Dispatch<SetStateAction<Product | null | undefined>>;
  setInstitutionType: Dispatch<SetStateAction<InstitutionType | undefined>>;
  setOrigin: Dispatch<SetStateAction<string | undefined>>;
  setFilterCategoriesResponse: Dispatch<SetStateAction<any>>;
};

/** Setters with the `useState` signature expected by services and steps, backed by the reducer. */
export const createSetters = (
  dispatch: Dispatch<OnboardingProductAction>
): OnboardingProductSetters => ({
  setLoading: (loading) => dispatch({ type: 'SET_LOADING', loading }),
  setOutcome: (outcome) => dispatch({ type: 'SET_OUTCOME', outcome }),
  setOpenExitModal: (open) => dispatch({ type: 'SET_EXIT_MODAL_OPEN', open }),
  setOnExitAction: (onExitAction) => dispatch({ type: 'SET_EXIT_ACTION', onExitAction }),
  setSelectedProduct: (product) => dispatch({ type: 'PRODUCT_LOADED', product }),
  setInstitutionType: (institutionType) =>
    dispatch({ type: 'SET_INSTITUTION_TYPE', institutionType }),
  setOrigin: (origin) => dispatch({ type: 'SET_ORIGIN', origin }),
  setFilterCategoriesResponse: (response) =>
    dispatch({ type: 'FILTER_CATEGORIES_RECEIVED', response }),
});

/**
 * State of the product onboarding wizard: a single reducer plus the refs that must survive
 * re-renders without triggering them.
 */
export const useOnboardingProductWizard = (initialState?: Partial<OnboardingProductState>) => {
  const [state, dispatch] = useReducer(onboardingProductReducer, initialState, createInitialState);
  const requestIdRef = useRef<string>();
  // The onboarding created by a required-documents submit: re-submitting reopens its upload flow.
  const createdOnboardingRef = useRef<UploadDocumentsContext | null>(null);
  // Stable identities: the setters are registered once by effects (e.g. the unload handler).
  const setters = useMemo(() => createSetters(dispatch), [dispatch]);

  return { state, dispatch, requestIdRef, createdOnboardingRef, ...setters };
};
