import { institutionTypes, mockedProducts } from '../../lib/__mocks__/mockApiRequests';
import { institutionType4Product } from '../../utils/constants';
import { renderComponentWithProviders } from '../../utils/test-utils';
import StepInstitutionType from '../steps/StepInstitutionType';
import { screen } from '@testing-library/react';
import '../../locale';
import React from 'react';

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
        case 'prod-pagopa':
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP', 'PT', 'PSP', 'PRV']);
          break;
        case 'prod-io':
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP', 'PT']);
          break;
        case 'prod-io-sign':
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP']);
          break;
        case 'prod-idpay':
        case 'prod-pn':
          expect(institutionTypeValues).toStrictEqual(['PA']);
          break;
        case 'prod-interop':
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP', 'SCP', 'SA', 'AS', 'PRV']);
          break;
        default:
          expect(institutionTypeValues).toStrictEqual(['PA', 'GSP', 'SCP']);
          break;
      }

      if (p.id !== 'prod-pn' && p.id !== 'prod-idpay') {
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
