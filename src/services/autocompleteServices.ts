import { AxiosError, AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { ApiEndpointKey, Endpoint, InstitutionType, PartyData, Product } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { PRODUCT_IDS } from '../utils/constants';
import { AooData } from '../model/AooData';
import { UoData } from '../model/UoModel';

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

export const fetchInstitutionByTaxCode = async (
  addUser: boolean,
  endpoint: ApiEndpointKey,
  params: any,
  query: string,
  productId: string | undefined,
  institutionType: string | undefined,
  filterCategories: string | undefined,
  disabledStatusCompany: boolean | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  setMerchantSearchResult: Dispatch<SetStateAction<PartyData | undefined>> | undefined,
  setIsPresentInAtecoWhiteList: Dispatch<SetStateAction<boolean>> | undefined,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const updatedParams = {
    ...params,
    taxCode: addUser ? query : undefined,
    categories:
      (productId === 'prod-interop' || productId === 'prod-idpay-merchant') &&
      (institutionType === 'SCP' || institutionType === 'PRV')
        ? undefined
        : filterCategories,
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

  if (outcome === 'success') {
    const response = (searchResponse as AxiosResponse).data;
    setCfResult(response);

    // Logica specifica per IDPAY_MERCHANT
    if (productId === 'prod-idpay-merchant') {
      setMerchantSearchResult?.(response);

      if (disabledStatusCompany) {
        setDisabled(true);
      } else if (filterCategories && response?.atecoCodes && Array.isArray(response.atecoCodes)) {
        // Validazione whitelist ATECO
        const whitelistCodes = filterCategories.split(',');
        const hasMatchingCode = response.atecoCodes.some((code: string) =>
          whitelistCodes.includes(code)
        );
        setIsPresentInAtecoWhiteList?.(hasMatchingCode);
        setDisabled(!hasMatchingCode);
      } else {
        setIsPresentInAtecoWhiteList?.(false);
        setDisabled(true);
      }
    }
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    setCfResult(undefined);

    if (productId === 'prod-idpay-merchant') {
      setIsPresentInAtecoWhiteList?.(false);
      setMerchantSearchResult?.(undefined);
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
  setIsPresentInAtecoWhiteList: Dispatch<SetStateAction<boolean>> | undefined,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  product: Product | undefined,
  filterCategories: string | undefined,
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

    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      setMerchantSearchResult?.(response);
      if (disabledStatusCompany) {
        setDisabled(true);
      } else if (filterCategories && response.atecoCodes && Array.isArray(response.atecoCodes)) {
        const whitelistCodes = filterCategories.split(',');
        const hasMatchingCode = response.atecoCodes.some((code: string) =>
          whitelistCodes.includes(code)
        );
        setIsPresentInAtecoWhiteList?.(hasMatchingCode);
        setDisabled(!hasMatchingCode);
      } else {
        setIsPresentInAtecoWhiteList?.(false);
        setDisabled(true);
      }
    }
  } else if ((searchResponse as AxiosError).response?.status === 404) {
    setCfResult(undefined);
    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      setMerchantSearchResult?.(undefined);
      setIsPresentInAtecoWhiteList?.(false);
    }
  }

  setApiLoading?.(false);
};

export const handleSearchByAooCode = async (
  addUser: boolean,
  endpoint: ApiEndpointKey,
  params: any,
  query: string,
  setApiLoading: Dispatch<SetStateAction<boolean>> | undefined,
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>,
  setAooResultHistory: (t: AooData | undefined) => void,
  filterCategories: string | undefined,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  setApiLoading?.(true);

  const updatedParams = addUser
    ? params
    : {
        origin: 'IPA',
        categories: filterCategories,
      };

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
  addUser: boolean,
  endpoint: ApiEndpointKey,
  params: any,
  query: string,
  setApiLoading: Dispatch<SetStateAction<boolean>> | undefined,
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>,
  setUoResultHistory: (t: UoData | undefined) => void,
  filterCategories: string | undefined,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  setApiLoading?.(true);

  const updatedParams = addUser
    ? params
    : {
        origin: 'IPA',
        categories: filterCategories,
      };

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
        : institutionType === 'SA' || institutionType === 'AS'
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
