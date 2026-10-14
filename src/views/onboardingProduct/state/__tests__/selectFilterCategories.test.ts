import { describe, expect, test } from 'vitest';
import { InstitutionType } from '../../../../../types';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { selectFilterCategories } from '../selectFilterCategories';

const response = {
  product: {
    default: { ipa: { PA: 'default-PA', GSP: 'default-GSP' } },
    'prod-pn': { ipa: { PA: 'pn-PA' } },
    'prod-interop': { ipa: { PA: 'interop-PA', SCEC: 'interop-SCEC' } },
    'prod-idpay-merchant': { merchantDetails: 'merchant-details' },
  },
};

describe('selectFilterCategories', () => {
  test.each<[string, InstitutionType | undefined, string]>([
    [PRODUCT_IDS.SEND, 'PA', 'pn-PA'],
    [PRODUCT_IDS.SEND, 'GSP', 'pn-PA'],
    [PRODUCT_IDS.IDPAY_MERCHANT, 'PRV', 'merchant-details'],
    [PRODUCT_IDS.INTEROP, 'SCEC', 'interop-SCEC'],
    [PRODUCT_IDS.INTEROP, 'PA', 'interop-PA'],
    [PRODUCT_IDS.INTEROP, 'GSP', 'default-GSP'],
    [PRODUCT_IDS.INTEROP, 'SCP', 'default-PA'],
    [PRODUCT_IDS.INTEROP, undefined, 'default-PA'],
    [PRODUCT_IDS.IO, 'GSP', 'default-GSP'],
    [PRODUCT_IDS.IO, 'PA', 'default-PA'],
    [PRODUCT_IDS.PAGOPA, 'GSP', 'default-GSP'],
    [PRODUCT_IDS.PAGOPA, 'SA', 'default-PA'],
    [PRODUCT_IDS.PAGOPA, undefined, 'default-PA'],
  ])('product %s with institution type %s → %s', (productId, institutionType, expected) => {
    expect(selectFilterCategories(response, productId, institutionType)).toBe(expected);
  });

  test.each([undefined, null, {}])('returns undefined when the response is %s', (empty) => {
    expect(selectFilterCategories(empty, PRODUCT_IDS.IO, 'PA')).toBeUndefined();
  });

  test.each([PRODUCT_IDS.SEND, PRODUCT_IDS.IDPAY_MERCHANT, PRODUCT_IDS.INTEROP, PRODUCT_IDS.IO])(
    'returns undefined when the product section for %s is missing',
    (productId) => {
      expect(
        selectFilterCategories({ product: {} }, productId, 'SCEC' as InstitutionType)
      ).toBeUndefined();
    }
  );
});
