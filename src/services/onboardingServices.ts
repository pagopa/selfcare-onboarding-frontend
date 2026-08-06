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
import { getErrorStatus } from '../lib/error-utils';
import { InstitutionOrigins } from '../model/InstitutionOrigins';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { ProductResource } from '../model/ProductResource';
import config from '../utils/config.json';
import { ENV } from '../utils/env';
import {
  isContractingAuthority,
  isGlobalServiceProvider,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isInteropProduct,
  isMockEnvironment,
  isPrivatePersonInstitution,
} from '../utils/institutionTypeUtils';
import { genericError } from '../views/onboardingProduct/components/StepVerifyOnboarding';

// NOTE: fetchVerifyOnboarding stays on fetchWithLogs because the endpoint is
// HEAD /institutions/onboarding (verifyOnboardingUsingHEAD), and the codegen
// tool @pagopa/openapi-codegen-ts v14 does not support HEAD methods.
// Same limitation as verifyVatNumber in validationServices.ts.

const fetchVerifyOnboarding = async (params: {
  taxCode: string;
  productId: string;
  subunitCode?: string;
  origin?: string;
  originId?: string;
  institutionType?: string;
}) => {
  try {
    await OnboardingApi.verifyOnboardingExternal(params);
    return { outcome: 'success' as const, status: undefined as number | undefined };
  } catch (error) {
    return { outcome: 'error' as const, status: getErrorStatus(error) };
  }
};

export const insertedPartyVerifyOnboarding = async (
  onboardingFormData: OnboardingFormData,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  productId: string,
  institutionType: InstitutionType | undefined,
  alreadyOnboarded: any,
  setOutcome: Dispatch<SetStateAction<any>>,
  notAllowedError: RequestOutcomeMessage
) => {
  const { outcome, status } = await fetchVerifyOnboarding({
    taxCode: onboardingFormData.taxCode ?? '',
    productId,
    subunitCode: onboardingFormData.uoUniqueCode ?? onboardingFormData.aooUniqueCode,
    origin: isInsuranceCompany(institutionType) ? 'IVASS' : undefined,
    originId: onboardingFormData?.originId ?? undefined,
  });

  if (outcome === 'success') {
    setOutcome(alreadyOnboarded);
  } else {
    if (status === 404 || status === 400) {
      setOutcome(null);
    } else if (status === 403) {
      setOutcome(notAllowedError);
    } else {
      setOutcome(genericError);
    }
  }
};

// Seconda funzione - logica per verifyOnboarding generico
export const verifyOnboarding = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
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

  const { outcome, status } = await fetchVerifyOnboarding({
    taxCode: onboardingFormData?.taxCode,
    productId,
    subunitCode: onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode,
    origin: onboardingFormData?.origin,
    originId: onboardingFormData?.originId,
    institutionType:
      isIdpayMerchantProduct(productId) && isPrivatePersonInstitution(institutionType)
        ? institutionType
        : undefined,
  });

  setLoading(false);

  if (outcome === 'success') {
    trackEvent('ONBOARDING_PRODUCT_ALREADY_SUBSCRIBED', {
      request_id: requestIdRef.current,
      party_id: onboardingFormData?.externalId,
      product_id: selectedProduct?.id,
    });
    setOutcome(alreadyOnboarded);
  } else {
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
      forward(undefined, undefined, undefined, institutionType);
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
  // In mock mode there is no CDN to hit: use the bundled copy the mocks already serve.
  if (isMockEnvironment()) {
    setFilterCategoriesResponse(config);
    return true;
  }
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
    } else {
      setRetrivedInstituionType(responseData as InstitutionOrigins);
    }
  } catch {
    setOutcome(genericError);
  } finally {
    setLoading(false);
  }
};
