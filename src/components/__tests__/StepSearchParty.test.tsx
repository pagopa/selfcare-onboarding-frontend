import { StepSearchParty } from '../steps/StepSearchParty';
import { mockPartyRegistry, mockedProducts } from '../../lib/__mocks__/mockApiRequests';
import { screen } from '@testing-library/react';
import { renderComponentWithProviders } from '../../utils/test-utils';

test('Test: Render test', async () => {
  renderComponentWithProviders(
    <StepSearchParty subTitle={''} externalInstitutionId={mockPartyRegistry.items[0].taxCode} />
  );
});

test('Test: Expected link that allow the public service manager to insert party data also without IPA source', async () => {
  let componentRendered = false;

  const alsoWithoutIpaProducts = mockedProducts.filter(
    (p) => p.id !== 'prod-interop' && p.id !== 'prod-io' && p.id !== 'prod-io-sign'
  );

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
});

test('Test: The public service manager that onboard one of this products must select party from IPA source', async () => {
  let componentRendered = false;

  const onlyWithIpaProducts = mockedProducts.filter(
    (p) => p.id === 'prod-interop' || p.id === 'prod-io' || p.id === 'prod-io-sign'
  );

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
});
