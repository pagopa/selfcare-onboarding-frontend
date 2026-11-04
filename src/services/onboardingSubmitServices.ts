import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { Dispatch, SetStateAction, MutableRefObject } from 'react';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import {
  Product,
  InstitutionType,
  RequestOutcomeOptions,
  RequestOutcomeMessage,
  UserOnCreate,
  Problem,
} from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { OnboardingProductDto } from '../api/generated/onboarding/OnboardingProductDto';
import { getErrorStatus, HttpError } from '../lib/error-utils';
import { AdditionalGpuInformations } from '../model/AdditionalGpuInformations';
import { AdditionalInformations } from '../model/AdditionalInformations';
import { AggregateInstitution } from '../model/AggregateInstitution';
import { billingData2billingDataRequest } from '../model/BillingData';
import {
  GeographicTaxonomy,
  onboardedInstitutionInfo2geographicTaxonomy,
} from '../model/GeographicTaxonomies';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { pspData2pspDataRequest } from '../model/PspData';
import { ENV } from '../utils/env';
import {
  isGlobalServiceProvider,
  isPagoPaProduct,
  isGpuInstitution,
  isInteropProduct,
  isIoSignProduct,
  isIoProduct,
  isPaymentServiceProvider,
  isPublicServiceCompany,
  isPublicAdministration,
} from '../utils/institutionTypeUtils';

// The domain models are looser than the generated DTO (optional names, plain string enums):
// the payload is sent as built and validated by the backend.
type OnboardingLegalsPayload = Omit<
  OnboardingProductDto,
  'institutionType' | 'users' | 'aggregates' | 'userRequester'
> & {
  institutionType?: InstitutionType;
  users: ReadonlyArray<Partial<UserOnCreate>>;
  aggregates?: ReadonlyArray<AggregateInstitution>;
  userRequester?: Partial<OnboardingProductDto['userRequester']>;
};

// Funzione base che esegue la chiamata POST. Normalizza l'esito in
// { outcome, status, detail } poiché i caller hanno bisogno dello status
// (409/403) e del detail del Problem per il tracking.
const postOnboardingLegals = async (data: OnboardingLegalsPayload) => {
  try {
    await OnboardingApi.onboardingInstitution(data as OnboardingProductDto);
    return {
      outcome: 'success' as const,
      status: undefined as number | undefined,
      detail: undefined as string | undefined,
    };
  } catch (error) {
    return {
      outcome: 'error' as const,
      status: getErrorStatus(error),
      detail: ((error as HttpError).httpBody as Problem | undefined)?.detail,
    };
  }
};

const mapGeographicTaxonomies = (geographicTaxonomies?: Array<GeographicTaxonomy>) =>
  ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
    ? geographicTaxonomies?.map((gt) => onboardedInstitutionInfo2geographicTaxonomy(gt))
    : [];

const buildGspAdditionalInformations = (
  additionalInformations: AdditionalInformations | undefined,
  institutionType: InstitutionType | undefined,
  productId: string | undefined,
  origin: string | undefined
) => {
  if (
    !isGlobalServiceProvider(institutionType) ||
    !isPagoPaProduct(productId) ||
    origin === 'IPA'
  ) {
    return undefined;
  }
  return {
    agentOfPublicService: additionalInformations?.agentOfPublicService,
    agentOfPublicServiceNote: additionalInformations?.agentOfPublicServiceNote,
    belongRegulatedMarket: additionalInformations?.belongRegulatedMarket,
    regulatedMarketNote: additionalInformations?.regulatedMarketNote,
    establishedByRegulatoryProvision: additionalInformations?.establishedByRegulatoryProvision,
    establishedByRegulatoryProvisionNote:
      additionalInformations?.establishedByRegulatoryProvisionNote,
    ipa: additionalInformations?.ipa,
    ipaCode: additionalInformations?.ipaCode,
    otherNote: additionalInformations?.otherNote,
  };
};

const sendsGpuData = (institutionType: InstitutionType | undefined, productId?: string) =>
  isGpuInstitution(institutionType) &&
  (isPagoPaProduct(productId) ||
    isInteropProduct(productId) ||
    isIoSignProduct(productId) ||
    isIoProduct(productId));

const buildCompanyInformations = (onboardingFormData: OnboardingFormData | undefined) =>
  onboardingFormData?.businessRegisterPlace ||
  onboardingFormData?.rea ||
  onboardingFormData?.shareCapital
    ? {
        businessRegisterPlace: onboardingFormData?.businessRegisterPlace,
        rea: onboardingFormData?.rea,
        shareCapital: onboardingFormData?.shareCapital,
      }
    : undefined;

const buildInstitutionLocationData = (
  onboardingFormData: OnboardingFormData | undefined,
  institutionType: InstitutionType | undefined,
  productId: string
) => ({
  country:
    isPublicServiceCompany(institutionType) && isInteropProduct(productId)
      ? 'IT'
      : onboardingFormData?.country,
  county: onboardingFormData?.county,
  city: onboardingFormData?.city,
});

const getSubunitCode = (onboardingFormData: OnboardingFormData | undefined) =>
  onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode;

const getSubunitType = (onboardingFormData: OnboardingFormData | undefined) => {
  if (onboardingFormData?.uoUniqueCode) {
    return 'UO';
  }
  return onboardingFormData?.aooUniqueCode ? 'AOO' : undefined;
};

// The requester is sent only when the logged user is not one of the onboarded users.
const buildUserRequester = (
  onboardingFormData: OnboardingFormData | undefined,
  users: Array<UserOnCreate>,
  loggedUser: User | null
) =>
  users.every((u) => u?.taxCode !== loggedUser?.taxCode)
    ? {
        name: onboardingFormData?.userRequester?.name,
        surname: onboardingFormData?.userRequester?.surname,
        email: onboardingFormData?.userRequester?.email,
      }
    : undefined;

type OnboardingSubmitPayloadParams = {
  productId: string;
  selectedProduct: Product | null | undefined;
  onboardingFormData: OnboardingFormData | undefined;
  additionalInformations: AdditionalInformations | undefined;
  additionalGPUInformations: AdditionalGpuInformations | undefined;
  institutionType: InstitutionType | undefined;
  origin: string | undefined;
  pricingPlan: string | undefined;
  users: Array<UserOnCreate>;
  loggedUser: User | null;
  aggregates?: Array<AggregateInstitution>;
};

const buildOnboardingSubmitPayload = ({
  productId,
  selectedProduct,
  onboardingFormData,
  additionalInformations,
  additionalGPUInformations,
  institutionType,
  origin,
  pricingPlan,
  users,
  loggedUser,
  aggregates,
}: OnboardingSubmitPayloadParams): OnboardingLegalsPayload => ({
  billingData: billingData2billingDataRequest(onboardingFormData as OnboardingFormData),
  additionalInformations: buildGspAdditionalInformations(
    additionalInformations,
    institutionType,
    selectedProduct?.id,
    origin
  ),
  gpuData: sendsGpuData(institutionType, selectedProduct?.id)
    ? additionalGPUInformations
    : undefined,
  pspData: isPaymentServiceProvider(institutionType)
    ? pspData2pspDataRequest(onboardingFormData as OnboardingFormData)
    : undefined,
  companyInformations: buildCompanyInformations(onboardingFormData),
  institutionType,
  originId: onboardingFormData?.originId ?? onboardingFormData?.taxCode,
  geographicTaxonomies: mapGeographicTaxonomies(onboardingFormData?.geographicTaxonomies),
  institutionLocationData: buildInstitutionLocationData(
    onboardingFormData,
    institutionType,
    productId
  ),
  origin,
  istatCode: origin !== 'IPA' ? onboardingFormData?.istatCode : undefined,
  users,
  pricingPlan,
  assistanceContacts: isIoSignProduct(productId)
    ? { supportEmail: onboardingFormData?.supportEmail }
    : undefined,
  productId,
  subunitCode: getSubunitCode(onboardingFormData),
  subunitType: getSubunitType(onboardingFormData),
  taxCode: onboardingFormData?.taxCode,
  isAggregator: onboardingFormData?.isAggregator || undefined,
  aggregates,
  userRequester: buildUserRequester(onboardingFormData, users, loggedUser),
});

// Prima funzione con logica specifica per onboarding standard
export const postOnboardingSubmit = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  productId: string,
  selectedProduct: Product | null | undefined,
  setOutcome: Dispatch<SetStateAction<RequestOutcomeMessage | null | undefined>>,
  onboardingFormData: OnboardingFormData | undefined,
  requestIdRef: MutableRefObject<string | undefined>,
  externalInstitutionId: string,
  additionalInformations: AdditionalInformations | undefined,
  additionalGPUInformations: AdditionalGpuInformations | undefined,
  institutionType: InstitutionType | undefined,
  origin: string | undefined,
  outcomeContent: RequestOutcomeOptions,
  notAllowedError: RequestOutcomeMessage,
  pricingPlan: string | undefined,
  users: Array<UserOnCreate>,
  loggedUser: User | null,
  aggregates?: Array<AggregateInstitution>,
  onSuccess?: () => void,
  // GSP non-IPA: when provided, on success drives the in-flow document upload instead of the
  // standard "check your email" outcome (the onboarding is created in REQUESTING first).
  onRequiredDocuments?: () => void
) => {
  setLoading(true);
  const { outcome, status } = await postOnboardingLegals(
    buildOnboardingSubmitPayload({
      productId,
      selectedProduct,
      onboardingFormData,
      additionalInformations,
      additionalGPUInformations,
      institutionType,
      origin,
      pricingPlan,
      users,
      loggedUser,
      aggregates,
    })
  );

  setLoading(false);

  const trackingData = () => ({
    request_id: requestIdRef.current,
    party_id: externalInstitutionId,
    product_id: productId,
  });

  if (outcome === 'success') {
    trackEvent('ONBOARDING_SEND_SUCCESS', trackingData());
    if (onRequiredDocuments) {
      onRequiredDocuments();
    } else {
      setOutcome(outcomeContent.success);
      onSuccess?.();
    }
    return;
  }

  if (!status) {
    console.warn('ONBOARDING_SUBMIT: Response status is undefined or null', { outcome });
  }

  trackEvent(
    status === 409 ? 'ONBOARDING_SEND_CONFLICT_ERROR_FAILURE' : 'ONBOARDING_SEND_FAILURE',
    trackingData()
  );

  if (status === 403) {
    trackEvent('ONBOARDING_NOT_ALLOWED_ERROR', trackingData());
    setOutcome(notAllowedError);
  } else {
    setOutcome(outcomeContent.error);
  }
};

// Seconda funzione con logica specifica per sub-product onboarding
export const postSubProductOnboardingSubmit = async (
  externalInstitutionId: string,
  subProduct: Product,
  users: Array<UserOnCreate>,
  billingData: OnboardingFormData,
  institutionType: InstitutionType,
  requestId: string,
  product: Product,
  setError: Dispatch<SetStateAction<boolean>>,
  forward: () => void,
  origin: string | undefined,
  originId: string | undefined,
  pricingPlan: string | undefined,
  setConflictError: Dispatch<SetStateAction<boolean>>
) => {
  const { outcome, status, detail } = await postOnboardingLegals({
    users: users.map((u) => ({
      ...u,
      taxCode: u.taxCode?.toUpperCase(),
      email: u.email?.toLowerCase(),
    })),
    billingData: billingData2billingDataRequest(billingData as OnboardingFormData),
    pspData: isPaymentServiceProvider(institutionType)
      ? pspData2pspDataRequest(billingData as OnboardingFormData)
      : undefined,
    institutionType,
    origin,
    originId,
    pricingPlan,
    geographicTaxonomies: mapGeographicTaxonomies(billingData.geographicTaxonomies),
    companyInformations: !isPublicAdministration(institutionType)
      ? {
          businessRegisterPlace: billingData?.businessRegisterPlace,
          rea: billingData?.rea,
          shareCapital: billingData?.shareCapital,
        }
      : undefined,
    institutionLocationData: {
      city: billingData?.city,
      country: billingData?.country,
      county: billingData?.county,
    },
    productId: subProduct.id,
    subunitCode: undefined,
    subunitType: undefined,
    taxCode: billingData?.taxCode,
  });

  if (outcome === 'success') {
    trackEvent('ONBOARDING_PREMIUM_SEND_SUCCESS', {
      request_id: requestId,
      party_id: externalInstitutionId,
      product_id: product?.id,
      subproduct_id: subProduct?.id,
    });
    forward();
  } else {
    const event =
      status === 409
        ? 'ONBOARDING_PREMIUM_SEND_CONFLICT_ERROR_FAILURE'
        : 'ONBOARDING_PREMIUM_SEND_FAILURE';

    setConflictError(status === 409);

    trackEvent(event, {
      party_id: externalInstitutionId,
      request_id: requestId,
      product_id: product?.id,
      subproduct_id: subProduct?.id,
      reason: detail,
    });
    setError(true);
  }
};
