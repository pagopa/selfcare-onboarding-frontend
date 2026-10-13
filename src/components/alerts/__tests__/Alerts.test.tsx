import { render, screen } from '@testing-library/react';
import { Product } from '../../../../types';
import { PDNDBusinessResource } from '../../../model/PDNDBusinessResource';
import { PRODUCT_IDS } from '../../../utils/constants';
import IdPayMerchantAlert from '../IdPayMerchantAlert';
import InteropGspAlert from '../InteropGspAlert';
import SendAlert from '../SendAlert';

const productOf = (id: string) => ({ id }) as Product;

describe('SendAlert', () => {
  test('renders the disclaimer for SEND', () => {
    render(<SendAlert product={productOf(PRODUCT_IDS.SEND)} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'questo link' })).toHaveAttribute(
      'href',
      'https://docs.pagopa.it/area-riservata/area-riservata/come-aderire'
    );
  });

  test.each([productOf(PRODUCT_IDS.INTEROP), null, undefined])(
    'renders nothing for other products',
    (product) => {
      render(<SendAlert product={product} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
  );
});

describe('InteropGspAlert', () => {
  test('renders for Interop and GSP', () => {
    render(<InteropGspAlert product={productOf(PRODUCT_IDS.INTEROP)} institutionType="GSP" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'linee guida AGID' })).toBeInTheDocument();
  });

  test('renders nothing for other institution types or products', () => {
    const { rerender } = render(
      <InteropGspAlert product={productOf(PRODUCT_IDS.INTEROP)} institutionType="PA" />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(<InteropGspAlert product={productOf(PRODUCT_IDS.SEND)} institutionType="GSP" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('IdPayMerchantAlert', () => {
  const merchant = productOf(PRODUCT_IDS.IDPAY_MERCHANT);
  const result = { statusCompanyRI: 'CANCELLATA' } as PDNDBusinessResource;
  const message = /La tua società non può aderire al portale/;

  test('renders the error when the company is disabled', () => {
    render(
      <IdPayMerchantAlert
        product={merchant}
        merchantSearchResult={result}
        disabledStatusCompany={true}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(message);
  });

  test.each([
    ['not a merchant product', productOf(PRODUCT_IDS.INTEROP), result, true],
    ['no search result', merchant, undefined, true],
    ['company not disabled', merchant, result, false],
  ])('renders nothing: %s', (_label, product, merchantSearchResult, disabledStatusCompany) => {
    render(
      <IdPayMerchantAlert
        product={product}
        merchantSearchResult={merchantSearchResult}
        disabledStatusCompany={disabledStatusCompany}
      />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
