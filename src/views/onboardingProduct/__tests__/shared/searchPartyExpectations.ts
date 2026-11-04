import { InstitutionType } from '../../../../../types';
import { mockedCategories } from '../../../../lib/__mocks__/mockApiRequests';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { ENV } from '../../../../utils/env';
import {
  isConsolidatedEconomicAccountCompany,
  isContractingAuthority,
  isGlobalServiceProvider,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isInteropProduct,
  isPrivateInstitution,
  isPublicAdministration,
  isPublicServiceCompany,
} from '../../../../utils/institutionTypeUtils';
import { pickBySearch } from '../../../../utils/test/billingDataResolvers-test';
import type { Search } from '../../../../utils/test/test-utils';

export const filterByCategory4Test = (institutionType?: string, productId?: string) => {
  switch (productId) {
    case PRODUCT_IDS.SEND:
      return mockedCategories.product['prod-pn']?.ipa.PA;

    case PRODUCT_IDS.IDPAY_MERCHANT:
      return mockedCategories.product['prod-idpay-merchant']?.merchantDetails;

    case PRODUCT_IDS.INTEROP:
      if (isConsolidatedEconomicAccountCompany(institutionType as InstitutionType)) {
        return mockedCategories.product['prod-interop']?.ipa.SCEC;
      } else if (isPublicAdministration(institutionType as InstitutionType)) {
        return mockedCategories.product['prod-interop']?.ipa.PA;
      } else if (isGlobalServiceProvider(institutionType as InstitutionType)) {
        return mockedCategories.product.default?.ipa.GSP;
      } else {
        return mockedCategories.product.default?.ipa.PA;
      }
    default:
      const defaultIpa = mockedCategories.product.default?.ipa;
      return isGlobalServiceProvider(institutionType as InstitutionType)
        ? defaultIpa?.GSP
        : defaultIpa?.PA;
  }
};

/** Codes typed by the user in the search party step, one per code-based search type. */
export type SearchPartyCodes = {
  subUnitCode?: string;
  taxCode?: string;
  ivassCode?: string;
  reaCode?: string;
  personalTaxCode?: string;
};

const usesAnacOrIvassSearch = (institutionType: string): boolean =>
  isContractingAuthority(institutionType as InstitutionType) ||
  isInsuranceCompany(institutionType as InstitutionType);

export const expectedBusinessNameSearchEndpoint = (institutionType: string): string => {
  if (isContractingAuthority(institutionType as InstitutionType)) {
    return 'ONBOARDING_GET_SA_PARTIES_NAME';
  }
  return isInsuranceCompany(institutionType as InstitutionType)
    ? 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME'
    : 'ONBOARDING_GET_SEARCH_PARTIES';
};

export const expectedBusinessNameSearchParams = (institutionType: string, productId: string) =>
  usesAnacOrIvassSearch(institutionType)
    ? { limit: undefined, categories: undefined, page: 1, search: 'XXX' }
    : {
        search: 'XXX',
        category: filterByCategory4Test(institutionType.toUpperCase(), productId),
        page: 0,
        pageSize: ENV.MAX_INSTITUTIONS_FETCH,
      };

/** Value typed in the search input for the given code-based search type. */
export const searchCodeValue = (
  typeOfSearch: Search,
  codes: SearchPartyCodes
): string | undefined =>
  pickBySearch(
    typeOfSearch,
    {
      taxCode: () => codes.taxCode,
      ivassCode: () => codes.ivassCode,
      reaCode: () => codes.reaCode,
      personalTaxCode: () => codes.personalTaxCode,
    },
    () => codes.subUnitCode
  );

const taxCodeSearchEndpoint = (institutionType: string, productId: string): string => {
  const type = institutionType as InstitutionType;
  if (isContractingAuthority(type)) {
    return 'ONBOARDING_GET_SA_PARTY_FROM_FC';
  }
  if (
    (isPrivateInstitution(type) && !isIdpayMerchantProduct(productId)) ||
    (isInteropProduct(productId) && isPublicServiceCompany(type))
  ) {
    return 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE';
  }
  return isIdpayMerchantProduct(productId)
    ? 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF'
    : 'ONBOARDING_GET_PARTY_FROM_CF';
};

export const expectedCodeSearchEndpoint = (
  typeOfSearch: Search,
  institutionType: string,
  productId: string
): string =>
  pickBySearch(
    typeOfSearch,
    {
      taxCode: () => taxCodeSearchEndpoint(institutionType, productId),
      personalTaxCode: () => taxCodeSearchEndpoint(institutionType, productId),
      aooCode: () => 'ONBOARDING_GET_AOO_CODE_INFO',
      uoCode: () => 'ONBOARDING_GET_UO_CODE_INFO',
      reaCode: () => 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA',
    },
    () => 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE'
  );

type EndpointParams = Record<string, string | undefined> | undefined;

const taxIdEndpointParams = (institutionType: string, value?: string): EndpointParams =>
  isContractingAuthority(institutionType as InstitutionType) ? { taxId: value } : { id: value };

export const expectedCodeSearchEndpointParams = (
  typeOfSearch: Search,
  institutionType: string,
  codes: SearchPartyCodes
): EndpointParams =>
  pickBySearch<EndpointParams>(
    typeOfSearch,
    {
      taxCode: () => taxIdEndpointParams(institutionType, codes.taxCode),
      personalTaxCode: () => taxIdEndpointParams(institutionType, codes.personalTaxCode),
      aooCode: () => ({ codiceUniAoo: codes.subUnitCode }),
      uoCode: () => ({ codiceUniUo: codes.subUnitCode }),
      reaCode: () => undefined,
    },
    () => ({ taxId: codes.ivassCode })
  );

// The by-code / by-taxId codegen endpoints (AOO/UO/infocamere/visura-by-cf,
// stations and insurance by taxId) are path-only: the query params the
// legacy flow used to send (origin, categories, ...) are not part of their
// OpenAPI schema, so the migrated dispatcher no longer sends them. Only
// PARTY_FROM_CF (searchInstitutionIpaByTaxCode) and visura-by-REA still carry query
// params. PARTY_FROM_CF now hits the IPA-only BFF endpoint, whose OpenAPI schema
// declares a single `category` query param: origin and the legacy `categories`
// spelling are gone.
export const expectedCodeSearchQueryParams = (
  endpoint: string,
  institutionType: string,
  productId: string,
  reaCode?: string
) => {
  if (endpoint === 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA') {
    return { rea: reaCode };
  }
  if (endpoint !== 'ONBOARDING_GET_PARTY_FROM_CF') {
    return undefined;
  }
  const isRegistryParty =
    isPublicServiceCompany(institutionType as InstitutionType) ||
    isPrivateInstitution(institutionType as InstitutionType);
  return {
    category: isRegistryParty ? undefined : filterByCategory4Test(institutionType, productId),
  };
};

/** Results of tax code and REA searches are rendered lower case. */
export const searchResultLabel = (typeOfSearch: Search, partyName: string): string =>
  typeOfSearch === 'taxCode' || typeOfSearch === 'reaCode' || typeOfSearch === 'personalTaxCode'
    ? partyName.toLocaleLowerCase()
    : partyName;
