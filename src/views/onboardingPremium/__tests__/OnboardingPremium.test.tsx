import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import OnboardingPremium from '../OnboardingPremium';
import '../../../locale';
import { Route, Router, Switch } from 'react-router';
import { createMemoryHistory } from 'history';
import { nationalValue } from '../../../model/GeographicTaxonomies';
import React from 'react';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';

jest.setTimeout(20000);

const oldWindowLocation = global.window.location;
const initialLocation = {
  assign: jest.fn(),
  pathname: '/:productId/:subProductId',
  origin: 'MOCKED_ORIGIN',
  // search: '?pricingPlan=C1',
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
const successOnboardingSubProductTitle = 'La richiesta di adesione è stata inviata con successo';
const errorOnboardingSubProductTitle = 'Qualcosa è andato storto';

test('Test: Bad productId and subProductId', async () => {
  renderComponent('prod-io', 'prod-io');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(4));
  await waitFor(() => screen.findByText('Impossibile individuare il prodotto desiderato'));
});

test('Test: Error retrieving onboarding info', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  // // await executeStepSelectPricingPlan();
  await executeStepSelectInstitution('Comune di Gessate');
  await waitFor(() => screen.getByText('Qualcosa è andato storto'));
  await executeClickCloseButton(false);
});

test('Test: Successfully complete onboarding request', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  // // await executeStepSelectPricingPlan();
  await executeStepSelectInstitution('Comune di Milano');
  await executeStepBillingDataWithTaxCodeInvoicing();
  await executeStepAddManager(true);
  await executeClickCloseButton(true);
  await verifySubmitPostLegals();
});

test('Test: Complete onboarding request with error on submit', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  // await executeStepSelectPricingPlan();
  await executeStepSelectInstitution('Comune di Udine');
  await executeStepBillingDataWithoutTaxCodeInvoicing();
  await executeStepAddManager(false);
  await executeClickHomeButton();
});

test('Test: exiting during flow with unload event', async () => {
  renderComponent('prod-io', 'prod-io-premium');
  // await executeStepSelectPricingPlan();
  await executeStepSelectInstitution('Comune di Milano');

  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  await waitFor(
    () =>
      (event.returnValue as unknown as string) ===
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
  );
});

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

const checkBackForwardNavigation = async (title: string): Promise<Array<HTMLElement>> => {
  const [goBackButton] = await retrieveNavigationButtons();
  expect(goBackButton).toBeEnabled();
  fireEvent.click(goBackButton);

  screen.getByText(title);
  const goForwardButton = screen.getByRole('button', {
    name: 'Continua',
  });
  expect(goForwardButton).toBeEnabled();
  await waitFor(() => fireEvent.click(goForwardButton));

  return await retrieveNavigationButtons();
};

const executeStepSelectPricingPlan = async () => {
  console.log('Testing step select pricing plan...');

  const mockRetrievePlanPrices = {
    consumptionPlan: {
      pricingPlan: 'C0',
      echelons: [
        {
          from: '1',
          to: '100.000',
          price: '0,25',
        },
        {
          from: '100.001',
          to: '500.000',
          price: '0,24',
        },
        {
          from: '500.001',
          to: '1.000.000',
          price: '0,22',
        },
        {
          from: '1.000.001',
          to: '1.500.000',
          price: '0,20',
        },
        {
          from: '1.500.001',
          to: '2.000.000',
          price: '0,18',
        },
        {
          from: '2.000.001',
          to: '5.000.000',
          price: '0,15',
        },
        {
          from: '5.000.000',
          to: '',
          price: '0,11',
        },
      ],
    },
    carnetPlans: [
      {
        pricingPlan: 'C1',
        messages: '1.000',
        messagePrice: '0,22',
        carnetPrice: '220,00',
      },
      {
        pricingPlan: 'C2',
        messages: '10.000',
        messagePrice: '0,218',
        carnetPrice: '2.175,00',
      },
      {
        pricingPlan: 'C3',
        messages: '50.000',
        messagePrice: '0,215',
        carnetPrice: '10.750,00',
      },
      {
        pricingPlan: 'C4',
        messages: '100.000',
        messagePrice: '0,213',
        carnetPrice: '21.250,00',
      },
      {
        pricingPlan: 'C5',
        messages: '250.000',
        messagePrice: '0,210',
        carnetPrice: '52.500,00',
      },
      {
        pricingPlan: 'C6',
        messages: '500.000',
        messagePrice: '0,205',
        carnetPrice: '102.500,00',
      },
      {
        pricingPlan: 'C7',
        messages: '1.000.000',
        messagePrice: '0,2',
        carnetPrice: '200.000,00',
      },
      {
        pricingPlan: 'C8',
        messages: '3.000.000',
        messagePrice: '0,16',
        carnetPrice: '480.000,00',
      },
    ],
  };

  global.fetch = jest.fn().mockResolvedValueOnce({
    json: () => Promise.resolve(mockRetrievePlanPrices),
  });

  await waitFor(() =>
    screen.getByText(/Passa a IO Premium e migliora le performance dei messaggi/)
  );

  const showMoreCarnet = document.getElementById('showMoreCarnetPlan') as HTMLElement;
  fireEvent.click(showMoreCarnet);

  await waitFor(() =>
    mockRetrievePlanPrices.carnetPlans.forEach((c) =>
      expect(document.getElementById(c.pricingPlan) as HTMLElement).toBeInTheDocument()
    )
  );

  await waitFor(() => screen.getByText('1.000'));

  const forwardWithCarnet = document.getElementById('forwardCarnetPlan') as HTMLElement;
  expect(forwardWithCarnet).toBeDisabled();

  const carnetPlan = document.getElementById('C1') as HTMLElement;
  fireEvent.click(carnetPlan);
  expect(forwardWithCarnet).toBeEnabled();

  const showMoreConsumption = document.getElementById('showMoreConsumptionPlan') as HTMLElement;
  fireEvent.click(showMoreConsumption);

  await waitFor(() =>
    mockRetrievePlanPrices.consumptionPlan.echelons.forEach((c) =>
      expect(screen.getByText(c.price.slice(-2).concat('€ / mess'))).toBeInTheDocument()
    )
  );

  const chooseConsumption = document.getElementById('forwardConsumptionPlan') as HTMLElement;
  expect(chooseConsumption).toBeEnabled();
  fireEvent.click(chooseConsumption);
};

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

const executeStepBillingDataWithTaxCodeInvoicing = async () => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText(stepBillingDataTitle));

  const partyWithoutVatNumberCheckbox = screen.getByLabelText('Il mio ente non ha la partita IVA');
  fireEvent.click(partyWithoutVatNumberCheckbox);
  expect(partyWithoutVatNumberCheckbox).toBeChecked();

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });

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
  console.log('Testing step add manager');
  await waitFor(() => screen.getByText(stepAddManagerTitle));

  const continueButton = screen.getByRole('button', { name: 'Continua' });

  expect(continueButton).toBeDisabled();

  await fillUserForm();

  expect(continueButton).toBeEnabled();
  fireEvent.click(continueButton);

  await waitFor(() => screen.getByText('Confermi la richiesta di invio?'));
  const confirmButton = screen.getByRole('button', { name: 'Conferma' });
  await waitFor(() => fireEvent.click(confirmButton));

  await waitFor(() =>
    screen.getByText(
      expectedSuccessfulSubmit ? successOnboardingSubProductTitle : errorOnboardingSubProductTitle
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
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING));
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
    expect(mockedHistoryPush).toBeCalledWith('/onboarding/prod-io?partyExternalId=externalId3')
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
  fireEvent.change(document.getElementById(businessNameInput) as HTMLElement, {
    target: { value: 'businessNameInput' },
  });
  fireEvent.change(document.getElementById(registeredOfficeInput) as HTMLElement, {
    target: { value: 'registeredOfficeInput' },
  });
  fireEvent.change(document.getElementById(mailPECInput) as HTMLElement, {
    target: { value: 'a@a.com' },
  });
  fireEvent.change(document.getElementById(taxCodeInput) as HTMLElement, {
    target: { value: 'AAAAAA44D55F456K' },
  });
  fireEvent.change(document.getElementById(zipCodeInput) as HTMLElement, {
    target: { value: '09010' },
  });
  fireEvent.change(document.getElementById(recipientCode) as HTMLElement, {
    target: { value: 'AM23EIX' },
  });
  fireEvent.change(document.getElementById(supportEmail) as HTMLElement, {
    target: { value: 'a@a.it' },
  });
  fireEvent.click(document.getElementById('national_geographicTaxonomies'));
};

const fillTextFieldAndCheck = async (prefix: string, field: string, value: string) => {
  fireEvent.change(document.getElementById(`${prefix}-${field}`) as HTMLElement, {
    target: { value },
  });
};
const fillUserForm = async () => {
  await fillTextFieldAndCheck('LEGAL', 'email', 'm@ma.it');
  await fillTextFieldAndCheck('LEGAL', 'taxCode', 'RSSMRA80A01H501U');
  await fillTextFieldAndCheck('LEGAL', 'name', 'Mario');
  await fillTextFieldAndCheck('LEGAL', 'surname', 'Rossi');
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
  fireEvent.change(document.getElementById(`${prefix}-${field}`) as HTMLElement, {
    target: { value },
  });
  if (expectedEnabled) {
    expect(confirmButton).toBeEnabled();
  } else {
    expect(confirmButton).toBeDisabled();
  }
};

const billingData2billingDataRequest = () => ({
  businessName: 'Comune di Milano',
  registeredOffice: 'Milano, Piazza Colonna 370',
  digitalAddress: 'comune.milano@pec.it',
  zipCode: '20021',
  taxCode: '33445673222',
  taxCodeInvoicing: '87654321098',
  vatNumber: undefined,
  recipientCode: 'A1B2C3',
});

const verifySubmitPostLegals = async () => {

  await waitFor(() =>
    expect(fetchWithLogsSpy).lastCalledWith(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
      },
      {
        method: 'POST',
        data: {
          users: [
            {
              name: 'Mario',
              surname: 'Rossi',
              role: 'MANAGER',
              taxCode: 'RSSMRA80A01H501U',
              email: 'm@ma.it',
            },
          ],
          billingData: billingData2billingDataRequest(),
          pspData: undefined,
          institutionLocationData: {
            city: 'Milano',
            country: 'IT',
            county: 'MI',
          },
          institutionType: 'PA',
          pricingPlan: "C0",
          origin: 'IPA',
          geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
            ? [{ code: nationalValue, desc: 'ITALIA' }]
            : [],
          assistanceContacts: { supportEmail: 'comune.bollate@pec.it' },
          productId: 'prod-io-premium',
          subunitCode: undefined,
          subunitType: undefined,
          taxCode: '33445673222',
          companyInformations: undefined,
        },
      },
      expect.any(Function)
    )
  );
};
