import { Dispatch, SetStateAction } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { Endpoint, ApiEndpointKey, PartyData, Product, InstitutionType } from '../../types';
import { AooData } from '../model/AooData';
import { UoData } from '../model/UoModel';
import { PRODUCT_IDS } from '../utils/constants';
import {
  isContractingAuthority,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isInteropOrIdpayMerchantProduct,
  isInteropProduct,
  isPublicServiceCompany,
  shouldSkipCategoriesFilter,
} from '../utils/institutionTypeUtils';
import config from '../utils/config.json';

const validateIdpayMerchantInstitution = (
  response: PartyData,
  disabledStatusCompany: boolean | undefined,
  filterCategories: string | { atecoCodes: string; allowedInstitutions: string } | undefined,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  setIsPresentInAtecoWhiteList: (value: boolean) => void,
  setMerchantSearchResult: Dispatch<SetStateAction<PartyData | undefined>> | undefined
) => {
  setMerchantSearchResult?.(response);

  const merchantDetails =
    (filterCategories as { atecoCodes: string; allowedInstitutions: string }) ||
    config.product['prod-idpay-merchant']?.merchantDetails;

  const allowedInstitutionsStr =
    merchantDetails?.allowedInstitutions ||
    config.product['prod-idpay-merchant']?.merchantDetails?.allowedInstitution ||
    '';

  const allowedInstitutions = allowedInstitutionsStr
    ? allowedInstitutionsStr.split(',').filter(Boolean)
    : [];

  if (disabledStatusCompany) {
    setDisabled(true);
    setIsPresentInAtecoWhiteList?.(false);
  } else if (
    response?.businessTaxId &&
    allowedInstitutions.length > 0 &&
    allowedInstitutions.includes(response.businessTaxId)
  ) {
    setIsPresentInAtecoWhiteList?.(true);
    setDisabled(false);
  } else if (
    merchantDetails?.atecoCodes &&
    response?.atecoCodes &&
    Array.isArray(response.atecoCodes)
  ) {
    const whitelistCodes = merchantDetails.atecoCodes.split(',').filter(Boolean);
    const hasMatchingCode = response.atecoCodes.some((code: string) =>
      whitelistCodes.includes(code)
    );
    setIsPresentInAtecoWhiteList?.(hasMatchingCode);
    setDisabled(!hasMatchingCode);
  } else {
    setIsPresentInAtecoWhiteList?.(false);
    setDisabled(true);
  }
};

export const handleSearchByTaxCode = async (
  query: string,
  filterCategories: string | undefined,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setRetrievedIstat: Dispatch<SetStateAction<string | undefined>>,
  setOriginId4Premium: Dispatch<SetStateAction<string | undefined>>
) => {
  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
    {
      method: 'GET',
      params: {
        origin: 'IPA',
        categories: filterCategories,
      },
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    setRetrievedIstat((searchResponse as AxiosResponse).data.istatCode);
    setOriginId4Premium((searchResponse as AxiosResponse).data.originId);
  }
};

export const getUoInfoFromRecipientCode = async (
  recipientCode: string,
  setDisableTaxCodeInvoicing: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  formik: any
) => {
  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_UO_CODE_INFO', endpointParams: { codiceUniUo: recipientCode } },
    {
      method: 'GET',
      params: undefined,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    formik.setFieldValue(
      'taxCodeInvoicing',
      (searchResponse as AxiosResponse).data?.codiceFiscaleSfe
    );
    setDisableTaxCodeInvoicing(true);
  } else {
    setDisableTaxCodeInvoicing(false);
  }
};

export const fetchInstitutionsByName = async (
  query: string,
  endpoint: Endpoint,
  setOptions: Dispatch<SetStateAction<Array<any>>>,
  transformFn: any,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  limit?: number,
  categories?: string
) => {
  const searchResponse = await fetchWithLogs(
    endpoint,
    {
      method: 'GET',
      params: {
        limit,
        page: 1,
        search: query,
        categories,
      },
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    setOptions(transformFn((searchResponse as AxiosResponse).data));
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    setOptions([]);
  }
};

const fetchInstitutionByTaxCodeOnInfocamere = async (
  productId: string | undefined,
  query: string,
  filterCategories: { atecoCodes: string; allowedInstitutions: string } | string | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  const scpResearchParams = {
    categories: isInteropOrIdpayMerchantProduct(productId)
      ? undefined
      : (filterCategories as string),
  };

  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE', endpointParams: { id: query } },
    {
      method: 'GET',
      params: scpResearchParams,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    const response = (searchResponse as AxiosResponse).data;
    setCfResult(response);
  } else {
    setCfResult(undefined);
  }
};

export const fetchInstitutionByTaxCode = async (
  addUser: boolean,
  endpoint: ApiEndpointKey,
  params: any,
  query: string,
  productId: string | undefined,
  institutionType: string | undefined,
  filterCategories: { atecoCodes: string; allowedInstitutions: string } | string | undefined,
  disabledStatusCompany: boolean | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  setMerchantSearchResult: Dispatch<SetStateAction<PartyData | undefined>> | undefined,
  setIsPresentInAtecoWhiteList: (value: boolean) => void | undefined,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  console.log("endpoint", endpoint);
  const updatedParams = {
    ...params,
    taxCode: addUser ? query : undefined,
    categories: shouldSkipCategoriesFilter(institutionType as InstitutionType, productId)
      ? undefined
      : (filterCategories as string),
  };

  const searchResponse = await fetchWithLogs(
    { endpoint, endpointParams: addUser ? undefined : { id: query } },
    {
      method: 'GET',
      params: updatedParams,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  console.log('fetchInstitutionByTaxCode outcome', outcome);

  if (outcome === 'success') {
    const response = (searchResponse as AxiosResponse).data;
    setCfResult(response);

    if (isIdpayMerchantProduct(productId)) {
      validateIdpayMerchantInstitution(
        response,
        disabledStatusCompany,
        filterCategories,
        setDisabled,
        setIsPresentInAtecoWhiteList,
        setMerchantSearchResult
      );
    }
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    console.log('fetchInstitutionByTaxCode 404');
    setCfResult(undefined);

    if (isIdpayMerchantProduct(productId)) {
      setIsPresentInAtecoWhiteList?.(false);
      setMerchantSearchResult?.(undefined);
    }

    if (isPublicServiceCompany(institutionType as InstitutionType) && isInteropProduct(productId)) {
      console.log('faccio la chiamata ad infocamere');
      await fetchInstitutionByTaxCodeOnInfocamere(
        productId,
        query,
        filterCategories,
        setCfResult,
        setRequiredLogin
      );
    }
  }
};

export const handleSearchByReaCode = async (
  addUser: boolean,
  endpoint: ApiEndpointKey,
  params: any,
  query: string,
  setApiLoading: Dispatch<SetStateAction<boolean>> | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  setIsPresentInAtecoWhiteList: (value: boolean) => void,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  product: Product | undefined,
  filterCategories: string | { atecoCodes: string; allowedInstitutions: string } | undefined,
  disabledStatusCompany: boolean | undefined,
  setMerchantSearchResult: Dispatch<SetStateAction<PartyData | undefined>> | undefined
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  setApiLoading?.(true);

  const reaPattern = /^[A-Za-z]{2}-\d{6}$/;
  if (!reaPattern.test(query)) {
    setApiLoading?.(false);
    setCfResult(undefined);
    setIsPresentInAtecoWhiteList?.(false);
    return;
  }

  const updatedParams = addUser
    ? params
    : {
        rea: query,
      };

  const searchResponse = await fetchWithLogs(
    {
      endpoint,
    },
    {
      method: 'GET',
      params: updatedParams,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    const response = (searchResponse as AxiosResponse).data;
    setCfResult(response);

    if (isIdpayMerchantProduct(product?.id)) {
      validateIdpayMerchantInstitution(
        response,
        disabledStatusCompany,
        filterCategories,
        setDisabled,
        setIsPresentInAtecoWhiteList,
        setMerchantSearchResult
      );
    }
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    setCfResult(undefined);
    if (isIdpayMerchantProduct(product?.id)) {
      setMerchantSearchResult?.(undefined);
      setIsPresentInAtecoWhiteList?.(false);
    }
  }

  setApiLoading?.(false);
};

export const handleSearchByAooCode = async (
  query: string,
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>,
  setAooResultHistory: (t: AooData | undefined) => void,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setApiLoading?: Dispatch<SetStateAction<boolean>>,
  addUser: boolean = false,
  endpoint: ApiEndpointKey = 'ONBOARDING_GET_AOO_CODE_INFO',
  params: any = {},
  filterCategories?: string,
  productId?: string
) => {
  setApiLoading?.(true);

  // eslint-disable-next-line functional/no-let
  let updatedParams;
  if (addUser) {
    updatedParams = params;
  } else {
    if (productId !== undefined) {
      updatedParams =
        productId === PRODUCT_IDS.SEND
          ? {
              categories: filterCategories,
              origin: 'IPA',
            }
          : {};
    } else {
      updatedParams = {
        origin: 'IPA',
        categories: filterCategories,
      };
    }
  }

  const searchResponse = await fetchWithLogs(
    { endpoint, endpointParams: addUser ? undefined : { codiceUniAoo: query } },
    {
      method: 'GET',
      params: updatedParams,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    const response = addUser
      ? ((searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data)
      : (searchResponse as AxiosResponse).data;
    setAooResult(response);
    setAooResultHistory(response);
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    setAooResult(undefined);
  }

  setApiLoading?.(false);
};

export const handleSearchByUoCode = async (
  query: string,
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>,
  setUoResultHistory: (t: UoData | undefined) => void,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setApiLoading?: Dispatch<SetStateAction<boolean>>,
  addUser: boolean = false,
  endpoint: ApiEndpointKey = 'ONBOARDING_GET_UO_CODE_INFO',
  params: any = {},
  filterCategories?: string,
  productId?: string
) => {
  setApiLoading?.(true);

  // eslint-disable-next-line functional/no-let
  let updatedParams;
  if (addUser) {
    updatedParams = params;
  } else {
    if (productId !== undefined) {
      updatedParams =
        productId === PRODUCT_IDS.SEND
          ? {
              categories: filterCategories,
              origin: 'IPA',
            }
          : {};
    } else {
      updatedParams = {
        origin: 'IPA',
        categories: filterCategories,
      };
    }
  }

  const searchResponse = await fetchWithLogs(
    { endpoint, endpointParams: addUser ? undefined : { codiceUniUo: query } },
    {
      method: 'GET',
      params: updatedParams,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    const response = addUser
      ? ((searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data)
      : (searchResponse as AxiosResponse).data;
    setUoResult(response);
    setUoResultHistory(response);
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    setUoResult(undefined);
  }

  setApiLoading?.(false);
};

export const contractingInsuranceFromTaxId = async (
  addUser: boolean,
  endpoint: ApiEndpointKey,
  params: any,
  query: string,
  institutionType: InstitutionType | undefined,
  setApiLoading: Dispatch<SetStateAction<boolean>> | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  setApiLoading?.(true);

  const searchResponse = await fetchWithLogs(
    {
      endpoint,
      endpointParams: addUser
        ? undefined
        : isContractingAuthority(institutionType) || isInsuranceCompany(institutionType)
          ? { taxId: query }
          : { code: query },
    },
    {
      method: 'GET',
      params: addUser ? params : undefined,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);
  if (outcome === 'success') {
    const response = addUser
      ? ((searchResponse as AxiosResponse).data[0] ?? (searchResponse as AxiosResponse).data)
      : (searchResponse as AxiosResponse).data;
    setCfResult(response);
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    setCfResult(undefined);
  }

  setApiLoading?.(false);
};

export const handleSearchExternalId = async (
  externalInstitutionId: string,
  onRedirectToLogin: () => void
): Promise<PartyData | null> => {
  const searchResponse = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_PARTY',
      endpointParams: { externalInstitutionId },
    },
    { method: 'GET' },
    onRedirectToLogin
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    return (searchResponse as AxiosResponse).data;
  }

  return null;
};

export const getECDataByCF = async (
  query: string,
  setApiLoading: Dispatch<SetStateAction<boolean>>,
  setEcData: Dispatch<SetStateAction<PartyData | null>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  setApiLoading(true);
  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
    {
      method: 'GET',
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    setEcData((searchResponse as AxiosResponse).data);
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    setEcData(null);
  }
  setApiLoading(false);
};
