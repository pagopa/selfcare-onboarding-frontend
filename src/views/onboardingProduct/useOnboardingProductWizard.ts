import { useReducer, useRef } from 'react';
import {
  createInitialState,
  onboardingProductReducer,
  OnboardingProductState,
  UploadDocumentsContext,
} from './state/onboardingProductReducer';

/**
 * State of the product onboarding wizard: a single reducer plus the refs that must survive
 * re-renders without triggering them.
 */
export const useOnboardingProductWizard = (initialState?: Partial<OnboardingProductState>) => {
  const [state, dispatch] = useReducer(onboardingProductReducer, initialState, createInitialState);
  const requestIdRef = useRef<string>();
  // The onboarding created by a required-documents submit: re-submitting reopens its upload flow.
  const createdOnboardingRef = useRef<UploadDocumentsContext | null>(null);

  return { state, dispatch, requestIdRef, createdOnboardingRef };
};
