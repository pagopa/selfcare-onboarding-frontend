import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
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
  executeStepAddManager,
  verifySubmitPostLegalsIoPremium,
  verifySubmitPostLegalsPspDashBoard,
} from '../../../utils/test-utils';
import { createStore } from '../../../redux/store';
import { Provider } from 'react-redux';
import { PRODUCT_IDS } from '../../../utils/constants';

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

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockedHistoryPush,
    location: mockedLocation,
    replace: (nextLocation: any) => Object.assign(mockedLocation, nextLocation),
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
  cleanup();
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

const renderComponent = (
  productId: string = PRODUCT_IDS.IO,
  subProductId: string = PRODUCT_IDS.IO_PREMIUM,
  injectedHistory?: ReturnType<typeof createMemoryHistory>,
  injectedStore?: ReturnType<typeof createStore>
) => {
  const Component = () => {
    const history = injectedHistory ? injectedHistory : createMemoryHistory();
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);
    const store = injectedStore ? injectedStore : createStore();
    if (!injectedHistory) {
      history.push(`/${productId}/${subProductId}`);
    }
    return (
      <Provider store={store}>
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
      </Provider>
    );
  };

  render(<Component />);
};

const stepBillingDataTitle = 'Inserisci i dati dell’ente';
const stepAddManagerTitle = 'Indica il Legale Rappresentante';

test('Test: Bad productId and subProductId for prod-io-premium', async () => {
  renderComponent(PRODUCT_IDS.IO, PRODUCT_IDS.IO);
  await waitFor(() => {
    expect(fetchWithLogsSpy).toHaveBeenCalledTimes(4);
    screen.findByText('Qualcosa è andato storto');
  });
});

test('Test: Bad productId and subProductId for prod-dashboard-psp', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA, PRODUCT_IDS.PAGOPA);
  await waitFor(() => {
    expect(fetchWithLogsSpy).toHaveBeenCalledTimes(4);
    screen.findByText('Qualcosa è andato storto');
  });
});

test('Test: Error retrieving onboarding info for prod-io-premium', async () => {
  renderComponent(PRODUCT_IDS.IO, PRODUCT_IDS.IO_PREMIUM);
  // // await executeStepSelectPricingPlan();
  await executeStepSelectInstitution('Comune di Gessate');
  await waitFor(() => screen.getByText('Qualcosa è andato storto'));
  await executeClickCloseButton(false);
});

test('Test: Successfully complete onboarding request for prod-io-premium', async () => {
  renderComponent(PRODUCT_IDS.IO, PRODUCT_IDS.IO_PREMIUM);
  await executeStepSelectInstitution('Comune di Milano');
  await executeStepBillingDataWithTaxCodeInvoicing(PRODUCT_IDS.IO_PREMIUM);
  await executeStepAddManager(false, true, true, fetchWithLogsSpy);
  await executeClickCloseButton(true);
  await verifySubmitPostLegalsIoPremium(fetchWithLogsSpy);
});

test('Test: Successfully complete onboarding request for prod-dashboard-psp', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA, PRODUCT_IDS.DASHBOARD_PSP);
  await executeStepSelectInstitution('Banca del Monte di Lucca S.p.A.');
  await executeStepBillingDataWithTaxCodeInvoicing(PRODUCT_IDS.DASHBOARD_PSP);
  await executeStepAddManager(false, true, true, fetchWithLogsSpy);
  await executeClickCloseButton(true);
  await verifySubmitPostLegalsPspDashBoard(fetchWithLogsSpy);
});

test('Test: Complete onboarding request with error on submit', async () => {
  renderComponent(PRODUCT_IDS.IO, PRODUCT_IDS.IO_PREMIUM);
  await executeStepSelectInstitution('Comune di Udine');
  await executeStepBillingDataWithoutTaxCodeInvoicing();
  await executeStepAddManager(false, true, false, fetchWithLogsSpy);
  await executeClickHomeButton();
});

test('Test: exiting during flow with unload event', async () => {
  renderComponent(PRODUCT_IDS.IO, PRODUCT_IDS.IO_PREMIUM);
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

  await waitFor(() => expect(fetchWithLogsSpy).toHaveBeenCalledTimes(4));
  const party = screen.getByText(partyName);

  expect(party).toBeTruthy();

  expect(fetchWithLogsSpy).toHaveBeenCalledTimes(4);

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

  const confirmButtonEnabled = screen.getByLabelText('Continua');

  // if (subProductId === PRODUCT_IDS.IO_PREMIUM) {
  //   fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
  //     target: { value: '' },
  //   });
  //   await waitFor(() => expect(confirmButtonEnabled).toBeDisabled());
  //   fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
  //     target: { value: 'A1B2C3' },
  //   });

  //   await new Promise((resolve) => setTimeout(resolve, 300));
  //   await waitFor(() => expect(screen.getByText('Codice Fiscale SFE')).toBeInTheDocument(), {
  //     timeout: 500, // Tempo massimo per l'attesa
  //   });
  // }

  if( subProductId === PRODUCT_IDS.DASHBOARD_PSP) {
    fireEvent.change(document.getElementById('address') as HTMLElement, {
      target: { value: 'Via Manzoni 12' },
    });
    fireEvent.change(document.getElementById('pec') as HTMLElement, {
      target: { value: 'pec@bpm.it' },
    });
    fireEvent.change(document.getElementById('email') as HTMLElement, {
      target: { value: 'dpo@bpm.it' },
    });
  }

  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  fireEvent.click(confirmButtonEnabled);
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
