import { Dispatch, SetStateAction } from 'react';
import { getErrorStatus } from '../lib/error-utils';
import { Endpoint, ApiEndpointKey, PartyData, Product, InstitutionType } from '../../types';
import { AooData } from '../model/AooData';
import { UoData } from '../model/UoModel';
import { PRODUCT_IDS } from '../utils/constants';
import {
  isContractingAuthority,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  /* isInteropOrIdpayMerchantProduct,
  isInteropProduct,
  isPublicServiceCompany, */
  shouldSkipCategoriesFilter,
} from '../utils/institutionTypeUtils';
import config from '../utils/config.json';
import { PartyRegistryProxyApi } from '../api/PartyRegistryProxyApiClient';
import { OnboardingApi } from '../api/OnboardingApiClient';

// Dispatcher: the search functions receive `endpoint` as a runtime ApiEndpointKey.
// Codegen needs statically-typed method calls, so we map each supported endpoint
// to its typed wrapper here and return the decoded body (throwing on error, like
// extractResponse). The infocamere/visura (PDND) endpoints rely on fields the
// OpenAPI schema under-declares (vatNumber, legalForm, nRea, ...),
// added back via the api-party-registry-proxy_fixPreGen.js patch.
const dispatchInstitutionSearch = (
  endpoint: ApiEndpointKey,
  endpointParams: Record<string, any> | undefined,
  queryParams: Record<string, any>
): Promise<any> => {
  const ep = endpointParams ?? {};
  switch (endpoint) {
    case 'ONBOARDING_GET_SEARCH_PARTIES':
      return PartyRegistryProxyApi.searchInstitutions(queryParams);
    case 'ONBOARDING_GET_SA_PARTIES_NAME':
      return PartyRegistryProxyApi.searchSaParties(queryParams);
    case 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME':
      return PartyRegistryProxyApi.searchInsuranceCompanies(queryParams);
    case 'ONBOARDING_GET_AOO_CODE_INFO':
      return PartyRegistryProxyApi.getAooInfo(ep.codiceUniAoo, queryParams.categories);
    case 'ONBOARDING_GET_UO_CODE_INFO':
      return PartyRegistryProxyApi.getUoInfo(ep.codiceUniUo);
    case 'ONBOARDING_GET_SA_PARTY_FROM_FC':
      return PartyRegistryProxyApi.getSaPartyByTaxId(ep.taxId);
    case 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE':
      return PartyRegistryProxyApi.getInsuranceByTaxId(ep.taxId);
    case 'ONBOARDING_GET_PARTY_FROM_CF':
      return PartyRegistryProxyApi.findInstitution(ep.id, queryParams.origin, queryParams.categories);
    case 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE':
      return PartyRegistryProxyApi.getInfocamereByTaxCode(ep.id);
    case 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF':
      return PartyRegistryProxyApi.getVisuraByTaxCode(ep.id);
    case 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA':
      return PartyRegistryProxyApi.getVisuraByRea(queryParams.rea);
    case 'ONBOARDING_GET_INSTITUTIONS':
      return OnboardingApi.getInstitutionsByFilters(queryParams as { productId: string });
    default:
      return Promise.reject(new Error(`Unsupported institution search endpoint: ${endpoint}`));
  }
};

const validateIdpayMerchantInstitution = (
  response: PartyData,
  disabledStatusCompany: boolean | undefined,
  filterCategories: string | { allowedInstitutions: string } | undefined,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  setMerchantSearchResult: Dispatch<SetStateAction<PartyData | undefined>> | undefined
) => {
  setMerchantSearchResult?.(response);

  const merchantDetails =
    (filterCategories as { allowedInstitutions: string }) ||
    config.product['prod-idpay-merchant']?.merchantDetails;

  const allowedInstitutionsStr =
    merchantDetails?.allowedInstitutions ||
    config.product['prod-idpay-merchant']?.merchantDetails?.allowedInstitution ||
    '';

  const allowedInstitutions = allowedInstitutionsStr
    ? allowedInstitutionsStr.split(',').filter(Boolean)
    : [];

  // The ATECO whitelist that used to gate the merchant onboarding has been removed:
  // the only blocking condition left is the company status. `allowedInstitutions` is
  // kept because it is configured separately, but it no longer changes the outcome.
  if (disabledStatusCompany) {
    setDisabled(true);
  } else if (
    response?.businessTaxId &&
    allowedInstitutions.length > 0 &&
    allowedInstitutions.includes(response.businessTaxId)
  ) {
    setDisabled(false);
  } else {
    setDisabled(false);
  }
};

export const handleSearchByTaxCode = async (
  query: string,
  filterCategories: string | undefined,
  setRetrievedIstat: Dispatch<SetStateAction<string | undefined>>,
  setOriginId4Premium: Dispatch<SetStateAction<string | undefined>>
) => {
  try {
    const searchResponse = await PartyRegistryProxyApi.findInstitution(
      query,
      'IPA',
      filterCategories
    );

    setRetrievedIstat(searchResponse.istatCode);
    setOriginId4Premium(searchResponse.originId);
  } catch (error) {
    console.error(error);
  }
};

export const getUoInfoFromRecipientCode = async (
  recipientCode: string,
  setDisableTaxCodeInvoicing: Dispatch<SetStateAction<boolean>>,
  formik: any
) => {
  try {
    const searchResponse = await PartyRegistryProxyApi.getUoInfo(recipientCode);
    formik.setFieldValue('taxCodeInvoicing', searchResponse.codiceFiscaleSfe);
    setDisableTaxCodeInvoicing(true);
  } catch (_error) {
    setDisableTaxCodeInvoicing(false);
  }
};

export const fetchInstitutionsByName = async (
  query: string,
  endpoint: Endpoint,
  setOptions: Dispatch<SetStateAction<Array<any>>>,
  transformFn: any,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  limit?: number,
  categories?: string
) => {
  try {
    const data = await dispatchInstitutionSearch(endpoint.endpoint, endpoint.endpointParams, {
      limit,
      page: 1,
      search: query,
      categories,
    });
    setOptions(transformFn(data));
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setOptions([]);
    }
  }
};

export const fetchInstitutionByTaxCode = async (
  addUser: boolean,
  endpoint: ApiEndpointKey,
  params: any,
  query: string,
  productId: string | undefined,
  institutionType: string | undefined,
  filterCategories: { allowedInstitutions: string } | string | undefined,
  disabledStatusCompany: boolean | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  setMerchantSearchResult: Dispatch<SetStateAction<PartyData | undefined>> | undefined,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const updatedParams = {
    ...params,
    taxCode: addUser ? query : undefined,
    categories: shouldSkipCategoriesFilter(institutionType as InstitutionType, productId)
      ? undefined
      : (filterCategories as string),
  };

  try {
    const response = await dispatchInstitutionSearch(
      endpoint,
      addUser ? undefined : { id: query },
      updatedParams
    );
    setCfResult(response);

    if (addUser || isIdpayMerchantProduct(productId)) {
      validateIdpayMerchantInstitution(
        response,
        disabledStatusCompany,
        filterCategories,
        setDisabled,
        setMerchantSearchResult
      );
    }
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setCfResult(undefined);

      if (isIdpayMerchantProduct(productId)) {
        setMerchantSearchResult?.(undefined);
      }
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
  setDisabled: Dispatch<SetStateAction<boolean>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  product: Product | undefined,
  filterCategories: string | { allowedInstitutions: string } | undefined,
  disabledStatusCompany: boolean | undefined,
  setMerchantSearchResult: Dispatch<SetStateAction<PartyData | undefined>> | undefined
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  setApiLoading?.(true);

  const reaPattern = /^[A-Za-z]{2}-\d{6}$/;
  if (!reaPattern.test(query)) {
    setApiLoading?.(false);
    setCfResult(undefined);
    return;
  }

  const updatedParams = addUser
    ? params
    : {
        rea: query,
      };

  try {
    const response = await dispatchInstitutionSearch(endpoint, undefined, updatedParams);
    setCfResult(response);

    if (isIdpayMerchantProduct(product?.id)) {
      validateIdpayMerchantInstitution(
        response,
        disabledStatusCompany,
        filterCategories,
        setDisabled,
        setMerchantSearchResult
      );
    }
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setCfResult(undefined);
      if (isIdpayMerchantProduct(product?.id)) {
        setMerchantSearchResult?.(undefined);
      }
    }
  }

  setApiLoading?.(false);
};

export const handleSearchByAooCode = async (
  query: string,
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>,
  setAooResultHistory: (t: AooData | undefined) => void,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
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

  try {
    const data = await dispatchInstitutionSearch(
      endpoint,
      addUser ? undefined : { codiceUniAoo: query },
      updatedParams
    );
    const response = addUser ? (data?.[0] ?? data) : data;
    setAooResult(response);
    setAooResultHistory(response);
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setAooResult(undefined);
    }
  }

  setApiLoading?.(false);
};

export const handleSearchByUoCode = async (
  query: string,
  setUoResult: Dispatch<SetStateAction<UoData | undefined>>,
  setUoResultHistory: (t: UoData | undefined) => void,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
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

  try {
    const data = await dispatchInstitutionSearch(
      endpoint,
      addUser ? undefined : { codiceUniUo: query },
      updatedParams
    );
    const response = addUser ? (data?.[0] ?? data) : data;
    setUoResult(response);
    setUoResultHistory(response);
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setUoResult(undefined);
    }
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
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  setApiLoading?.(true);

  const endpointParams = addUser
    ? undefined
    : isContractingAuthority(institutionType) || isInsuranceCompany(institutionType)
      ? { taxId: query }
      : { code: query };

  try {
    const data = await dispatchInstitutionSearch(endpoint, endpointParams, addUser ? params : {});
    const response = addUser ? (data?.[0] ?? data) : data;
    setCfResult(response);
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setCfResult(undefined);
    }
  }

  setApiLoading?.(false);
};

export const handleSearchExternalId = async (
  externalInstitutionId: string
): Promise<PartyData | null> => {
  try {
    const data = await PartyRegistryProxyApi.findInstitution(externalInstitutionId);
    return data as PartyData;
  } catch {
    return null;
  }
};

export const getECDataByCF = async (
  query: string,
  setApiLoading: Dispatch<SetStateAction<boolean>>,
  setEcData: Dispatch<SetStateAction<PartyData | null>>
) => {
  setApiLoading(true);
  try {
    const data = await PartyRegistryProxyApi.findInstitution(query);
    setEcData(data as PartyData);
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setEcData(null);
    }
    // Preserve legacy: other errors don't change state
  } finally {
    setApiLoading(false);
  }
};
