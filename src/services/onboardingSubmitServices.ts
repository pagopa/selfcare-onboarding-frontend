import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosError } from 'axios';
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
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { AdditionalGpuInformations } from '../model/AdditionalGpuInformations';
import { AdditionalInformations } from '../model/AdditionalInformations';
import { AggregateInstitution } from '../model/AggregateInstitution';
import { billingData2billingDataRequest } from '../model/BillingData';
import { onboardedInstitutionInfo2geographicTaxonomy } from '../model/GeographicTaxonomies';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { pspData2pspDataRequest } from '../model/PspData';
import { ENV } from '../utils/env';
import {
  isGlobalServiceProvider,
  isPagoPaProduct,
  isPrivateMerchantInstitution,
  isGpuInstitution,
  isInteropProduct,
  isIoSignProduct,
  isIoProduct,
  isPaymentServiceProvider,
  isPublicServiceCompany,
  isPublicAdministration,
} from '../utils/institutionTypeUtils';

// Funzione base che esegue la chiamata POST
const postOnboardingLegals = async (
  data: any,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  const response = await fetchWithLogs(
    { endpoint: 'ONBOARDING_POST_LEGALS' },
    {
      method: 'POST',
      data,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(response);

  return { response, outcome };
};

// Prima funzione con logica specifica per onboarding standard
// eslint-disable-next-line complexity
export const postOnboardingSubmit = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  productId: string,
  selectedProduct: Product | null | undefined,
  setOutcome: Dispatch<SetStateAction<any>>,
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
  aggregates?: Array<AggregateInstitution>
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  setLoading(true);
  const { response, outcome } = await postOnboardingLegals(
    {
      billingData: billingData2billingDataRequest(onboardingFormData as OnboardingFormData),
      atecoCodes: onboardingFormData?.atecoCodes,
      additionalInformations:
        isGlobalServiceProvider(institutionType) &&
        isPagoPaProduct(selectedProduct?.id) &&
        origin === 'IPA'
          ? {
              agentOfPublicService: additionalInformations?.agentOfPublicService,
              agentOfPublicServiceNote: additionalInformations?.agentOfPublicServiceNote,
              belongRegulatedMarket: additionalInformations?.belongRegulatedMarket,
              regulatedMarketNote: additionalInformations?.regulatedMarketNote,
              establishedByRegulatoryProvision:
                additionalInformations?.establishedByRegulatoryProvision,
              establishedByRegulatoryProvisionNote:
                additionalInformations?.establishedByRegulatoryProvisionNote,
              ipa: additionalInformations?.ipa,
              ipaCode: additionalInformations?.ipaCode,
              otherNote: additionalInformations?.otherNote,
            }
          : undefined,
      payment: isPrivateMerchantInstitution(institutionType, selectedProduct?.id)
        ? {
            holder: onboardingFormData?.holder,
            iban: onboardingFormData?.iban,
          }
        : undefined,
      gpuData:
        isGpuInstitution(institutionType) &&
        (isPagoPaProduct(selectedProduct?.id) ||
          isInteropProduct(selectedProduct?.id) ||
          isIoSignProduct(selectedProduct?.id) ||
          isIoProduct(selectedProduct?.id))
          ? additionalGPUInformations
          : undefined,
      pspData: isPaymentServiceProvider(institutionType)
        ? pspData2pspDataRequest(onboardingFormData as OnboardingFormData)
        : undefined,
      companyInformations:
        onboardingFormData?.businessRegisterPlace ||
        onboardingFormData?.rea ||
        onboardingFormData?.shareCapital
          ? {
              businessRegisterPlace: onboardingFormData?.businessRegisterPlace,
              rea: onboardingFormData?.rea,
              shareCapital: onboardingFormData?.shareCapital,
            }
          : undefined,
      institutionType,
      originId: onboardingFormData?.originId ?? onboardingFormData?.taxCode,
      geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
        ? onboardingFormData?.geographicTaxonomies?.map((gt: any) =>
            onboardedInstitutionInfo2geographicTaxonomy(gt)
          )
        : [],
      institutionLocationData: {
        country:
          isPublicServiceCompany(institutionType) && isInteropProduct(productId)
            ? 'IT'
            : onboardingFormData?.country,
        county: onboardingFormData?.county,
        city: onboardingFormData?.city,
      },
      origin,
      istatCode: origin !== 'IPA' ? onboardingFormData?.istatCode : undefined,
      users,
      pricingPlan,
      assistanceContacts: isIoSignProduct(productId)
        ? { supportEmail: onboardingFormData?.supportEmail }
        : undefined,
      productId,
      subunitCode: onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode,
      subunitType: onboardingFormData?.uoUniqueCode
        ? 'UO'
        : onboardingFormData?.aooUniqueCode
          ? 'AOO'
          : undefined,
      taxCode: onboardingFormData?.taxCode,
      isAggregator: onboardingFormData?.isAggregator ? onboardingFormData?.isAggregator : undefined,
      aggregates,
      userRequester: users.every((u) => u?.taxCode !== loggedUser?.taxCode)
        ? {
            name: onboardingFormData?.userRequester?.name,
            surname: onboardingFormData?.userRequester?.surname,
            email: onboardingFormData?.userRequester?.email,
          }
        : undefined,
    },
    setRequiredLogin
  );

  setLoading(false);

  if (outcome === 'success') {
    trackEvent('ONBOARDING_SEND_SUCCESS', {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
    });
    setOutcome(outcomeContent[outcome as keyof RequestOutcomeOptions]);
  } else {
    const responseStatus = (response as AxiosError<Problem>).response?.status;

    if (!responseStatus) {
      console.warn('ONBOARDING_SUBMIT: Response status is undefined or null', {
        response,
        outcome,
        hasResponse: !!(response as AxiosError<Problem>).response,
      });
    }

    const event =
      responseStatus === 409 ? 'ONBOARDING_SEND_CONFLICT_ERROR_FAILURE' : 'ONBOARDING_SEND_FAILURE';

    trackEvent(event, {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
    });

    if (responseStatus === 403) {
      trackEvent('ONBOARDING_NOT_ALLOWED_ERROR', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
      setOutcome(notAllowedError);
    } else {
      const outcomeToShow =
        outcomeContent[outcome as keyof RequestOutcomeOptions] || outcomeContent.error;
      setOutcome(outcomeToShow);
    }
  }
};

// Seconda funzione con logica specifica per sub-product onboarding
export const postSubProductOnboardingSubmit = async (
  externalInstitutionId: string,
  subProduct: Product,
  users: Array<UserOnCreate>,
  billingData: OnboardingFormData,
  institutionType: InstitutionType,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  requestId: string,
  product: Product,
  setError: Dispatch<SetStateAction<boolean>>,
  forward: () => void,
  origin: string,
  originId: string,
  setConflictError: Dispatch<SetStateAction<boolean>>,
  pricingPlan?: string
) => {
  const { response, outcome } = await postOnboardingLegals(
    {
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
      pricingPlan,
      origin,
      originId,
      geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
        ? billingData.geographicTaxonomies?.map((gt) =>
            onboardedInstitutionInfo2geographicTaxonomy(gt)
          )
        : [],
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
    },
    setRequiredLogin
  );

  if (outcome === 'success') {
    trackEvent('ONBOARDING_PREMIUM_SEND_SUCCESS', {
      request_id: requestId,
      party_id: externalInstitutionId,
      product_id: product?.id,
      subproduct_id: subProduct?.id,
      selected_plan: pricingPlan === 'C0' ? 'consumo' : 'carnet',
    });
    forward();
  } else {
    const event =
      (response as AxiosError<Problem>).response?.status === 409
        ? 'ONBOARDING_PREMIUM_SEND_CONFLICT_ERROR_FAILURE'
        : 'ONBOARDING_PREMIUM_SEND_FAILURE';

    setConflictError((response as AxiosError<Problem>).response?.status === 409);

    trackEvent(event, {
      party_id: externalInstitutionId,
      request_id: requestId,
      product_id: product?.id,
      subproduct_id: subProduct?.id,
      reason: (response as AxiosError<Problem>).response?.data?.detail,
    });
    setError(true);
  }
};
