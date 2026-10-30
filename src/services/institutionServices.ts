import { Dispatch, SetStateAction } from 'react';
import { FormikHelpers } from 'formik';
import { getErrorStatus } from '../lib/error-utils';
import { Endpoint, ApiEndpointKey, PartyData, Product, InstitutionType } from '../../types';
import { AooData } from '../model/AooData';
import { UoData } from '../model/UoModel';
import { FilterCategories, MerchantDetails } from '../model/FilterCategoriesResponse';
import { OnboardingFormData } from '../model/OnboardingFormData';
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
import { PDNDBusinessResource } from '../model/PDNDBusinessResource';

// Dispatcher: the search functions receive `endpoint` as a runtime ApiEndpointKey.
// Codegen needs statically-typed method calls, so we map each supported endpoint
// to its typed wrapper here and return the decoded body (throwing on error, like
// extractResponse). The infocamere/visura (PDND) endpoints rely on fields the
// OpenAPI schema under-declares (vatNumber, legalForm, nRea, ...),
// added back via the api-party-registry-proxy_fixPreGen.js patch.
export type InstitutionSearchParams = {
  search?: string;
  categories?: string;
  page?: number;
  limit?: number;
  taxCode?: string;
  rea?: string;
  origin?: string;
  productId?: string;
};

const dispatchInstitutionSearch = (
  endpoint: ApiEndpointKey,
  endpointParams: Record<string, string> | undefined,
  queryParams: InstitutionSearchParams,
  productId?: string
): Promise<unknown> => {
  const ep = endpointParams ?? {};
  switch (endpoint) {
    case 'ONBOARDING_GET_SEARCH_PARTIES':
      return OnboardingApi.searchInstitutionsIpa({
        search: queryParams.search,
        category: queryParams.categories,
        page: (queryParams.page ?? 1) - 1,
        pageSize: queryParams.limit,
      });
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
      // addUser=false passes the tax code as endpointParams.id, addUser=true via queryParams.taxCode
      return OnboardingApi.searchInstitutionIpaByTaxCode(
        ep.id ?? queryParams.taxCode ?? '',
        queryParams.categories
      );
    case 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE':
      return PartyRegistryProxyApi.getInfocamereByTaxCode(ep.id, productId);
    case 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF':
      return PartyRegistryProxyApi.getVisuraByTaxCode(ep.id, productId);
    case 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA':
      return PartyRegistryProxyApi.getVisuraByRea(queryParams.rea ?? '', productId);
    case 'ONBOARDING_GET_INSTITUTIONS':
      return OnboardingApi.getInstitutionsByFilters(queryParams as { productId: string });
    default:
      return Promise.reject(new Error(`Unsupported institution search endpoint: ${endpoint}`));
  }
};

// With addUser the endpoints return a list: keep the first element (or the body if it is not one).
const pickSearchResult = <T>(data: unknown, addUser: boolean): T =>
  (addUser ? ((data as Array<T> | undefined)?.[0] ?? data) : data) as T;

const validateIdpayMerchantInstitution = (
  response: PartyData,
  disabledStatusCompany: boolean | undefined,
  filterCategories: FilterCategories,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  setMerchantSearchResult: ((value?: PDNDBusinessResource) => void) | undefined
) => {
  setMerchantSearchResult?.(response);

  const merchantDetails: MerchantDetails | undefined =
    (filterCategories as MerchantDetails | undefined) ||
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
  formik: Pick<FormikHelpers<OnboardingFormData>, 'setFieldValue'>
) => {
  try {
    const searchResponse = await PartyRegistryProxyApi.getUoInfo(recipientCode);
    void formik.setFieldValue('taxCodeInvoicing', searchResponse.codiceFiscaleSfe);
    setDisableTaxCodeInvoicing(true);
  } catch (_error) {
    setDisableTaxCodeInvoicing(false);
  }
};

export const fetchInstitutionsByName = async <T, D>(
  query: string,
  endpoint: Endpoint,
  setOptions: Dispatch<SetStateAction<ReadonlyArray<T>>>,
  transformFn: (data: D) => ReadonlyArray<T>,
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
    setOptions(transformFn(data as D));
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setOptions([]);
    }
  }
};

export const fetchInstitutionByTaxCode = async (
  addUser: boolean,
  endpoint: ApiEndpointKey,
  params: InstitutionSearchParams,
  query: string,
  productId: string | undefined,
  institutionType: string | undefined,
  filterCategories: FilterCategories,
  disabledStatusCompany: boolean | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  setMerchantSearchResult: ((value?: PDNDBusinessResource) => void) | undefined,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  const updatedParams = {
    ...params,
    taxCode: addUser ? query : undefined,
    categories: shouldSkipCategoriesFilter(institutionType as InstitutionType, productId)
      ? undefined
      : (filterCategories as string),
  };

  try {
    const response = (await dispatchInstitutionSearch(
      endpoint,
      addUser ? undefined : { id: query },
      updatedParams,
      productId
    )) as PartyData;
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
  params: InstitutionSearchParams,
  query: string,
  setApiLoading: Dispatch<SetStateAction<boolean>> | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  product: Product | undefined,
  filterCategories: FilterCategories,
  disabledStatusCompany: boolean | undefined,
  setMerchantSearchResult: ((value?: PDNDBusinessResource) => void) | undefined
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
    const response = (await dispatchInstitutionSearch(
      endpoint,
      undefined,
      updatedParams,
      product?.id
    )) as PartyData;
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

const buildSubunitSearchParams = (
  filterCategories: string | undefined,
  productId: string | undefined
): InstitutionSearchParams => {
  if (productId === undefined) {
    return { origin: 'IPA', categories: filterCategories };
  }
  return productId === PRODUCT_IDS.SEND ? { categories: filterCategories, origin: 'IPA' } : {};
};

export const handleSearchByAooCode = async (
  query: string,
  setAooResult: Dispatch<SetStateAction<AooData | undefined>>,
  setAooResultHistory: (t: AooData | undefined) => void,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setApiLoading?: Dispatch<SetStateAction<boolean>>,
  addUser: boolean = false,
  endpoint: ApiEndpointKey = 'ONBOARDING_GET_AOO_CODE_INFO',
  params: InstitutionSearchParams = {},
  filterCategories?: string,
  productId?: string
) => {
  setApiLoading?.(true);

  const updatedParams = addUser ? params : buildSubunitSearchParams(filterCategories, productId);

  try {
    const data = await dispatchInstitutionSearch(
      endpoint,
      addUser ? undefined : { codiceUniAoo: query },
      updatedParams
    );
    const response = pickSearchResult<AooData>(data, addUser);
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
  params: InstitutionSearchParams = {},
  filterCategories?: string,
  productId?: string
) => {
  setApiLoading?.(true);

  const updatedParams = addUser ? params : buildSubunitSearchParams(filterCategories, productId);

  try {
    const data = await dispatchInstitutionSearch(
      endpoint,
      addUser ? undefined : { codiceUniUo: query },
      updatedParams
    );
    const response = pickSearchResult<UoData>(data, addUser);
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
  params: InstitutionSearchParams,
  query: string,
  institutionType: InstitutionType | undefined,
  setApiLoading: Dispatch<SetStateAction<boolean>> | undefined,
  setCfResult: Dispatch<SetStateAction<PartyData | undefined>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  setApiLoading?.(true);

  const endpointParams: Record<string, string> | undefined = addUser
    ? undefined
    : isContractingAuthority(institutionType) || isInsuranceCompany(institutionType)
      ? { taxId: query }
      : { code: query };

  try {
    const data = await dispatchInstitutionSearch(endpoint, endpointParams, addUser ? params : {});
    const response = pickSearchResult<PartyData>(data, addUser);
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
