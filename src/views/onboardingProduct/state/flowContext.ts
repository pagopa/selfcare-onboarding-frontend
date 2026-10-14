import { InstitutionType } from '../../../../types';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../utils/constants';
import { isGlobalServiceProvider, isPagoPaProduct } from '../../../utils/institutionTypeUtils';

export type FlowLocation = Pick<Location, 'search' | 'hash' | 'pathname'>;

export type FlowContextInput = {
  location: FlowLocation;
  productId: string;
  selectedProductId?: string;
  institutionType?: InstitutionType;
  origin?: string;
  externalInstitutionId: string;
  onboardingFormData?: OnboardingFormData;
  gspNoIpaEnabled: boolean;
};

export type FlowContext = {
  fromDashboard: boolean;
  productAvoidStep: boolean;
  subunitTypeByQuery: string;
  subunitCodeByQuery: string;
  institutionTypeByUrl: string | null;
  addUser: boolean;
  isRequiredDocumentsFlow: boolean;
  partyName: string;
};

// Lazily built: utils/constants imports the onboarding views, so PRODUCT_IDS may not be
// initialized yet when this module is evaluated.
const productsAvoidingInstitutionTypeStep = (): ReadonlyArray<string> => [
  PRODUCT_IDS.SEND,
  PRODUCT_IDS.IDPAY,
  PRODUCT_IDS.IDPAY_MERCHANT,
];

export const getPartyName = (onboardingFormData?: OnboardingFormData): string =>
  onboardingFormData?.uoName ??
  onboardingFormData?.aooName ??
  onboardingFormData?.businessName ??
  '';

export const buildFlowContext = ({
  location,
  productId,
  selectedProductId,
  institutionType,
  origin,
  externalInstitutionId,
  onboardingFormData,
  gspNoIpaEnabled,
}: FlowContextInput): FlowContext => {
  const searchParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.substring(1));
  const partyExternalIdFromUrl = searchParams.get('partyExternalId');

  return {
    fromDashboard:
      !!partyExternalIdFromUrl &&
      (!externalInstitutionId || partyExternalIdFromUrl === externalInstitutionId),
    productAvoidStep: productsAvoidingInstitutionTypeStep().includes(selectedProductId ?? ''),
    subunitTypeByQuery: hashParams.get('subunitType') ?? '',
    subunitCodeByQuery: hashParams.get('subunitCode') ?? '',
    institutionTypeByUrl: searchParams.get('institutionType'),
    addUser: location.pathname.includes('/user'),
    isRequiredDocumentsFlow:
      isGlobalServiceProvider(institutionType) &&
      origin !== 'IPA' &&
      isPagoPaProduct(productId) &&
      gspNoIpaEnabled,
    partyName: getPartyName(onboardingFormData),
  };
};
