import { render, screen } from '@testing-library/react';
import { PartyData, Product } from '../../../types';
import { PRODUCT_IDS } from '../../utils/constants';
import SearchPartySubtitle from '../SearchPartySubtitle';

const productOf = (id: string) => ({ id, title: 'Prodotto X' }) as Product;
const fallback = 'Sottotitolo di default';

const renderSubtitle = (props: Partial<Parameters<typeof SearchPartySubtitle>[0]>) =>
  render(
    <SearchPartySubtitle
      selected={null}
      product={productOf(PRODUCT_IDS.PAGOPA)}
      institutionType="PA"
      subTitle={fallback}
      {...props}
    />
  );

describe('SearchPartySubtitle', () => {
  test('shows the selected institution message with the product name', () => {
    renderSubtitle({ selected: { id: '1' } as PartyData });
    expect(screen.getByText(/Prosegui con l’adesione a/)).toBeInTheDocument();
    expect(screen.getByText('Prodotto X').tagName).toBe('STRONG');
    expect(screen.queryByText(fallback)).not.toBeInTheDocument();
  });

  test('selected takes precedence over institution type', () => {
    renderSubtitle({ selected: { id: '1' } as PartyData, institutionType: 'SA' });
    expect(screen.getByText(/Prosegui con l’adesione a/)).toBeInTheDocument();
  });

  test('contracting authority (SA)', () => {
    renderSubtitle({ institutionType: 'SA' });
    expect(screen.getByText(/gestori privati di piattaforma e-procurement/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /certificazione da AgID/ })).toHaveAttribute(
      'href',
      'https://www.agid.gov.it/it/piattaforme/procurement/certificazione-componenti-piattaforme'
    );
    expect(screen.getByText(/Prodotto X/)).toBeInTheDocument();
  });

  test('insurance company (AS)', () => {
    renderSubtitle({ institutionType: 'AS' });
    expect(screen.getByText(/società di assicurazione/)).toBeInTheDocument();
    expect(screen.getByText(/Prodotto X/)).toBeInTheDocument();
  });

  test.each([
    ['SCP', PRODUCT_IDS.PAGOPA],
    ['PRV', PRODUCT_IDS.INTEROP],
  ] as const)('InfoCamere subtitle for %s on %s', (institutionType, productId) => {
    renderSubtitle({ institutionType, product: productOf(productId) });
    expect(screen.getByText(/cerca da InfoCamere l’ente/)).toBeInTheDocument();
    expect(screen.queryByText(fallback)).not.toBeInTheDocument();
  });

  test('merchant product', () => {
    renderSubtitle({ institutionType: 'PRV', product: productOf(PRODUCT_IDS.IDPAY_MERCHANT) });
    expect(screen.getByText(/per cercare su InfoCamere l’ente/)).toBeInTheDocument();
  });

  test.each([
    ['PA', PRODUCT_IDS.PAGOPA],
    ['PRV', PRODUCT_IDS.PAGOPA],
    [undefined, undefined],
  ] as const)('falls back to subTitle for %s on %s', (institutionType, productId) => {
    renderSubtitle({
      institutionType,
      product: productId ? productOf(productId) : undefined,
    });
    expect(screen.getByText(fallback)).toBeInTheDocument();
  });

  test('renders a ReactElement fallback', () => {
    renderSubtitle({ subTitle: <span>custom node</span> });
    expect(screen.getByText('custom node')).toBeInTheDocument();
  });
});
