import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import '../../../locale';
import { PRODUCT_IDS } from '../../../utils/constants';
import { ENV } from '../../../utils/env';
import { executeStepAddManager } from '../../../utils/test/test-utils';
import { phaseOutProductResponse, respondWith } from './shared/apiOverrides';
import {
  executeBack,
  executeStepAdditionalGpuInformations,
  executeStepAdditionalInfo,
  executeStepBillingData,
  executeStepContractsSummary,
  executeStepInstitutionType,
  executeStepSearchParty,
  renderComponent,
} from './shared/stepHelpers';
import {
  fetchWithLogsSpy,
  mockedHistoryPush,
  mockedLocation,
  setupTestHooks,
} from './shared/testSetup';

// Characterization tests: they pin down the current navigation of the OnboardingProduct wizard
// (step transitions, back targets and entry points) so that it can be refactored safely.

vi.setConfig({ testTimeout: 80000 });

// externalId of the 'AGENCY X' IPA party served by the shared mocks
const AGENCY_X_EXTERNAL_ID = 'id';

// Titles identifying each wizard step (it locale)
const INSTITUTION_TYPE_TITLE = 'Seleziona il tipo di ente che rappresenti';
const SEARCH_PARTY_TITLE = 'Cerca il tuo ente';
const SEARCH_PARTY_CONFIRM_TITLE = 'Conferma l’ente selezionato';
const CONTRACTS_SUMMARY_TITLE = 'Prepara i documenti';
const BILLING_TITLE = 'Inserisci i dati dell’ente';
const ADDITIONAL_GPU_INFO_TITLE = 'Seleziona tra le opzioni quella che descrive il tuo ente.';
const ADDITIONAL_INFO_TITLE =
  'Scegli l’opzione che descrive il tuo ente. Se nessuna è appropriata, seleziona “Altro” e inserisci maggiori dettagli.';
const MANAGER_TITLE = 'Indica il Legale Rappresentante';
const ADMIN_TITLE = "Indica l'Amministratore";

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
  await waitFor(() => screen.getByText(SEARCH_PARTY_TITLE));
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

const clickContinue = async () => {
  const continueButton = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(continueButton).toBeEnabled());
  fireEvent.click(continueButton);
};

describe('Outcome pages', () => {
  test('A1: a product in phase-out shows the phase-out error page', async () => {
    respondWith('ONBOARDING_VERIFY_PRODUCT', phaseOutProductResponse(PRODUCT_IDS.PAGOPA));

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => screen.getByText(/a breve non sarà/));
    expect(screen.queryByText(INSTITUTION_TYPE_TITLE)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Torna alla home' }));
    expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING);
  });

  test('A2: a pricing plan other than FA shows the invalid pricing plan page', async () => {
    mockedLocation.search = '?pricingPlan=XX';

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => screen.getByText(/Non riusciamo a trovare la pagina che stai cercando/));
    expect(screen.queryByText(INSTITUTION_TYPE_TITLE)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Torna alla home' }));
    expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING);
  });
});

describe('Entry points from URL', () => {
  test('A3: institutionType=PT in query lands on the tech partner billing data step', async () => {
    mockedLocation.search = '?institutionType=PT';

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => screen.getByText(BILLING_TITLE));
    screen.getByText(/Serviranno a registrarti come Partner tecnologico/);
    expect(screen.queryByText(INSTITUTION_TYPE_TITLE)).not.toBeInTheDocument();

    await executeBack(INSTITUTION_TYPE_TITLE);
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
    await waitFor(() => screen.getByText(BILLING_TITLE));

    await executeBack(INSTITUTION_TYPE_TITLE);
  });
});

describe('Exit modal', () => {
  test('A5: back from the institution type step opens the exit modal; cancel closes it, exit goes back in history', async () => {
    mockedLocation.search = `?pricingPlan=FA&partyExternalId=${AGENCY_X_EXTERNAL_ID}`;

    renderComponent(PRODUCT_IDS.IO);
    await waitFor(() => screen.getByText(INSTITUTION_TYPE_TITLE));

    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));
    await waitFor(() => screen.getByText('Vuoi davvero uscire?'));
    fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
    await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).not.toBeInTheDocument());
    expect(mockedHistoryGoBack).not.toHaveBeenCalled();
    screen.getByText(INSTITUTION_TYPE_TITLE);

    fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));
    await waitFor(() => screen.getByText('Vuoi davvero uscire?'));
    fireEvent.click(screen.getByRole('button', { name: 'Esci' }));
    expect(mockedHistoryGoBack).toHaveBeenCalledTimes(1);
  });
});

describe('Back navigation by institution type', () => {
  test('A6: PA – admins → manager → billing data → search party', async () => {
    renderComponent(PRODUCT_IDS.IO);
    await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
    await executeStepSearchParty(
      PRODUCT_IDS.IO,
      'PA',
      'AGENCY X',
      'businessName',
      fetchWithLogsSpy
    );
    await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'AGENCY X');
    await waitFor(() => screen.getByText(MANAGER_TITLE));

    await executeBack(BILLING_TITLE);
    await clickContinue();
    await executeStepAddManager(false);
    await waitFor(() => screen.getByText(ADMIN_TITLE));

    await executeBack(MANAGER_TITLE);
    await executeBack(BILLING_TITLE);
    // the search party step keeps the previously selected party
    await executeBack(SEARCH_PARTY_CONFIRM_TITLE);
    expect(document.getElementById('Parties')).toHaveValue('AGENCY X');
  });

  test('A7: GPU – manager → additional GPU info → billing data → institution type', async () => {
    renderComponent(PRODUCT_IDS.PAGOPA);
    await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'GPU');
    await executeStepBillingData(
      PRODUCT_IDS.PAGOPA,
      'GPU',
      false,
      false,
      'NO_IPA',
      'Mocked GPU name',
      false
    );
    await waitFor(() => screen.getByText(ADDITIONAL_GPU_INFO_TITLE));

    await executeBack(BILLING_TITLE);
    await clickContinue();
    await executeStepAdditionalGpuInformations();
    await waitFor(() => screen.getByText(MANAGER_TITLE));

    await executeBack(ADDITIONAL_GPU_INFO_TITLE);
    await executeBack(BILLING_TITLE);
    await executeBack(INSTITUTION_TYPE_TITLE);
  });

  test('A8: GSP without IPA (NO_IPA flag on) – manager → additional info → billing data → contracts summary → search party', async () => {
    renderComponent(PRODUCT_IDS.PAGOPA);
    await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'GSP');
    await executeStepSearchParty(
      PRODUCT_IDS.PAGOPA,
      'GSP',
      'AGENCY X',
      'businessName',
      fetchWithLogsSpy,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      true
    );
    await executeStepContractsSummary();
    await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'GSP', false, false, 'NO_IPA', 'AGENCY X');
    await executeStepAdditionalInfo('NO_IPA');
    await waitFor(() => screen.getByText(MANAGER_TITLE));

    await executeBack(ADDITIONAL_INFO_TITLE);
    await executeBack(BILLING_TITLE);
    await executeBack(CONTRACTS_SUMMARY_TITLE);
    await executeBack(SEARCH_PARTY_TITLE);
  });

  test('A10: PT – admins → billing data → institution type', async () => {
    renderComponent(PRODUCT_IDS.PAGOPA);
    await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PT');
    await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'PT', false, false, 'NO_IPA');
    await waitFor(() => screen.getByText(ADMIN_TITLE));

    await executeBack(BILLING_TITLE);
    await executeBack(INSTITUTION_TYPE_TITLE);
  });
});
