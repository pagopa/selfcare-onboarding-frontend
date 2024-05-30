import { StepSearchParty } from '../steps/StepSearchParty';
import { mockPartyRegistry, mockedProducts } from '../../lib/__mocks__/mockApiRequests';
import { fireEvent, screen } from '@testing-library/react';
import { renderComponentWithProviders } from '../../utils/test-utils';
import { noMandatoryIpaProducts } from '../../utils/constants';

test('Test: Render test', async () => {
  renderComponentWithProviders(
    <StepSearchParty subTitle={''} externalInstitutionId={mockPartyRegistry.items[0].taxCode} />
  );
});

test('Test: Expected link that allow the public service manager to insert party data also without IPA source', async () => {
  let componentRendered = false;

  const alsoWithoutIpaProducts = mockedProducts.filter((p) => noMandatoryIpaProducts(p.id));

  alsoWithoutIpaProducts.forEach((p) => {
    if (!componentRendered) {
      renderComponentWithProviders(
        <StepSearchParty
          subTitle={''}
          externalInstitutionId={mockPartyRegistry.items[0].taxCode}
          institutionType="GSP"
          product={p}
        />
      );
      componentRendered = true;
    }
  });

  screen.getByText(/Inserisci manualmente i dati del tuo ente./);

  const selectSearchMode = document.getElementById('party-type-select') as HTMLInputElement;
  fireEvent.mouseDown(selectSearchMode);

  const taxCodeSearch = screen.getByTestId('taxCode');
  expect(taxCodeSearch).toBeInTheDocument();

  fireEvent.click(taxCodeSearch);

  const continueButton = screen.getByRole('button', { name: 'Continua' });
  expect(continueButton).toBeDisabled();

  const inputSearch = document.getElementById('Parties') as HTMLInputElement;
  fireEvent.change(inputSearch, { target: { value: '11111111111' } });
  screen.getByText('Nessun risultato');

  expect(continueButton).toBeEnabled();

  fireEvent.change(inputSearch, { target: { value: '1111111111' } });
  expect(continueButton).toBeDisabled();

  fireEvent.mouseDown(selectSearchMode);

  const businessNameSearch = screen.getByTestId('businessName');
  expect(businessNameSearch).toBeInTheDocument();

  fireEvent.click(businessNameSearch);

  expect(continueButton).toBeDisabled();

  fireEvent.change(inputSearch, { target: { value: 'val' } });
  expect(continueButton).toBeEnabled();

  fireEvent.change(inputSearch, { target: { value: 'va' } });
  expect(continueButton).toBeDisabled();
});

test('Test: The public service manager that onboard one of this products must select party from IPA source', async () => {
  let componentRendered = false;

  const onlyWithIpaProducts = mockedProducts.filter((p) => !noMandatoryIpaProducts(p.id));

  onlyWithIpaProducts.forEach((p) => {
    if (!componentRendered) {
      renderComponentWithProviders(
        <StepSearchParty
          subTitle={''}
          externalInstitutionId={mockPartyRegistry.items[0].taxCode}
          institutionType="GSP"
          product={p}
        />
      );
      componentRendered = true;
    }
  });

  screen.getByText(/informazioni sull'indice e su come accreditarsi/);

  const selectSearchMode = document.getElementById('party-type-select') as HTMLInputElement;
  fireEvent.mouseDown(selectSearchMode);

  const taxCodeSearch = screen.getByTestId('taxCode');
  expect(taxCodeSearch).toBeInTheDocument();

  fireEvent.click(taxCodeSearch);

  const continueButton = screen.getByRole('button', { name: 'Continua' });
  expect(continueButton).toBeDisabled();

  const inputSearch = document.getElementById('Parties') as HTMLInputElement;
  fireEvent.change(inputSearch, { target: { value: '11111111111' } });
  screen.getByText('Nessun risultato');

  expect(continueButton).toBeDisabled();

  fireEvent.change(inputSearch, { target: { value: '1111111111' } });
  expect(continueButton).toBeDisabled();

  fireEvent.mouseDown(selectSearchMode);

  const businessNameSearch = screen.getByTestId('businessName');
  expect(businessNameSearch).toBeInTheDocument();

  fireEvent.click(businessNameSearch);

  expect(continueButton).toBeDisabled();

  fireEvent.change(inputSearch, { target: { value: 'val' } });
  expect(continueButton).toBeDisabled();
});
