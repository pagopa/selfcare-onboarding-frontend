import { cleanup, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { mockedProducts } from '../../lib/__mocks__/mockApiRequests';
import '../../locale';
import { PRODUCT_IDS } from '../../utils/constants';
import { renderComponentWithProviders } from '../../utils/test-utils';
import StepInstitutionType from '../steps/StepInstitutionType';
;

vi.mock('../../lib/api-utils');

test('Test: Render test', async () => {
  renderComponentWithProviders(
    <StepInstitutionType
      selectedProduct={mockedProducts[0]}
      productId={mockedProducts[0].id}
      institutionType={'PA'}
      fromDashboard={false}
      setOrigin={vi.fn()}
      productAvoidStep={false}
      loading={false}
      setLoading={vi.fn()}
      setRequiredLogin={vi.fn()}
      setOutcome={vi.fn()}
      genericError={{
        title: '',
        description: [],
        img: undefined,
        ImgComponent: undefined,
      }}
    />
  );

  await waitFor(() => {
    expect(screen.getByText(/Seleziona il tipo di ente che rappresenti/)).toBeInTheDocument();
  });
});

test('Test: The correct institution types with the expected descriptions, can be selected based on the product', async () => {
  for (const p of mockedProducts) {
    if (
      p.id === PRODUCT_IDS.SEND ||
      p.id === PRODUCT_IDS.IDPAY ||
      p.id === PRODUCT_IDS.IDPAY_MERCHANT
    ) {
      continue;
    }

    cleanup();
    renderComponentWithProviders(
      <StepInstitutionType
        selectedProduct={p}
        productId={p.id}
        institutionType={'PA'}
        fromDashboard={false}
        setOrigin={vi.fn()}
        productAvoidStep={false}
        loading={false}
        setLoading={vi.fn()}
        setRequiredLogin={vi.fn()}
        setOutcome={vi.fn()}
        genericError={{
          title: '',
          description: [],
          img: undefined,
          ImgComponent: undefined,
        }}
      />,
      p.id
    );

    await waitFor(() => {
      expect(screen.getByText(/Seleziona il tipo di ente che rappresenti/)).toBeInTheDocument();
    });

    if (screen.queryByText('Pubblica Amministrazione')) {
      expect(
        screen.getAllByText('art. 2, comma 2, lettera A del CAD')[0]
      ).toBeInTheDocument();
    }
    if (screen.queryByText('Gestore di servizi pubblici')) {
      expect(
        screen.getAllByText('art. 2, comma 2, lettera B del CAD')[0]
      ).toBeInTheDocument();
    }
    if (screen.queryByText('Società a controllo pubblico')) {
      expect(
        screen.getAllByText('art. 2, comma 2, lettera C del CAD')[0]
      ).toBeInTheDocument();
    }
    if (screen.queryByText('Partner tecnologico')) {
      expect(
        screen.getByText(
          `Ai sensi di IO - Paragrafo 6.1.3 delle \u201CLinee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione\u201D emanate da AgID ai sensi dell\u2019art- 64-bis del CAD`
        )
      ).toBeInTheDocument();
    }
  }
});
