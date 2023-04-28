import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { Product, User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import OnBoardingSubProduct from '../OnBoardingSubProduct';
import '../../../locale';
import { Route, Router, Switch } from 'react-router';
import { createMemoryHistory } from 'history';
import { GeographicTaxonomy } from '../../../model/GeographicTaxonomies';

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
  search: '?pricingPlan=C1',
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
const stepSelectInstitutionReleatedTitle = 'Seleziona il tuo ente';
const stepBillingDataTitle = 'Indica i dati del tuo ente';
const stepAddManagerTitle = 'Indica il Legale Rappresentante';
const successOnboardingSubProductTitle = 'La richiesta di adesione è stata inviata con successo';
const errorOnboardingSubProductTitle = 'Qualcosa è andato storto';

const agencyOnboarded = 'AGENCY ONBOARDED';
const agencyInfoError = 'AGENCY INFO ERROR';
const agencyX = 'AGENCY X';
const agencyError = 'AGENCY ERROR';
const agencyPending = 'AGENCY PENDING';

// TODO all unreleated old test where commented in order to develop SELC-2237
// test('test select pricing plan', async () => {
//   renderComponent('prod-io', 'prod-io-premium');
//   await executeStepSelectPricingPlan();
//   await executeStepSelectInstitutionReleated('onboarded');
//   await waitFor(() => screen.getByText('Sottoscrizione già avvenuta'));
//   await executeClickCloseButton();
// });

// test.skip('test not base product adhesion', async () => {
//   renderComponent('prod-io', 'prod-io-premium');
//   await executeStepSelectPricingPlan();
//   await executeStepSelectInstitutionUnreleated(agencyPending);
//   await waitFor(() => screen.getByText('Errore'));
//   await executeClickAdhesionButton();
// });

// test.skip('test error retrieving onboarding info', async () => {
//   renderComponent('prod-io', 'prod-io-premium');
//   await executeStepSelectPricingPlan();
//   await executeStepSelectInstitutionUnreleated(agencyInfoError);
//   await waitFor(() => screen.getByText('Spiacenti, qualcosa è andato storto.'));
//   await executeClickCloseButton();
// });

// test.skip('test complete', async () => {
//   renderComponent('prod-io', 'prod-io-premium');
//   await executeStepSelectPricingPlan();
//   await executeStepSelectInstitutionUnreleated(agencyX);
//   await executeStepBillingData();
//   await executeStepAddManager(true);
//   await executeClickCloseButton();
//   await verifySubmit();
// });

// test.skip('test complete with error on submit', async () => {
//   renderComponent('prod-io', 'prod-io-premium');
//   await executeStepSelectPricingPlan();
//   await executeStepSelectInstitutionUnreleated(agencyError);
//   await executeStepBillingData();
//   await executeStepAddManager(false);
//   await executeClickHomeButton();
// });

// test.skip('test exiting during flow with unload event', async () => {
//   renderComponent('prod-io', 'prod-io-premium');
//   await executeStepSelectPricingPlan();
//   await executeStepSelectInstitutionUnreleated(agencyX);
//   const event = new Event('beforeunload');
//   window.dispatchEvent(event);
//   await waitFor(
//     () =>
//       (event.returnValue as unknown as string) ===
//       "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
//   );
// });

test('test error subProductID', async () => {
  renderComponent('error', 'error');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('test exiting during flow with logout', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  await executeStepSelectPricingPlan();
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
    name: 'Continua',
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

  await waitFor(() => screen.getByText('Conferma l’ente selezionato'));
  const goForwardButton = screen.getByRole('button', {
    name: 'Continua',
  });
  expect(goForwardButton).toBeEnabled();
  fireEvent.click(goForwardButton);

  await waitFor(() => screen.getByText(actualStepTitle));

  return await retrieveNavigationButtons();
};

const executeStepSelectPricingPlan = async () => {
  console.log('Testing step select pricingPlan');

  await waitFor(() =>
    screen.getByText(/Passa a IO Premium e migliora le performance dei messaggi/)
  );

  const showMoreBtn = document.getElementById('showMoreConsumptionPlan');
  fireEvent.click(showMoreBtn);

  const forwardBtn = document.getElementById('forwardConsumptionPlan');

  expect(forwardBtn).toBeEnabled();
  fireEvent.click(forwardBtn);
};

const executeStepSelectInstitutionUnreleated = async (partyName: string) => {
  console.log('Testing step select institution UNRELEATED');

  const newInstitutionAdhesion = await waitFor(() => screen.getByText('Registra un nuovo ente'));
  fireEvent.click(newInstitutionAdhesion);

  await waitFor(() => screen.getByText('Cerca il tuo ente'));
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
  const inputPartyName = document.getElementById('Parties');

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'XXX' } });

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));
  expect(fetchWithLogsSpy).toBeCalledTimes(4);

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Continua' });

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(5));
};

const executeStepSelectInstitutionReleated = async (partyName: string) => {
  console.log('Testing step select institution RELEATED');

  await waitFor(() => screen.getByText(stepSelectInstitutionReleatedTitle));
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(4));
  const inputPartyName = await waitFor(() => screen.getByText(partyName));

  expect(inputPartyName).toBeTruthy();

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));
  expect(fetchWithLogsSpy).toBeCalledTimes(4);

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
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
    'zipCode',
    'recipientCode',
    'supportEmail'
  );

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
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
    'zipCode',
    'recipientCode',
    'supportEmail'
  );

  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  await checkCorrectBodyBillingData(
    'businessNameInput',
    'registeredOfficeInput',
    'a@a.com',
    'AAAAAA44D55F456K',
    'AAAAAA44D55F456K',
    'AM23EIX'
  );

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(stepAddManagerTitle));
};

const executeStepAddManager = async (expectedSuccessfulSubmit: boolean) => {
  console.log('Testing step add manager');
  await waitFor(() => screen.getByText(stepAddManagerTitle));

  const confirmButton = screen.getByRole('button', { name: 'Continua' });

  await fillUserForm(confirmButton, 'LEGAL', 'bbBBBB00B00B000B', 'b@b.BB');

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
  await waitFor(() =>
    expect(mockedHistoryPush).toBeCalledWith('/onboarding/prod-io?partyExternalId=pending')
  );
};

const fillUserBillingDataForm = async (
  businessNameInput: string,
  registeredOfficeInput: string,
  mailPECInput: string,
  taxCodeInput: string,
  vatNumber: string,
  zipCodeInput: string,
  recipientCode: string,
  supportEmail: string
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
  fireEvent.change(document.getElementById(zipCodeInput), {
    target: { value: '09010' },
  });
  fireEvent.change(document.getElementById(recipientCode), {
    target: { value: 'AM23EIX' },
  });
  fireEvent.change(document.getElementById(supportEmail), { target: { value: 'a@a.it' } });
  // TODO: remove comment if REACT_APP_ENABLE_GEOTAXONOMY is true -- fireEvent.click(document.getElementById('national_geographicTaxonomies'));
};

const fillUserForm = async (
  confirmButton: HTMLElement,
  prefix: string,
  taxCode: string,
  email: string
) => {
  await waitFor(() =>
    expect((document.getElementById('LEGAL-email') as HTMLInputElement).value).toBe('m@ma.it')
  );
  expect((document.getElementById('LEGAL-taxCode') as HTMLInputElement).value).toBe(
    'RSOMRA80A01A794I'
  );
  expect((document.getElementById('LEGAL-name') as HTMLInputElement).value).toBe('Maria');
  expect((document.getElementById('LEGAL-surname') as HTMLInputElement).value).toBe('Rosa');

  expect(confirmButton).toBeEnabled();

  /*await fillTextFieldAndCheckButton(prefix, 'name', 'NAME', confirmButton, true);
  await fillTextFieldAndCheckButton(prefix, 'surname', 'SURNAME', confirmButton, true);
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode, confirmButton, true);
  await fillTextFieldAndCheckButton(prefix, 'email', email, confirmButton, true);*/

  expect(document.getElementById('LEGAL-name')).toBeEnabled();
  expect(document.getElementById('LEGAL-surname')).toBeEnabled();
  expect(document.getElementById('LEGAL-taxCode')).toBeEnabled();
  expect(document.getElementById('LEGAL-email')).toBeEnabled();
};

const checkCorrectBodyBillingData = (
  expectedBusinessName: string = '',
  expectedRegisteredOfficeInput: string = '',
  expectedMailPEC: string = '',
  expectedTaxCode: string = '',
  expectedVatNumber: string = '',
  expectedRecipientCode: string = ''
) => {
  expect((document.getElementById('businessName') as HTMLInputElement).value).toBe(
    expectedBusinessName
  );
  expect((document.getElementById('registeredOffice') as HTMLInputElement).value).toBe(
    expectedRegisteredOfficeInput
  );
  expect((document.getElementById('digitalAddress') as HTMLInputElement).value).toBe(
    expectedMailPEC
  );
  expect((document.getElementById('taxCode') as HTMLInputElement).value).toBe(expectedTaxCode);

  expect((document.getElementById('recipientCode') as HTMLInputElement).value).toBe(
    expectedRecipientCode
  );
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

const billingData2billingDataRequest = () => ({
  businessName: 'businessNameInput',
  registeredOffice: 'registeredOfficeInput',
  digitalAddress: 'a@a.com',
  zipCode: '09010',
  taxCode: 'AAAAAA44D55F456K',
  vatNumber: '12345678901',
  recipientCode: 'AM23EIX',
});

const verifySubmit = async () => {
  await waitFor(() =>
    expect(fetchWithLogsSpy).lastCalledWith(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
        endpointParams: { externalInstitutionId: 'id', productId: 'prod-io-premium' },
      },
      {
        method: 'POST',
        data: {
          users: [
            {
              name: 'Maria',
              surname: 'Rosa',
              role: 'MANAGER',
              taxCode: 'RSOMRA80A01A794I',
              email: 'm@ma.it',
            },
          ],
          billingData: billingData2billingDataRequest(),
          pspData: undefined,
          institutionType: 'PA',
          pricingPlan: 'C0',
          origin: 'IPA',
          geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
            ? [{ code: '100', desc: 'ITALIA' }]
            : [],
          assistanceContacts: { supportEmail: 'a@a.it' },
        },
      },
      expect.any(Function)
    )
  );
};
