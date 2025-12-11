import {
  institutionTypes,
  mockedProducts,
} from '../../lib/__mocks__/mockApiRequests';
import { PRODUCT_IDS } from '../../utils/constants';
import { renderComponentWithProviders } from '../../utils/test-utils';
import StepInstitutionType from '../steps/StepInstitutionType';
import { screen, waitFor } from '@testing-library/react';
import '../../locale';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';

beforeAll(() => {
  i18n.changeLanguage('it');
});

test('Test: Render test', async () => {
  renderComponentWithProviders(
    <StepInstitutionType
      selectedProduct={mockedProducts[0]}
      productId={mockedProducts[0].id}
      institutionType={'PA'}
      fromDashboard={false}
      setOrigin={jest.fn()}
      productAvoidStep={false}
      loading={false}
      setLoading={jest.fn()}
      setRequiredLogin={jest.fn()}
      setOutcome={jest.fn()}
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
  mockedProducts.forEach((p) => {
    institutionTypes.forEach(async (it) => {
      renderComponentWithProviders(
        <StepInstitutionType
          selectedProduct={p}
          productId={p.id}
          institutionType={'PA'}
          fromDashboard={false}
          setOrigin={jest.fn()}
          productAvoidStep={false}
          loading={false}
          setLoading={jest.fn()}
          setRequiredLogin={jest.fn()}
          setOutcome={jest.fn()}
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

      if (
        p.id !== PRODUCT_IDS.SEND ||
        p.id !== PRODUCT_IDS.IDPAY ||
        p.id !== PRODUCT_IDS.IDPAY_MERCHANT
      ) {
        switch (it) {
          case 'PA':
            expect(
              screen.getAllByText('art. 2, comma 2, lettera A del CAD')[0]
            ).toBeInTheDocument();
            break;
          case 'GSP':
            expect(
              screen.getAllByText('art. 2, comma 2, lettera B del CAD')[0]
            ).toBeInTheDocument();
            break;
          case 'SCP':
            expect(
              screen.getAllByText('art. 2, comma 2, lettera C del CAD')[0]
            ).toBeInTheDocument();
            break;
          case 'PT':
            expect(
              screen.getByText(
                'Ai sensi di IO - Paragrafo 6.1.3 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” emanate da AgID ai sensi dell’art- 64-bis del CAD'
              )
            ).toBeInTheDocument();
            break;
        }
      }
    });
  });
});
