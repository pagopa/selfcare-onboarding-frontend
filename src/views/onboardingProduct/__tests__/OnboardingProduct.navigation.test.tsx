import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import '../../../locale';
import { PRODUCT_IDS } from '../../../utils/constants';
import { ENV } from '../../../utils/env';
import { phaseOutProductResponse, respondWith } from './shared/apiOverrides';
import { executeBack, executeStepInstitutionType, renderComponent } from './shared/stepHelpers';
import { mockedHistoryPush, mockedLocation, setupTestHooks } from './shared/testSetup';

// Characterization tests: they pin down the current navigation of the OnboardingProduct wizard
// (step transitions, back targets and entry points) so that it can be refactored safely.

vi.setConfig({ testTimeout: 80000 });

// externalId of the 'AGENCY X' IPA party served by the shared mocks
const AGENCY_X_EXTERNAL_ID = 'id';

const mockedHistoryGoBack = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation: any) => Object.assign(mockedLocation, nextLocation),
    push: mockedHistoryPush,
    goBack: mockedHistoryGoBack,
  }),
}));
vi.mock('axios');

setupTestHooks(() => {
  mockedLocation.assign.mockClear();
  mockedHistoryGoBack.mockClear();
});

// Lighter than executeStepSearchParty: it does not assert on the number of API calls, which
// changes when the flow is re-entered or started from the dashboard.
const selectPartyByBusinessName = async (partyName: string, isAggregator: boolean = false) => {
  await waitFor(() => screen.getByText('Cerca il tuo ente'));
  if (isAggregator) {
    fireEvent.click(screen.getByLabelText('Sono un ente aggregatore'));
  }
  fireEvent.change(document.getElementById('Parties') as HTMLElement, {
    target: { value: 'XXX' },
  });
  fireEvent.click(await waitFor(() => screen.getByText(partyName)));

  const continueButton = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(continueButton).toBeEnabled());
  fireEvent.click(continueButton);

  if (isAggregator) {
    await waitFor(() => screen.getByText(/Stai richiedendo l’adesione come ente aggregatore per /));
    fireEvent.click(screen.getAllByText('Continua')[1]);
  }
};

describe('Outcome pages', () => {
  test('A1: a product in phase-out shows the phase-out error page', async () => {
    respondWith('ONBOARDING_VERIFY_PRODUCT', phaseOutProductResponse(PRODUCT_IDS.PAGOPA));

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => screen.getByText(/a breve non sarà/));
    expect(screen.queryByText('Seleziona il tipo di ente che rappresenti')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Torna alla home' }));
    expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING);
  });

  test('A2: a pricing plan other than FA shows the invalid pricing plan page', async () => {
    mockedLocation.search = '?pricingPlan=XX';

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => screen.getByText(/Non riusciamo a trovare la pagina che stai cercando/));
    expect(screen.queryByText('Seleziona il tipo di ente che rappresenti')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Torna alla home' }));
    expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING);
  });
});

describe('Entry points from URL', () => {
  test('A3: institutionType=PT in query lands on the tech partner billing data step', async () => {
    mockedLocation.search = '?institutionType=PT';

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => screen.getByText('Inserisci i dati dell’ente'));
    screen.getByText(/Serviranno a registrarti come Partner tecnologico/);
    expect(screen.queryByText('Seleziona il tipo di ente che rappresenti')).not.toBeInTheDocument();

    await executeBack('Seleziona il tipo di ente che rappresenti');
  });

  test('A4: a subunit in hash for a product other than SEND redirects to the dashboard', async () => {
    mockedLocation.hash = '#subunitType=AOO&subunitCode=A356E00';

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.DASHBOARD));
  });

  test('A13: coming from dashboard (partyExternalId), back from billing data returns to the institution type step', async () => {
    mockedLocation.search = `?pricingPlan=FA&partyExternalId=${AGENCY_X_EXTERNAL_ID}`;

    renderComponent(PRODUCT_IDS.IO);
    await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
    await selectPartyByBusinessName('AGENCY X');
    await waitFor(() => screen.getByText('Inserisci i dati dell’ente'));

    await executeBack('Seleziona il tipo di ente che rappresenti');
  });
});
