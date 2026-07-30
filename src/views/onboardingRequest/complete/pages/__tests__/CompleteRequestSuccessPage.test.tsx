import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PRODUCT_IDS } from '../../../../../utils/constants';
import { renderComponentWithProviders } from '../../../../../utils/test/test-utils';
import CompleteRequestSuccessPage from '../CompleteRequestSuccessPage';

const renderPage = (productId: string) =>
  renderComponentWithProviders(
    <CompleteRequestSuccessPage addUserFlow={false} translationKeyValue="product" />,
    productId
  );

it('test CompleteRequestSuccessPage shows the ced wording for prod-ced', () => {
  renderPage(PRODUCT_IDS.CED);

  expect(screen.getByText('Accordo caricato correttamente')).toBeInTheDocument();
  expect(document.body.textContent).toContain('L’operazione potrebbe richiedere alcuni giorni');
});

it('test CompleteRequestSuccessPage shows the standard wording for the other products', () => {
  renderPage(PRODUCT_IDS.PAGOPA);

  expect(screen.getByText('Adesione completata!')).toBeInTheDocument();
  expect(document.body.textContent).toContain("Comunicheremo l'avvenuta adesione");
});
