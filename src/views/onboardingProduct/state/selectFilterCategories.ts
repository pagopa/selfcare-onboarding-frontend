import { InstitutionType } from '../../../../types';
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
  filterCategoriesResponse: any,
  productId: string,
  institutionType?: InstitutionType
) => {
  if (!filterCategoriesResponse?.product) {
    return undefined;
  }

  const products = filterCategoriesResponse.product;

  switch (productId) {
    case PRODUCT_IDS.SEND:
      return products['prod-pn']?.ipa.PA;

    case PRODUCT_IDS.IDPAY_MERCHANT:
      return products['prod-idpay-merchant']?.merchantDetails;

    case PRODUCT_IDS.INTEROP:
      if (isConsolidatedEconomicAccountCompany(institutionType)) {
        return products['prod-interop']?.ipa.SCEC;
      } else if (isPublicAdministration(institutionType)) {
        return products['prod-interop']?.ipa.PA;
      } else if (isGlobalServiceProvider(institutionType)) {
        return products.default?.ipa.GSP;
      } else {
        return products.default?.ipa.PA;
      }

    default: {
      const defaultIpa = products.default?.ipa;
      return isGlobalServiceProvider(institutionType) ? defaultIpa?.GSP : defaultIpa?.PA;
    }
  }
};
