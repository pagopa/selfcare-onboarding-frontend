/* eslint-disable complexity */
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import axios, { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import {
  InstitutionType,
  PartyData,
  Product,
  RequestOutcomeMessage,
  RequestOutcomeOptions,
  UserOnCreate,
} from '../../types';
import { OnboardingUserDto } from '../api/generated/onboarding/OnboardingUserDto';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { fetchWithLogs } from '../lib/api-utils';
import { getErrorStatus, getFetchOutcome } from '../lib/error-utils';
import { InstitutionOrigins } from '../model/InstitutionOrigins';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { ProductResource } from '../model/ProductResource';
import { PRODUCT_IDS } from '../utils/constants';
import { ENV } from '../utils/env';
import {
  isContractingAuthority,
  isGlobalServiceProvider,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isInteropProduct,
  isPrivatePersonInstitution,
} from '../utils/institutionTypeUtils';
import { genericError } from '../views/onboardingProduct/components/StepVerifyOnboarding';

// NOTE: fetchVerifyOnboarding stays on fetchWithLogs because the endpoint is
// HEAD /institutions/onboarding (verifyOnboardingUsingHEAD), and the codegen
// tool @pagopa/openapi-codegen-ts v14 does not support HEAD methods.
// Same limitation as verifyVatNumber in validationServices.ts.

const fetchVerifyOnboarding = async (
  params: {
    taxCode: string;
    productId: string;
    subunitCode?: string;
    origin?: string;
    originId?: string;
    institutionType?: string;
  },
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  const response = await fetchWithLogs(
    { endpoint: 'VERIFY_ONBOARDING' },
    {
      method: 'HEAD',
      params,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(response);

  return { response, outcome };
};

export const insertedPartyVerifyOnboarding = async (
  onboardingFormData: OnboardingFormData,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  productId: string,
  institutionType: InstitutionType | undefined,
  alreadyOnboarded: any,
  setOutcome: Dispatch<SetStateAction<any>>,
  notAllowedError: RequestOutcomeMessage
) => {
  const { response, outcome } = await fetchVerifyOnboarding(
    {
      taxCode: onboardingFormData.taxCode ?? '',
      productId,
      subunitCode: onboardingFormData.uoUniqueCode ?? onboardingFormData.aooUniqueCode,
      origin: isInsuranceCompany(institutionType) ? 'IVASS' : undefined,
      originId: onboardingFormData?.originId ?? undefined,
    },
    setRequiredLogin
  );

  if (outcome === 'success') {
    setOutcome(alreadyOnboarded);
  } else {
    if (
      (response as AxiosError<any>).response?.status === 404 ||
      (response as AxiosError<any>).response?.status === 400
    ) {
      setOutcome(null);
    } else if ((response as AxiosError<any>).response?.status === 403) {
      setOutcome(notAllowedError);
    } else {
      setOutcome(genericError);
    }
  }
};

// Seconda funzione - logica per verifyOnboarding generico
export const verifyOnboarding = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  productId: string,
  selectedProduct: any,
  setOutcome: Dispatch<SetStateAction<any>>,
  alreadyOnboarded: any,
  onboardingFormData: any,
  requestIdRef: any,
  forward: (...args: any) => void,
  institutionType: InstitutionType | undefined,
  genericError: any,
  externalInstitutionId: string | undefined,
  notAllowedErrorNoParty: RequestOutcomeMessage
) => {
  setLoading(true);

  const { response, outcome } = await fetchVerifyOnboarding(
    {
      taxCode: onboardingFormData?.taxCode,
      productId,
      subunitCode: onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode,
      origin: onboardingFormData?.origin,
      originId: onboardingFormData?.originId,
      institutionType:
        isIdpayMerchantProduct(productId) && isPrivatePersonInstitution(institutionType)
          ? institutionType
          : undefined,
    },
    setRequiredLogin
  );

  setLoading(false);

  if (outcome === 'success') {
    trackEvent('ONBOARDING_PRODUCT_ALREADY_SUBSCRIBED', {
      request_id: requestIdRef.current,
      party_id: onboardingFormData?.externalId,
      product_id: selectedProduct?.id,
    });
    setOutcome(alreadyOnboarded);
  } else {
    const status = (response as AxiosError<any>).response?.status;
    if (status === 404 || status === 400) {
      setOutcome(null);
      forward();
    } else if (status === 403) {
      trackEvent('ONBOARDING_NOT_ALLOWED_ERROR', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
      setOutcome(notAllowedErrorNoParty);
    } else {
      setOutcome(genericError);
    }
  }
};

export const getOnboardingData = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  productId: string,
  forward: (...args: any) => void,
  institutionType: InstitutionType | undefined,
  setOutcome: Dispatch<SetStateAction<any>>,
  genericError: any,
  partyId?: string
) => {
  setLoading(true);
  try {
    const result = await OnboardingApi.getOnboardingData(partyId ?? '', productId);
    const billingData = {
      ...result.institution.billingData,
      geographicTaxonomies: result.geographicTaxonomies,
    };
    forward(
      result.institution.origin,
      result.institution.originId,
      billingData,
      result.institution.institutionType ?? institutionType,
      result.institution.id,
      result.institution.companyInformations,
      result.institution.country,
      result.institution?.city
        ?.charAt(0)
        .toUpperCase()
        .concat(result.institution?.city.substring(1).toLowerCase().trim()),
      result.institution?.county,
      result.institution?.paymentServiceProvider,
      result.institution?.dataProtectionOfficer
    );
  } catch (error) {
    const status = getErrorStatus(error);
    if (status === 404 || status === 400) {
      forward(undefined, institutionType, undefined);
    } else {
      setOutcome(genericError);
    }
  } finally {
    setLoading(false);
  }
};

export const checkProduct = async (
  productId: string,
  setProduct: (product: Product | undefined | null) => void,
  options?: {
    onError?: (error: AxiosError) => void;
    onNotFound?: () => void;
    onPhaseOut?: (product: Product) => void;
  }
) => {
  try {
    const product = await OnboardingApi.getProduct(productId, undefined);
    setProduct(product);

    if (product?.status === 'PHASE_OUT' && options?.onPhaseOut) {
      options.onPhaseOut(product);
    }
  } catch (error) {
    const status = getErrorStatus(error);
    if (status === 404) {
      options?.onNotFound?.();
      setProduct(null);
    } else {
      console.error('Unexpected response', error);
      options?.onError?.(error as AxiosError);
      setProduct(null);
    }
  }
};

export const getFilterCategories = async (
  setOutcome: Dispatch<SetStateAction<RequestOutcomeMessage | null | undefined>>,
  setFilterCategoriesResponse: Dispatch<SetStateAction<any>>,
  genericError: any
): Promise<boolean> => {
  try {
    const cdnUrl = `${ENV.BASE_PATH_CDN_URL}/assets/config.json`;
    // Direct axios call to CDN without Authorization header to avoid CORS issues
    const response = await axios.get(cdnUrl);

    if (response.status === 200 && response.data) {
      setFilterCategoriesResponse(response.data);
      return true;
    } else {
      console.error('Unexpected response status:', response.status);
      setOutcome(genericError);
      return false;
    }
  } catch (error) {
    console.error('Error fetching filter categories:', error);
    setOutcome(genericError);
    return false;
  }
};

export const addUserRequest = async (
  users: Array<UserOnCreate>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  selectedProduct: Product | undefined,
  onboardingFormData: OnboardingFormData | undefined,
  selectedParty: PartyData | undefined,
  institutionType: InstitutionType | undefined,
  setOutcome: Dispatch<SetStateAction<any>>,
  outcomeContent: RequestOutcomeOptions,
  requestId: string | undefined
) => {
  setLoading(true);
  // eslint-disable-next-line functional/no-let
  let outcome: 'success' | 'error' = 'success';
  try {
    await OnboardingApi.onboardingUsers({
      productId: selectedProduct?.id,
      institutionType: onboardingFormData?.institutionType ?? institutionType,
      origin: isContractingAuthority(
        (onboardingFormData?.institutionType ?? institutionType) as InstitutionType
      )
        ? 'ANAC'
        : ['PSP', 'GPU', 'PT', 'PRV'].includes(
              (onboardingFormData?.institutionType ?? institutionType) as InstitutionType
            ) && !isInteropProduct(selectedProduct?.id)
          ? 'SELC'
          : onboardingFormData?.origin,
      originId: onboardingFormData?.originId ?? onboardingFormData?.taxCode,
      subunitCode: selectedParty?.codiceUniUo ?? selectedParty?.codiceUniAoo,
      taxCode: onboardingFormData?.taxCode,
      users,
    } as OnboardingUserDto);
  } catch {
    outcome = 'error';
  } finally {
    setLoading(false);
  }

  setOutcome(outcomeContent[outcome as keyof RequestOutcomeOptions]);
  trackEvent(outcome === 'success' ? 'ONBOARDING_USER_SUCCESS' : 'ONBOARDING_USER_ERROR', {
    request_id: requestId,
    party_id: selectedParty?.externalId,
    product_id: selectedProduct?.id,
    from: 'onboarding',
  });
};

export const getAllowedAddUserProducts = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setProducts: Dispatch<SetStateAction<any>>,
  setOutcome: Dispatch<SetStateAction<any>>,
  genericError: any
) => {
  setLoading(true);
  try {
    const retrievedProducts = await OnboardingApi.getProductsAdmin();
    setProducts(retrievedProducts as Array<ProductResource>);
  } catch {
    setOutcome(genericError);
  } finally {
    setLoading(false);
  }
};

export const getInstiutionTypesByProduct = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  productId: string | undefined,
  setRetrivedInstituionType: Dispatch<SetStateAction<InstitutionOrigins | undefined>>,
  setOutcome: Dispatch<SetStateAction<any>>,
  genericError: any
) => {
  setLoading(true);
  try {
    const responseData = await OnboardingApi.getOrigins(productId ?? '');

    if (!responseData?.origins || responseData.origins.length === 0) {
      setOutcome(genericError);
      return;
    }

    const filterGspResponse = responseData.origins.filter((item: any) =>
      isGlobalServiceProvider(item.institutionType)
    );

    if (filterGspResponse && filterGspResponse.length >= 2) {
      const gspWithMultiOrigins = {
        institutionType: filterGspResponse[0].institutionType,
        origin: [filterGspResponse[0].origin, filterGspResponse[1].origin],
        labelKey: 'gsp',
      };
      const nonGspOrigins = responseData.origins.filter(
        (item: any) => !isGlobalServiceProvider(item.institutionType)
      );
      const updatedInstitutionOrigins = [
        nonGspOrigins[0],
        gspWithMultiOrigins,
        ...nonGspOrigins.slice(1),
      ];
      setRetrivedInstituionType({
        ...responseData,
        origins: updatedInstitutionOrigins,
      } as InstitutionOrigins);
    } else if (productId === PRODUCT_IDS.CED) {
      const institutionsResponseCed = {
        institutionType: responseData.origins[1]?.institutionType,
        origin: responseData.origins[1]?.origin,
        labelKey: 'prv_ced',
      };
      setRetrivedInstituionType({
        ...responseData,
        origins: [responseData.origins[0], institutionsResponseCed],
      } as InstitutionOrigins);
    } else {
      setRetrivedInstituionType(responseData as InstitutionOrigins);
    }
  } catch {
    setOutcome(genericError);
  } finally {
    setLoading(false);
  }
};
