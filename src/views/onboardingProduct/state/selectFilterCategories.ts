import { InstitutionType } from '../../../../types';
import {
  FilterCategories,
  FilterCategoriesResponse,
  IpaCategories,
} from '../../../model/FilterCategoriesResponse';
import { PRODUCT_IDS } from '../../../utils/constants';
import {
  isConsolidatedEconomicAccountCompany,
  isGlobalServiceProvider,
  isPublicAdministration,
} from '../../../utils/institutionTypeUtils';

/**
 * Picks the IPA categories used to filter the party search, given the product and institution type.
 * Returns undefined while the categories response is not available.
 */
export const selectFilterCategories = (
  filterCategoriesResponse: FilterCategoriesResponse | null | undefined,
  productId: string,
  institutionType?: InstitutionType
): FilterCategories => {
  if (!filterCategoriesResponse?.product) {
    return undefined;
  }

  const products = filterCategoriesResponse.product;
  const ipa = (productKey: string): IpaCategories => products[productKey]?.ipa ?? {};

  switch (productId) {
    case PRODUCT_IDS.SEND:
      return ipa('prod-pn').PA;

    case PRODUCT_IDS.IDPAY_MERCHANT:
      return products['prod-idpay-merchant']?.merchantDetails;

    case PRODUCT_IDS.INTEROP:
      if (isConsolidatedEconomicAccountCompany(institutionType)) {
        return ipa('prod-interop').SCEC;
      } else if (isPublicAdministration(institutionType)) {
        return ipa('prod-interop').PA;
      } else if (isGlobalServiceProvider(institutionType)) {
        return ipa('default').GSP;
      } else {
        return ipa('default').PA;
      }

    default: {
      const defaultIpa = ipa('default');
      return isGlobalServiceProvider(institutionType) ? defaultIpa.GSP : defaultIpa.PA;
    }
  }
};
