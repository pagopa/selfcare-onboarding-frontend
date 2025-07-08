import { institutionTypes, mockedProducts } from '../../lib/__mocks__/mockApiRequests';
import { institutionType4Product, PRODUCT_IDS } from '../../utils/constants';
import { renderComponentWithProviders } from '../../utils/test-utils';
import StepInstitutionType from '../steps/StepInstitutionType';
import { screen } from '@testing-library/react';
import '../../locale';
import React from 'react';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';

beforeAll(() => {
  i18n.changeLanguage('it');
});

test('Test: Render test', async () => {
  renderComponentWithProviders(
    <StepInstitutionType
      selectedProduct={mockedProducts[0]}
      institutionType={'PA'}
      fromDashboard={false}
    />
  );
});

test('Test: The correct institution types with the expected descriptions, can be selected based on the product', async () => {
  institutionTypes.forEach((it) => {
    mockedProducts.forEach((p) => {
      renderComponentWithProviders(
        <StepInstitutionType selectedProduct={p} institutionType={it} fromDashboard={false} />
      );

      screen.getAllByText(/Seleziona il tipo di ente che rappresenti/);

      const institutionTypesForProduct = institutionType4Product(p.id);
      const institutionTypeValues = institutionTypesForProduct.map((it) => it.value);

      switch (p.id) {
        case PRODUCT_IDS.PAGOPA:
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP', 'PT', 'PSP', 'PRV', 'GPU']);
          break;
        case PRODUCT_IDS.IO:
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP', 'PT']);
          break;
        case PRODUCT_IDS.IO_SIGN:
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP']);
          break;
        case PRODUCT_IDS.IDPAY:
        case PRODUCT_IDS.SEND:
          expect(institutionTypeValues).toStrictEqual(['PA']);
          break;
        case 'prod-idpay-merchant':
          expect(institutionTypeValues).toStrictEqual(['PRV']);
          break;
        case PRODUCT_IDS.INTEROP:
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP', 'SCP', 'SA', 'AS', 'PRV']);
          break;
        default:
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP', 'SCP']);
          break;
      }

      if (p.id !== PRODUCT_IDS.SEND && p.id !== PRODUCT_IDS.IDPAY) {
        switch (it) {
          case 'PA':
            screen.getAllByText('art. 2, comma 2, lettera A del CAD');
            break;
          case 'GSP':
            screen.getAllByText('art. 2, comma 2, lettera B del CAD');
            break;
          case 'SCP':
            screen.getAllByText('art. 2, comma 2, lettera C del CAD');
            break;
          case 'PT':
            screen.getAllByText(
              'Ai sensi di IO - Paragrafo 6.1.3 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” emanate da AgID ai sensi dell’art- 64-bis del CAD'
            );
            break;
        }
      }
    });
  });
});
