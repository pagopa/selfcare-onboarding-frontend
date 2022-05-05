import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { Product, User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import OnBoardingSubProduct from '../OnBoardingSubProduct';
import '../../../locale';
import { Route, Router, Switch } from 'react-router';
import { createMemoryHistory } from 'history';

jest.mock('../../../lib/api-utils');

jest.setTimeout(20000);

let fetchWithLogsSpy: jest.SpyInstance;

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../../lib/api-utils'), 'fetchWithLogs');
});

const oldWindowLocation = global.window.location;
const initialLocation = {
  assign: jest.fn(),
  pathname: '/:productId/:subProductId',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
  state: undefined,
};
const mockedLocation = Object.assign({}, initialLocation);

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

beforeEach(() => Object.assign(mockedLocation, initialLocation));

const mockedHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockedHistoryPush,
    location: mockedLocation,
    replace: (nextLocation) => Object.assign(mockedLocation, nextLocation),
  }),
}));

const renderComponent = (
  productId: string = 'prod-io',
  subProductId: string = 'prod-io-premium',
  injectedHistory?: ReturnType<typeof createMemoryHistory>
) => {
  const Component = () => {
    const history = injectedHistory ? injectedHistory : createMemoryHistory();
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onLogout, setOnLogout] = useState<(() => void) | null | undefined>();

    if (!injectedHistory) {
      history.push(`/${productId}/${subProductId}`);
    }

    return (
      <Router history={history}>
        <HeaderContext.Provider
          value={{ subHeaderVisible, setSubHeaderVisible, onLogout, setOnLogout }}
        >
          <UserContext.Provider
            value={{ user, setUser, requiredLogin: false, setRequiredLogin: () => {} }}
          >
            <button onClick={onLogout}>LOGOUT</button>
            <Switch>
              <Route path="/:productId/:subProductId">
                <OnBoardingSubProduct />
              </Route>
            </Switch>
          </UserContext.Provider>
        </HeaderContext.Provider>
      </Router>
    );
  };

  render(<Component />);
};

const stepSelectInstitutionUnreleatedTitle = 'Seleziona il tuo ente';
const stepSelectInstitutionReleatedTitle = "Seleziona l'ente";
const stepBillingDataTitle = 'Indica i dati del tuo ente';
const stepAddManagerTitle = 'Indica il Legale rappresentante';
const successOnboardingSubProductTitle = 'La tua richiesta è stata inviata con successo';
const errorOnboardingSubProductTitle = 'Richiesta di adesione premium in errore';

test('test already subscribed to premium', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitutionUnreleated('agency onboarded');
  await waitFor(() => screen.getByText('Sottoscrizione già avvenuta'));
  await executeClickCloseButton();
});

test('test not base product adhesion', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitutionUnreleated('agency pending');
  await waitFor(() => screen.getByText('Errore'));
  await executeClickAdhesionButton();
});

test('test error retrieving onboarding info', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitutionUnreleated('agency info error');
  await waitFor(() => screen.getByText('Spiacenti, qualcosa è andato storto.'));
  await executeClickCloseButton();
});

test('test error subProductID', async () => {
  renderComponent('error', 'error');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('test complete', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitutionUnreleated('agency x');
  await executeStepBillingData();
  await executeStepAddManager(true);
  await executeClickCloseButton();
});

test('test complete with error on submit', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitutionUnreleated('agency error');
  await executeStepBillingData();
  await executeStepAddManager(false);
  await executeClickHomeButton();
});

test('test exiting during flow with unload event', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitutionUnreleated('agency x');
  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  await waitFor(
    () =>
      (event.returnValue as unknown as string) ===
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
  );
});

test('test exiting during flow with logout', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectInstitutionReleated('Comune di Milano');

  expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull();

  const logoutButton = screen.getByText('LOGOUT');
  await performLogout(logoutButton);

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());

  await performLogout(logoutButton);
  await waitFor(() => expect(screen.getByText('Vuoi davvero uscire?')).not.toBeNull());

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Esci' }));
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LOGOUT));
});

const performLogout = async (logoutButton: HTMLElement) => {
  fireEvent.click(logoutButton);
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).not.toBeNull());
};

const retrieveNavigationButtons = async () => {
  const goBackButton = screen.getByRole('button', {
    name: 'Indietro',
  });
  expect(goBackButton).toBeEnabled();

  const confirmButton = screen.getByRole('button', {
    name: 'Conferma',
  });
  await waitFor(() => expect(confirmButton).toBeEnabled());

  return [goBackButton, confirmButton];
};

const checkBackForwardNavigation = async (
  previousStepTitle: string,
  actualStepTitle: string
): Promise<Array<HTMLElement>> => {
  const [goBackButton] = await retrieveNavigationButtons();
  expect(goBackButton).toBeEnabled();
  fireEvent.click(goBackButton);

  await waitFor(() => screen.getByText(previousStepTitle));

  const goForwardButton = screen.getByRole('button', {
    name: 'Conferma',
  });
  expect(goForwardButton).toBeEnabled();
  fireEvent.click(goForwardButton);

  await waitFor(() => screen.getByText(actualStepTitle));

  return await retrieveNavigationButtons();
};

const executeStepSelectInstitutionUnreleated = async (partyName: string) => {
  console.log('Testing step select institution UNRELEATED');

  const newInstitutionAdhesion = await waitFor(() => screen.getByText('Registra un nuovo ente'));
  fireEvent.click(newInstitutionAdhesion);

  await waitFor(() => screen.getByText(stepSelectInstitutionUnreleatedTitle));
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
  const inputPartyName = document.getElementById('Parties');

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'XXX' } });

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));
  expect(fetchWithLogsSpy).toBeCalledTimes(4);

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Conferma' });

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(5));
};

const executeStepSelectInstitutionReleated = async (partyName: string) => {
  console.log('Testing step select institution RELEATED');

  await waitFor(() => screen.getByText(stepSelectInstitutionReleatedTitle));
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
  const inputPartyName = screen.getByText(partyName);

  expect(inputPartyName).toBeTruthy();

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));
  expect(fetchWithLogsSpy).toBeCalledTimes(3);

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Conferma' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
};

const executeStepBillingData = async () => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText(stepBillingDataTitle));

  await checkBackForwardNavigation(stepSelectInstitutionUnreleatedTitle, stepBillingDataTitle);

  await fillUserBillingDataForm(
    'businessName',
    'registeredOffice',
    'digitalAddress',
    'taxCode',
    'vatNumber',
    'recipientCode'
  );
  const confirmButtonEnabled = screen.getByRole('button', { name: 'Conferma' });
  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  fireEvent.change(document.getElementById('recipientCode'), {
    target: { value: '' },
  });
  await waitFor(() => expect(confirmButtonEnabled).toBeDisabled());

  await fillUserBillingDataForm(
    'businessName',
    'registeredOffice',
    'digitalAddress',
    'taxCode',
    'vatNumber',
    'recipientCode'
  );

  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(stepAddManagerTitle));
};

const executeStepAddManager = async (expectedSuccessfulSubmit: boolean) => {
  console.log('Testing step add manager');
  await waitFor(() => screen.getByText(stepAddManagerTitle));

  const confirmButton = screen.getByRole('button', { name: 'Conferma' });

  await fillUserForm(confirmButton, 'LEGAL', 'BBBBBB00B00B000B', 'b@b.bb');

  expect(confirmButton).toBeEnabled();
  fireEvent.click(confirmButton);

  await waitFor(() =>
    screen.getByText(
      expectedSuccessfulSubmit ? successOnboardingSubProductTitle : errorOnboardingSubProductTitle
    )
  );
};

const executeClickHomeButton = async () => {
  console.log('Pressing home button and go to home');
  const goHomeButton = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  expect(goHomeButton).toBeEnabled();
  fireEvent.click(goHomeButton);
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING));
};

const executeClickCloseButton = async () => {
  console.log('Pressing Close button and go to landing');
  const closeButton = screen.getByRole('button', {
    name: 'Chiudi',
  });
  expect(closeButton).toBeEnabled();
  fireEvent.click(closeButton);
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING));
};

const executeClickAdhesionButton = async () => {
  console.log('Pressing Close button and go to adhesion');
  const adhesionButton = screen.getByRole('button', {
    name: 'Aderisci',
  });
  expect(adhesionButton).toBeEnabled();
  fireEvent.click(adhesionButton);
  await waitFor(() => expect(mockedHistoryPush).toBeCalledWith('/onboarding/prod-io'));
};

const fillUserBillingDataForm = async (
  businessNameInput: string,
  registeredOfficeInput: string,
  mailPECInput: string,
  taxCodeInput: string,
  vatNumber: string,
  recipientCode: string
) => {
  fireEvent.change(document.getElementById(businessNameInput), {
    target: { value: 'businessNameInput' },
  });
  fireEvent.change(document.getElementById(registeredOfficeInput), {
    target: { value: 'registeredOfficeInput' },
  });
  fireEvent.change(document.getElementById(mailPECInput), { target: { value: 'a@a.com' } });
  fireEvent.change(document.getElementById(taxCodeInput), {
    target: { value: 'AAAAAA44D55F456K' },
  });
  fireEvent.change(document.getElementById(vatNumber), { target: { value: '11122233345' } });
  fireEvent.change(document.getElementById(recipientCode), {
    target: { value: 'AM23EIX' },
  });
};

const fillUserForm = async (
  confirmButton: HTMLElement,
  prefix: string,
  taxCode: string,
  email: string,
  existentTaxCode?: string,
  expectedDuplicateTaxCodeMessages?: number,
  existentEmail?: string,
  expectedDuplicateEmailMessages?: number
) => {
  await fillTextFieldAndCheckButton(prefix, 'name', 'NAME', confirmButton, false);
  await fillTextFieldAndCheckButton(prefix, 'surname', 'SURNAME', confirmButton, false);
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode, confirmButton, false);
  await fillTextFieldAndCheckButton(prefix, 'email', email, confirmButton, true);

  await fillTextFieldAndCheckButton(prefix, 'taxCode', '', confirmButton, false);
  await fillTextFieldAndCheckButton(prefix, 'taxCode', 'INVALIDTAXCODE', confirmButton, false);
  screen.getByText('Il Codice Fiscale inserito non è valido');
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode, confirmButton, true);

  await fillTextFieldAndCheckButton(prefix, 'email', '', confirmButton, false);
  await fillTextFieldAndCheckButton(prefix, 'email', 'INVALIDEMAIL', confirmButton, false);
  screen.getByText("L'indirizzo email non è valido");
  await fillTextFieldAndCheckButton(prefix, 'email', email, confirmButton, true);

  await fillTextFieldAndCheckButton(prefix, 'name', '', confirmButton, false);
  await fillTextFieldAndCheckButton(prefix, 'name', 'NAME', confirmButton, true);

  await fillTextFieldAndCheckButton(prefix, 'surname', '', confirmButton, false);
  await fillTextFieldAndCheckButton(prefix, 'surname', 'SURNAME', confirmButton, true);

  await checkAlreadyExistentValues(
    prefix,
    confirmButton,
    existentTaxCode,
    taxCode,
    expectedDuplicateTaxCodeMessages,
    existentEmail,
    email,
    expectedDuplicateEmailMessages
  );
};

const checkAlreadyExistentValues = async (
  prefix: string,
  confirmButton: HTMLElement,
  existentTaxCode: string | undefined,
  taxCode: string,
  expectedDuplicateTaxCodeMessages: number | undefined,
  existentEmail: string | undefined,
  email: string,
  expectedDuplicateEmailMessages: number | undefined
) => {
  if (existentTaxCode) {
    await fillTextFieldAndCheckButton(prefix, 'taxCode', existentTaxCode, confirmButton, false);
    const duplicateTaxCodeErrors = screen.getAllByText('Il codice fiscale inserito è già presente');
    expect(duplicateTaxCodeErrors.length).toBe(expectedDuplicateTaxCodeMessages);
  }
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode, confirmButton, true);

  if (existentEmail) {
    await fillTextFieldAndCheckButton(prefix, 'email', existentEmail, confirmButton, false);
    const duplicateEmailErrors = screen.getAllByText("L'indirizzo email inserito è già presente");
    expect(duplicateEmailErrors.length).toBe(expectedDuplicateEmailMessages);
  }
  await fillTextFieldAndCheckButton(prefix, 'email', email, confirmButton, true);
};

const fillTextFieldAndCheckButton = async (
  prefix: string,
  field: string,
  value: string,
  confirmButton: HTMLElement,
  expectedEnabled: boolean
) => {
  fireEvent.change(document.getElementById(`${prefix}-${field}`), { target: { value } });
  if (expectedEnabled) {
    expect(confirmButton).toBeEnabled();
  } else {
    expect(confirmButton).toBeDisabled();
  }
};
