import { SetStateAction } from 'react';
import { InstitutionType, Product, RequestOutcomeMessage } from '../../../../types';
import { AdditionalGpuInformations } from '../../../model/AdditionalGpuInformations';
import { AdditionalInformations } from '../../../model/AdditionalInformations';
import { AggregateInstitution } from '../../../model/AggregateInstitution';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { OnboardingStepName } from './onboardingSteps';

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
