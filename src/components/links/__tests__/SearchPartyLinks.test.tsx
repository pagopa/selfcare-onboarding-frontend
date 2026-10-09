import { fireEvent, render, screen } from '@testing-library/react';
import { Product } from '../../../../types';
import { PRODUCT_IDS } from '../../../utils/constants';
import SearchPartyLinks from '../SearchPartyLinks';

const productOf = (id: string) => ({ id }) as Product;

describe('SearchPartyLinks', () => {
  test('shows the IPA accreditation link for PA', () => {
    render(
      <SearchPartyLinks
        institutionType="PA"
        product={productOf(PRODUCT_IDS.PAGOPA)}
        onForwardAction={vi.fn()}
      />
    );
    expect(screen.getByRole('link', { name: 'In questa pagina' })).toHaveAttribute(
      'href',
      'https://indicepa.gov.it/ipa-portale/servizi-enti/accreditamento-ente'
    );
  });

  test('shows the manual-entry link for GSP and triggers forward on click', () => {
    const onForwardAction = vi.fn();
    render(
      <SearchPartyLinks
        institutionType="GSP"
        product={productOf(PRODUCT_IDS.PAGOPA)}
        onForwardAction={onForwardAction}
      />
    );
    fireEvent.click(screen.getByText('Inserisci manualmente i dati del tuo ente.'));
    expect(onForwardAction).toHaveBeenCalledTimes(1);
  });

  test('GSP on a product requiring IPA falls back to the IPA link', () => {
    render(
      <SearchPartyLinks
        institutionType="GSP"
        product={productOf(PRODUCT_IDS.INTEROP)}
        onForwardAction={vi.fn()}
      />
    );
    expect(screen.getByRole('link', { name: 'In questa pagina' })).toBeInTheDocument();
  });

  test.each(['SA', 'AS', 'SCP', 'PRV', 'PRV_PF'] as const)(
    'renders nothing for institution type %s',
    (institutionType) => {
      const { container } = render(
        <SearchPartyLinks
          institutionType={institutionType}
          product={productOf(PRODUCT_IDS.PAGOPA)}
          onForwardAction={vi.fn()}
        />
      );
      expect(container).toBeEmptyDOMElement();
    }
  );
});
