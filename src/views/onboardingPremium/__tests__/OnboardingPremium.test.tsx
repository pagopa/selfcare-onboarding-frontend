import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import OnboardingPremium from '../OnboardingPremium';
import '../../../locale';
import { Route, Router, Switch } from 'react-router';
import { createMemoryHistory } from 'history';
import React from 'react';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import '@testing-library/jest-dom';
import {
  checkCertifiedUserValidation,
  fillUserForm,
  verifySubmitPostLegalsIoPremium,
  verifySubmitPostLegalsPspDashBoard,
} from '../../../utils/test-utils';

jest.setTimeout(20000);

const oldWindowLocation = global.window.location;
const initialLocation = {
  assign: jest.fn(),
  pathname: '/:productId/:subProductId',
  origin: 'MOCKED_ORIGIN',
  hash: '',
  state: undefined,
};

const mockedLocation = Object.assign({}, initialLocation);
const mockedHistoryPush = jest.fn();
const originalFetch = global.fetch;
let fetchWithLogsSpy: jest.SpyInstance;

jest.mock('../../../lib/api-utils');
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockedHistoryPush,
    location: mockedLocation,
    replace: (nextLocation) => Object.assign(mockedLocation, nextLocation),
  }),
}));

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../../lib/api-utils'), 'fetchWithLogs');
  Object.assign(mockedLocation, initialLocation);
});

beforeAll(() => {
  i18n.changeLanguage('it');
  Object.defineProperty(window, 'location', { value: mockedLocation });
});

afterEach(() => {
  global.fetch = originalFetch;
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

const renderComponent = (
  productId: string = 'prod-io',
  subProductId: string = 'prod-io-premium',
  injectedHistory?: ReturnType<typeof createMemoryHistory>
) => {
  const Component = () => {
    const history = injectedHistory ? injectedHistory : createMemoryHistory();
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);

    if (!injectedHistory) {
      history.push(`/${productId}/${subProductId}`);
    }
    return (
      <Router history={history}>
        <HeaderContext.Provider
          value={{
            subHeaderVisible,
            setSubHeaderVisible,
            onExit,
            setOnExit,
            enableLogin,
            setEnableLogin,
          }}
        >
          <UserContext.Provider
            value={{ user, setUser, requiredLogin: false, setRequiredLogin: () => {} }}
          >
            <button onClick={() => onExit?.(() => window.location.assign(ENV.URL_FE.LOGOUT))}>
              LOGOUT
            </button>
            <Switch>
              <Route path="/:productId/:subProductId">
                <OnboardingPremium />
              </Route>
            </Switch>
          </UserContext.Provider>
        </HeaderContext.Provider>
      </Router>
    );
  };

  render(<Component />);
};

const stepBillingDataTitle = 'Inserisci i dati dell’ente';
const stepAddManagerTitle = 'Indica il Legale Rappresentante';

test('Test: Bad productId and subProductId for prod-io-premium', async () => {
  renderComponent('prod-io', 'prod-io');
  await waitFor(() => {
    expect(fetchWithLogsSpy).toHaveBeenCalledTimes(4);
    screen.findByText('Qualcosa è andato storto');
  });
});

test('Test: Bad productId and subProductId for prod-dashboard-psp', async () => {
  renderComponent('prod-pagopa', 'prod-pagopa');
  await waitFor(() => {
    expect(fetchWithLogsSpy).toHaveBeenCalledTimes(4);
    screen.findByText('Qualcosa è andato storto');
  });
});

test('Test: Error retrieving onboarding info for prod-io-premium', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  // // await executeStepSelectPricingPlan();
  await executeStepSelectInstitution('Comune di Gessate');
  await waitFor(() => screen.getByText('Qualcosa è andato storto'));
  await executeClickCloseButton(false);
});

test('Test: Successfully complete onboarding request for prod-io-premium', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitution('Comune di Milano');
  await executeStepBillingDataWithTaxCodeInvoicing('prod-io-premium');
  await executeStepAddManager(true);
  await executeClickCloseButton(true);
  await verifySubmitPostLegalsIoPremium(fetchWithLogsSpy);
});

test('Test: Successfully complete onboarding request for prod-dashboard-psp', async () => {
  renderComponent('prod-pagopa', 'prod-dashboard-psp');
  await executeStepSelectInstitution('Banca del Fucino - S.p.A.');
  await executeStepBillingDataWithTaxCodeInvoicing('prod-dashboard-psp');
  await executeStepAddManager(true);
  await executeClickCloseButton(true);
  await verifySubmitPostLegalsPspDashBoard(fetchWithLogsSpy);
});

test('Test: Complete onboarding request with error on submit', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitution('Comune di Udine');
  await executeStepBillingDataWithoutTaxCodeInvoicing();
  await executeStepAddManager(false);
  await executeClickHomeButton();
});

test('Test: exiting during flow with unload event', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitution('Comune di Milano');
  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  await waitFor(
    () =>
      (event.returnValue as unknown as string) ===
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
  );
});

const executeStepSelectInstitution = async (partyName: string) => {
  console.log('Testing step select institution..');

  await waitFor(() => screen.getByText('Seleziona il tuo ente'));
  const continueButton = screen.getByText('Continua');
  expect(continueButton).toBeDisabled();

  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(4));
  const party = screen.getByText(partyName);

  expect(party).toBeTruthy();

  expect(fetchWithLogsSpy).toBeCalledTimes(4);

  fireEvent.click(party);

  expect(continueButton).toBeEnabled();

  fireEvent.click(continueButton);
};

const executeStepBillingDataWithTaxCodeInvoicing = async (subProductId: string) => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText(stepBillingDataTitle));

  const partyWithoutVatNumberCheckbox = screen.getByLabelText('Il mio ente non ha la partita IVA');
  fireEvent.click(partyWithoutVatNumberCheckbox);
  expect(partyWithoutVatNumberCheckbox).toBeChecked();

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });

  if (subProductId === 'prod-io-premium') {
    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: '' },
    });
    await waitFor(() => expect(confirmButtonEnabled).toBeDisabled());
    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: 'A1B2C3' },
    });

    await new Promise((resolve) => setTimeout(resolve, 300));
    await waitFor(() => expect(screen.getByText('Codice Fiscale SFE')).toBeInTheDocument(), {
      timeout: 500, // Tempo massimo per l'attesa
    });
  }

  if (subProductId === 'prod-dashboard-psp') {
    const legalRegisterName = document.getElementById('registrationInRegister') as HTMLInputElement;
    const legalRegisterAddress = document.getElementById('registerNumber') as HTMLInputElement;
    const dtoAdpoAddress = document.getElementById('address') as HTMLInputElement;

    fireEvent.change(legalRegisterName, { target: { value: 'Test' } });
    fireEvent.change(legalRegisterAddress, { target: { value: '250301' } });
    fireEvent.change(dtoAdpoAddress, { target: { value: 'Via Test 1' } });
  }

  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(stepAddManagerTitle));
};

const executeStepBillingDataWithoutTaxCodeInvoicing = async () => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText(stepBillingDataTitle));

  const partyWithoutVatNumberCheckbox = screen.getByLabelText('Il mio ente non ha la partita IVA');
  fireEvent.click(partyWithoutVatNumberCheckbox);
  expect(partyWithoutVatNumberCheckbox).toBeChecked();

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());
  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(stepAddManagerTitle));
};

const executeStepAddManager = async (expectedSuccessfulSubmit: boolean) => {
  console.log('Testing step add manager..');

  await waitFor(() => screen.getByText('Indica il Legale Rappresentante'));

  screen.getByText('Più informazioni sui ruoli');

  const continueButton = screen.getByRole('button', { name: 'Continua' });
  expect(continueButton).toBeDisabled();

  await checkCertifiedUserValidation('manager-initial', false, false);

  await fillUserForm('manager-initial', 'RSSMRA80A01H501U', 'm@ma.it', false, false, 'Mario', 'Rossi');

  fireEvent.click(continueButton);

  await waitFor(() => screen.getByText('Confermi la richiesta di invio?'));
  const confirmButton = screen.getByRole('button', { name: 'Conferma' });
  if (!expectedSuccessfulSubmit) {
    fetchWithLogsSpy.mockRejectedValue(() => Promise.reject({ status: 500 }));
  }

  await waitFor(() => fireEvent.click(confirmButton));

  await waitFor(() =>
    screen.getByText(
      expectedSuccessfulSubmit
        ? 'La richiesta di adesione è stata inviata con successo'
        : 'Qualcosa è andato storto'
    )
  );
};

const executeClickHomeButton = async () => {
  console.log('Pressing home button and go to home');
  const goHomeButton = await waitFor(() =>
    screen.getByRole('button', {
      name: 'Torna alla home',
    })
  );
  expect(goHomeButton).toBeEnabled();
  fireEvent.click(goHomeButton);
  await waitFor(() => expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING));
};

const executeClickCloseButton = async (expectedSuccessfulSubmit: boolean) => {
  console.log('Pressing Close button and go to landing');
  const closeButton = await waitFor(() =>
    screen.getByRole('button', {
      name: expectedSuccessfulSubmit ? 'Chiudi' : 'Torna alla home',
    })
  );
  expect(closeButton).toBeEnabled();
  fireEvent.click(closeButton);
  await waitFor(() => expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING));
};
