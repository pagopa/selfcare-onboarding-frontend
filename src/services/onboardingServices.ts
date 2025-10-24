/* eslint-disable complexity */
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosError, AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import {
  InstitutionOnboardingInfoResource,
  InstitutionType,
  PartyData,
  Product,
  RequestOutcomeMessage,
  RequestOutcomeOptions,
  UserOnCreate,
} from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome, getResponseStatus } from '../lib/error-utils';
import { PRODUCT_IDS } from '../utils/constants';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { genericError } from '../views/onboardingProduct/components/StepVerifyOnboarding';
import config from '../utils/config.json';
import { ProductResource } from '../model/ProductResource';

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
      origin: institutionType === 'AS' ? 'IVASS' : undefined,
      originId: onboardingFormData?.originId ?? undefined,
    },
    setRequiredLogin
  );

  if (outcome === 'success') {
    setOutcome(alreadyOnboarded);
  } else {
    const responseStatus = getResponseStatus(response as AxiosError, 'VERIFY_ONBOARDING');

    if (responseStatus === 404 || responseStatus === 400) {
      setOutcome(null);
    } else if (responseStatus === 403) {
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
        productId === PRODUCT_IDS.IDPAY_MERCHANT && institutionType === 'PRV_PF'
          ? 'PRV_PF'
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
    const responseStatus = getResponseStatus(response as AxiosError, 'VERIFY_ONBOARDING');

    if (responseStatus === 404 || responseStatus === 400) {
      setOutcome(null);
      forward();
    } else if (responseStatus === 403) {
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
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  productId: string,
  forward: (...args: any) => void,
  institutionType: InstitutionType | undefined,
  setOutcome: Dispatch<SetStateAction<any>>,
  genericError: any,
  partyId?: string
) => {
  setLoading(true);

  const onboardingData = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_ONBOARDING_DATA',
    },
    {
      method: 'GET',
      params: {
        institutionId: partyId,
        productId,
      },
    },
    () => setRequiredLogin(true)
  );

  const restOutcomeData = getFetchOutcome(onboardingData);
  if (restOutcomeData === 'success') {
    const result = (onboardingData as AxiosResponse).data as InstitutionOnboardingInfoResource;
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
      result.institution.assistanceContacts,
      result.institution.companyInformations,
      result.institution?.city
        ?.charAt(0)
        .toUpperCase()
        .concat(result.institution?.city.substring(1).toLowerCase().trim()),
      result.institution?.county,
      result.institution.country,
      result.institution?.paymentServiceProvider,
      result.institution?.dataProtectionOfficer
    );
  } else {
    const responseStatus = getResponseStatus(onboardingData as AxiosError, 'GET_ONBOARDING_DATA');

    if (responseStatus === 404 || responseStatus === 400) {
      forward(undefined, institutionType, undefined);
    } else {
      setOutcome(genericError);
    }
  }
  setLoading(false);
};

export const checkProduct = async (
  productId: string,
  setProduct: (product: Product | undefined | null) => void,
  setRequiredLogin: (required: boolean) => void,
  options?: {
    onError?: (error: AxiosError) => void;
    onNotFound?: () => void;
    onPhaseOut?: (product: Product) => void;
  }
) => {
  const onboardingProducts = await fetchWithLogs(
    { endpoint: 'ONBOARDING_VERIFY_PRODUCT', endpointParams: { productId } },
    { method: 'GET' },
    () => setRequiredLogin(true)
  );

  const result = getFetchOutcome(onboardingProducts);

  if (result === 'success') {
    const product = (onboardingProducts as AxiosResponse).data;
    setProduct(product);

    if (product?.status === 'PHASE_OUT' && options?.onPhaseOut) {
      options.onPhaseOut(product);
    }
  } else {
    const responseStatus = getResponseStatus(onboardingProducts as AxiosError, 'CHECK_PRODUCT');

    if (responseStatus === 404) {
      options?.onNotFound?.();
      setProduct(null);
    } else {
      console.error('Unexpected response', (onboardingProducts as AxiosError).response);
      options?.onError?.(onboardingProducts as AxiosError);
      setProduct(null);
    }
  }
};

export const getFilterCategories = async (
  productId: string | undefined,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setFilterCategoriesResponse: Dispatch<SetStateAction<any>>
) => {
  if (productId === PRODUCT_IDS.IDPAY_MERCHANT) {
    setFilterCategoriesResponse(config);
    console.log('Using local config for IDPAY_MERCHANT:', config);
    return;
  }

  const categories = await fetchWithLogs(
    {
      endpoint: 'CONFIG_JSON_CDN_URL',
    },
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
    () => setRequiredLogin(true)
  );

  const restOutcome = getFetchOutcome(categories);
  if (restOutcome === 'success') {
    const response = (categories as AxiosResponse).data;
    setFilterCategoriesResponse(response);
  } else {
    setFilterCategoriesResponse(config);
  }
};

export const addUserRequest = async (
  users: Array<UserOnCreate>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  selectedProduct: Product | undefined,
  onboardingFormData: OnboardingFormData | undefined,
  selectedParty: PartyData | undefined,
  institutionType: InstitutionType | undefined,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setOutcome: Dispatch<SetStateAction<any>>,
  outcomeContent: RequestOutcomeOptions,
  requestId: string | undefined
) => {
  setLoading(true);

  const addUserResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_NEW_USER' },
    {
      method: 'POST',
      data: {
        productId: selectedProduct?.id,
        institutionType: onboardingFormData?.institutionType ?? institutionType,
        origin:
          (onboardingFormData?.institutionType ?? institutionType) === 'SA'
            ? 'ANAC'
            : ['PSP', 'GPU', 'PT', 'PRV'].includes(
                  (onboardingFormData?.institutionType ?? institutionType) as InstitutionType
                ) && selectedProduct?.id !== PRODUCT_IDS.INTEROP
              ? 'SELC'
              : onboardingFormData?.origin,
        originId: onboardingFormData?.originId ?? onboardingFormData?.taxCode,
        subunitCode: selectedParty?.codiceUniUo
          ? selectedParty.codiceUniUo
          : selectedParty?.codiceUniAoo,
        taxCode: onboardingFormData?.taxCode,
        users,
      },
    },
    () => setRequiredLogin(true)
  );

  setLoading(false);

  const outcome = getFetchOutcome(addUserResponse);

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
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setOutcome: Dispatch<SetStateAction<any>>,
  genericError: any
) => {
  setLoading(true);
  const getProductsRequest = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_ALLOWED_ADD_USER_PRODUCTS',
    },
    {
      method: 'GET',
    },
    () => setRequiredLogin(true)
  );
  const outcome = getFetchOutcome(getProductsRequest);

  if (outcome === 'success') {
    const retrievedProducts = (getProductsRequest as AxiosResponse).data as Array<ProductResource>;
    setProducts(retrievedProducts);
  } else {
    setOutcome(genericError);
  }
  setLoading(false);
};
