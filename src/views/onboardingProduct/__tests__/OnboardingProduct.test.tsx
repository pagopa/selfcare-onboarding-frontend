import React, { useEffect } from 'react';
import { fireEvent, getByLabelText, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import '@testing-library/jest-dom';
import { User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import OnboardingProduct from '../OnboardingProduct';
import '../../../locale';
import { nationalValue } from '../../../model/GeographicTaxonomies';
import { canInvoice, filterByCategory } from '../../../utils/constants';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

jest.mock('../../../lib/api-utils');
jest.setTimeout(40000);

let fetchWithLogsSpy: jest.SpyInstance;

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../../lib/api-utils'), 'fetchWithLogs');
});

const oldWindowLocation = global.window.location;
const initialLocation = {
  assign: jest.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '?pricingPlan=FA',
  hash: '',
  state: undefined,
};
const mockedLocation = Object.assign({}, initialLocation);
const mockedHistoryPush = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

beforeEach(() => Object.assign(mockedLocation, initialLocation));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation) => Object.assign(mockedLocation, nextLocation),
    push: mockedHistoryPush,
  }),
}));

const renderComponent = (productId: string = 'prod-pn') => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);

    const history = createMemoryHistory();

    return (
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
          <Router history={history}>
            <OnboardingProduct productId={productId} />
          </Router>
        </UserContext.Provider>
      </HeaderContext.Provider>
    );
  };

  render(<Component />);
  return { history };
};

test('Test: Successfull complete onboarding request of PA party for prod-io search by business name', async () => {
  renderComponent('prod-io');
  await executeStepInstitutionType('prod-io', 'pa');
  await executeStepSearchParty('prod-io', 'pa', 'AGENCY X', 'businessName');
  await executeStepBillingData('prod-io', 'pa');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit();
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of PA party for prod-io search by tax code', async () => {
  renderComponent('prod-io');
  await executeStepInstitutionType('prod-io', 'pa');
  await executeStepSearchParty(
    'prod-io',
    'pa',
    'Comune Di Milano',
    'taxCode',
    undefined,
    '33445673222'
  );
  await executeStepBillingData('prod-io', 'pa');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of AOO party for product prod-interop', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'pa');
  await executeStepSearchParty(
    'prod-interop',
    'pa',
    'denominazione aoo test 1',
    'aooCode',
    'A356E00'
  );
  await executeStepBillingData('prod-interop', 'pa', true);
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of UO party for product prod-io-sign', async () => {
  renderComponent('prod-io-sign');
  await executeStepInstitutionType('prod-io-sign', 'pa');
  await executeStepSearchParty('prod-io-sign', 'pa', 'denominazione uo test 1', 'uoCode', 'A1B2C3');
  await executeStepBillingData('prod-io-sign', 'pa', true);
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of GSP party from IPA for product prod-pagopa', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'gsp');
  await executeStepSearchParty('prod-pagopa', 'gsp', 'AGENCY X', 'businessName');
  await executeStepBillingData('prod-pagopa', 'gsp');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-pagopa');
  await executeGoHome(true);
});

// TODO TEST COMPLETE GSP WITHOUT USING IPA (STEP ADDITIONAL INFORMATION, RADIO WITH TEXTFIELD COMPONENT ETC)

// TODO TEST COMPLETE PT

// TODO TEST COMPLETE AS

// TODO TEST COMPLETE SA

// TODO TEST COMPLETE PSP

// TODO TEST COMPLETE SCP PDND INFOCAMERE

// TODO PA APP IO AGGREGATOR PARTY (IS AGGREGATE, UPLOAD AGGREGATE CSV ETC)

test.skip('Test: Error on submit onboarding request of pa party for prod-io', async () => {
  renderComponent('prod-io');
  await executeStepInstitutionType('prod-io', 'pa');
  await executeStepSearchParty('prod-io', 'pa', 'AGENCY ERROR', 'businessName');
  await executeStepBillingData('prod-io', 'pa');
  await executeStepAddManager();
  await executeStepAddAdmin(false);
  await verifySubmit();
  await executeGoHome(true);
});

test('Test: The addUser button in already onboarded party error page should redirect to add new user flow', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'pa');
  await executeStepSearchParty(
    'prod-pagopa',
    'pa',
    'AGENCY ONBOARDED',
    'businessName',
    undefined,
    undefined,
    true
  );
  await waitFor(() => screen.getByText(/L’ente selezionato ha già aderito/));

  // TODO ADD A TEST THAT CHECK IF THIS LINK IS AVAILABLE ONLY FOR THE PRODUCTS
  const addNewUser = screen.getByText('Aggiungi un nuovo Amministratore');
  await waitFor(() => fireEvent.click(addNewUser));

  expect(history.length).toBe(1);
});

test('Test: Error retrieving onboarding info', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'pa');
  await executeStepSearchParty(
    'prod-pagopa',
    'pa',
    'AGENCY INFO ERROR',
    'businessName',
    undefined,
    undefined,
    true
  );
  await waitFor(() => screen.getByText('Qualcosa è andato storto'));
  await executeGoHome(false);
});

test('Test: Search trying to type invalid characters', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'pa');
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'AGENCY X ())!/!/££!' } });

  await waitFor(() => screen.getByText('AGENCY X'));
});

test('Test: Invalid productId', async () => {
  renderComponent('error');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('Test: Exiting during flow with unload event', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'pa');
  await executeStepSearchParty('prod-pagopa', 'pa', 'AGENCY X', 'businessName');
  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  await waitFor(
    () =>
      (event.returnValue as unknown as string) ===
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
  );
});

test('Test: Exiting during flow with logout', async () => {
  renderComponent('prod-io');
  await executeStepInstitutionType('prod-io', 'pa');

  await executeStepSearchParty('prod-io', 'pa', 'AGENCY X', 'businessName');

  expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull();

  const logoutButton = screen.getByText('LOGOUT');
  await performLogout(logoutButton);

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Esci' }));
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LOGOUT));
});

test('Test: RecipientCode input client validation', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'pa');
  await executeStepSearchParty('prod-pagopa', 'pa', 'AGENCY X', 'businessName');
  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  fireEvent.click(confirmButtonEnabled);

  const recipientCodeInput = document.getElementById('recipientCode') as HTMLInputElement;

  fireEvent.input(recipientCodeInput, { target: { value: 'abc123!@#' } });
  expect(recipientCodeInput.value).toBe('ABC123');

  fireEvent.input(recipientCodeInput, { target: { value: '!@#$%^&*' } });
  expect(recipientCodeInput.value).toBe('');

  fireEvent.input(recipientCodeInput, { target: { value: 'ab@c1#2' } });
  expect(recipientCodeInput.value).toBe('ABC12');

  fireEvent.input(recipientCodeInput, { target: { value: 'AB123CD' } });
  expect(recipientCodeInput.value).toBe('AB123CD');
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
  expect(confirmButton).toBeDisabled();

  return [goBackButton, confirmButton];
};

const executeGoHome = async (expectedSuccessfulSubmit) => {
  console.log('Go Home');
  const goHomeButton = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  expect(goHomeButton).toBeEnabled();
  fireEvent.click(goHomeButton);
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING));
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
    name: 'Continua',
  });
  await waitFor(() => expect(goForwardButton).toBeEnabled());
  fireEvent.click(goForwardButton);

  await waitFor(() => screen.getByText(actualStepTitle));

  return retrieveNavigationButtons();
};

const executeStepInstitutionType = async (productSelected: string, institutionType: string) => {
  await waitFor(() => screen.getByText('Seleziona il tipo di ente che rappresenti'));

  if (productSelected !== 'prod-pn' && productSelected !== 'prod-idpay') {
    await fillInstitutionTypeCheckbox('pa');
    screen.getByText(/Indica il tipo di ente che aderirà a/);
    const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
    expect(confirmButtonEnabled).toBeEnabled();

    fireEvent.click(confirmButtonEnabled);
  }
};

const executeStepSearchParty = async (
  productId: string,
  institutionType: string,
  partyName: string,
  typeOfSearch: 'businessName' | 'taxCode' | 'aooCode' | 'uoCode',
  subUnitCode?: string,
  taxCode?: string,
  expectedError: boolean = false
) => {
  console.log('Testing step 1');
  screen.getByText('Cerca il tuo ente');

  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  switch (typeOfSearch) {
    case 'businessName':
      fireEvent.change(inputPartyName, { target: { value: 'XXX' } });

      const partyNameSelection = await waitFor(() => screen.getByText(partyName));

      expect(fetchWithLogsSpy).toBeCalledTimes(2);

      expect(fetchWithLogsSpy).toHaveBeenCalledWith(
        { endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' },
        {
          method: 'GET',
          params: {
            limit: ENV.MAX_INSTITUTIONS_FETCH,
            page: 1,
            search: 'XXX',
            categories: filterByCategory(institutionType, productId),
          },
        },
        expect.any(Function)
      );
      fireEvent.click(partyNameSelection);
      break;
    case 'taxCode':
    case 'aooCode':
    case 'uoCode':
      const selectWrapper = document.getElementById('party-type-select');
      const input = selectWrapper?.firstChild as HTMLElement;
      fireEvent.keyDown(input, { keyCode: 40 });

      const option = document.getElementById(typeOfSearch) as HTMLElement;
      fireEvent.click(option);

      fireEvent.change(inputPartyName, {
        target: { value: typeOfSearch === 'taxCode' ? taxCode : subUnitCode },
      });

      const partyNameSelect = await waitFor(() =>
        screen.getByText(typeOfSearch === 'taxCode' ? partyName.toLowerCase() : partyName)
      );

      const endpoint =
        typeOfSearch === 'taxCode'
          ? 'ONBOARDING_GET_PARTY_FROM_CF'
          : typeOfSearch === 'aooCode'
          ? 'ONBOARDING_GET_AOO_CODE_INFO'
          : 'ONBOARDING_GET_UO_CODE_INFO';

      const endpointParams =
        typeOfSearch === 'taxCode'
          ? { id: taxCode }
          : typeOfSearch === 'aooCode'
          ? { codiceUniAoo: subUnitCode }
          : { codiceUniUo: subUnitCode };

      const params =
        typeOfSearch === 'taxCode'
          ? {
              productId: undefined,
              subunitCode: undefined,
              taxCode,
            }
          : {
              origin: 'IPA',
              categories: filterByCategory(institutionType, productId),
            };

      expect(fetchWithLogsSpy).toBeCalledTimes(2);

      expect(fetchWithLogsSpy).toHaveBeenCalledWith(
        { endpoint, endpointParams },
        {
          method: 'GET',
          params,
        },
        expect.any(Function)
      );

      fireEvent.click(partyNameSelect);
      break;
    default:
      return '';
  }

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  await waitFor(() => fireEvent.click(confirmButton));

  await waitFor(() =>
    expect(fetchWithLogsSpy).toBeCalledTimes(expectedError ? 3 : typeOfSearch === 'uoCode' ? 7 : 5)
  );
};

const executeStepBillingData = async (
  productId: string,
  institutionType: string,
  isAooUo: boolean = false
) => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText('Inserisci i dati dell’ente'));
  // TODO MANAGE ALL CASES
  if (!isAooUo) {
    await fillUserBillingDataForm(
      'businessName',
      'registeredOffice',
      'digitalAddress',
      'zipCode',
      'taxCode',
      'vatNumber',
      'recipientCode',
      'supportEmail',
      'city',
      'province'
    );
  } else {
    fireEvent.change(document.getElementById('vatNumber') as HTMLElement, {
      target: { value: '11111111111' },
    });
    fireEvent.change(document.getElementById('supportEmail') as HTMLElement, {
      target: { value: 'mail@mailtest.com' },
    });
  }

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });

  const isInvoicable = canInvoice(institutionType, productId);

  if (isInvoicable) {
    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: 'A1B2C3' },
    });
    await waitFor(() =>
      expect(document.getElementById('taxCodeInvoicing')).toHaveValue('87654321098')
    );
    await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: '' },
    });
    expect(document.getElementById('taxCodeInvoicing') as HTMLInputElement).not.toBeInTheDocument();

    await waitFor(() => expect(confirmButtonEnabled).toBeDisabled());

    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: 'AABBC1' },
    });
    await waitFor(() => screen.getByText('Il codice inserito non è associato al tuo ente'));

    expect(document.getElementById('taxCodeInvoicing') as HTMLInputElement).not.toBeInTheDocument();

    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: '2A3B4C' },
    });

    expect(document.getElementById('taxCodeInvoicing') as HTMLInputElement).not.toBeInTheDocument();

    await waitFor(() =>
      screen.getByText(
        'Il codice inserito è associato al codice fiscale di un ente che non ha il servizio di fatturazione attivo'
      )
    );

    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: 'A1B2C31' },
    });

    await waitFor(() =>
      expect(
        document.getElementById('taxCodeInvoicing') as HTMLInputElement
      ).not.toBeInTheDocument()
    );

    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: 'A1B2C3' },
    });

    await waitFor(() =>
      expect(document.getElementById('taxCodeInvoicing') as HTMLInputElement).toBeInTheDocument()
    );
    expect(document.getElementById('taxCodeInvoicing') as HTMLInputElement).toBeDisabled();

    fireEvent.change(document.getElementById('taxCodeInvoicing') as HTMLInputElement, {
      target: { value: '87654321092' },
    });
    await waitFor(() => screen.getByText('Il Codice Fiscale inserito non è relativo al tuo ente'));

    await waitFor(() => expect(confirmButtonEnabled).toBeDisabled());

    fireEvent.change(document.getElementById('taxCodeInvoicing') as HTMLElement, {
      target: { value: '87654321098' },
    });
  }

  // TODO MANAGE ALL CASES
  if (!isAooUo) {
    await checkCorrectBodyBillingData(
      'businessNameInput',
      'registeredOfficeInput',
      'a@a.it',
      '09010',
      '00000000000',
      '00000000000',
      'A1B2C3'
    );
  }

  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());
  fireEvent.click(confirmButtonEnabled);
};

const executeStepAddManager = async () => {
  console.log('Testing step 2');
  await waitFor(() => screen.getByText('Indica il Legale Rappresentante'));

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeDisabled();

  await checkCertifiedUserValidation('LEGAL', confirmButton);

  await fillUserForm(confirmButton, 'LEGAL', 'SRNNMA80A01A794F', 'b@b.BB', true);

  fireEvent.click(confirmButton);
};

const executeStepAddAdmin = async (expectedSuccessfulSubmit: boolean, isTechPartner = false) => {
  console.log('Testing step 3');

  await waitFor(() => screen.getByText("Indica l'Amministratore"));
  const [_, confirmButton] = await checkBackForwardNavigation(
    'Indica il Legale Rappresentante',
    "Indica l'Amministratore"
  );

  const addDelegateButton = screen.getByRole('button', {
    name: 'Aggiungi un altro Amministratore',
  });
  expect(addDelegateButton).toBeDisabled();
  await checkLoggedUserAsAdminCheckbox(confirmButton, addDelegateButton);

  await checkCertifiedUserValidation('delegate-initial', confirmButton);

  await fillUserForm(
    confirmButton,
    'delegate-initial',
    'SRNNMA80A01B354S',
    'a@a.AA',
    true,
    'SRNNMA80A01A794F',
    1,
    'b@b.bb',
    1
  );

  await waitFor(() => expect(confirmButton).toBeEnabled());

  expect(addDelegateButton).toBeEnabled();
  await waitFor(() => checkAdditionalUsers(confirmButton));

  await waitFor(() => fireEvent.click(confirmButton));

  const confimationModalBtn = await waitFor(() => screen.getByText('Conferma'));

  await waitFor(() => fireEvent.click(confimationModalBtn));

  await waitFor(() =>
    screen.getByText(
      isTechPartner
        ? 'Richiesta di registrazione inviata'
        : expectedSuccessfulSubmit
        ? 'Richiesta di adesione inviata'
        : 'Qualcosa è andato storto.'
    )
  );
};

const checkCertifiedUserValidation = async (prefix: string, confirmButton: HTMLElement) => {
  await fillUserForm(confirmButton, prefix, 'FRRMRA80A01F205X', 'b@c.BB', false);
  await waitFor(() => screen.getByText('Nome non corretto o diverso dal Codice Fiscale'));
  screen.getByText('Cognome non corretto o diverso dal Codice Fiscale');
};

const fillInstitutionTypeCheckbox = async (element: string) => {
  const selectedInstitutionType = document.getElementById(element) as HTMLElement;
  expect(selectedInstitutionType).not.toBeChecked();
  fireEvent.click(selectedInstitutionType);
  await waitFor(() => expect(selectedInstitutionType).toBeChecked());
};

const fillUserBillingDataForm = async (
  businessNameInput: string,
  registeredOfficeInput: string,
  mailPECInput: string,
  zipCode: string,
  taxCodeInput: string,
  vatNumber: string,
  recipientCode: string,
  supportEmail?: string,
  rea?: string,
  city?: string,
  province?: string
) => {
  fireEvent.change(document.getElementById(businessNameInput) as HTMLElement, {
    target: { value: 'businessNameInput' },
  });
  fireEvent.change(document.getElementById(registeredOfficeInput) as HTMLElement, {
    target: { value: 'registeredOfficeInput' },
  });
  fireEvent.change(document.getElementById(mailPECInput) as HTMLElement, {
    target: { value: 'a@a.it' },
  });
  fireEvent.change(document.getElementById(zipCode) as HTMLElement, { target: { value: '09010' } });
  fireEvent.change(document.getElementById(taxCodeInput) as HTMLElement, {
    target: { value: '00000000000' },
  });

  const isTaxCodeEquals2PIVA = document.getElementById('taxCodeEquals2VatNumber');
  expect(isTaxCodeEquals2PIVA).toBeTruthy();

  fireEvent.change(document.getElementById(vatNumber) as HTMLElement, {
    target: { value: '00000000000' },
  });

  fireEvent.change(document.getElementById(recipientCode) as HTMLElement, {
    target: { value: 'A1B2C3D' },
  });
  const searchCitySelect = document.getElementById('city-select');
  if (searchCitySelect) {
    fireEvent.change(searchCitySelect as HTMLInputElement, { target: { value: 'desc1' } });
  }

  if (province) {
    fireEvent.change(document.getElementById(province) as HTMLElement, {
      target: { value: 'RM' },
    });
  }
  if (supportEmail) {
    fireEvent.change(document.getElementById(supportEmail) as HTMLInputElement, {
      target: { value: 'a@a.it' },
    });
  }
};

const fillUserForm = async (
  confirmButton: HTMLElement,
  prefix: string,
  taxCode: string,
  email: string,
  expectedEnabled?: boolean,
  existentTaxCode?: string,
  expectedDuplicateTaxCodeMessages?: number,
  existentEmail?: string,
  expectedDuplicateEmailMessages?: number
) => {
  await fillTextFieldAndCheckButton(prefix, 'name', 'NAME', confirmButton, expectedEnabled);
  await fillTextFieldAndCheckButton(prefix, 'surname', 'SURNAME', confirmButton, expectedEnabled);
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode, confirmButton, expectedEnabled);
  await fillTextFieldAndCheckButton(prefix, 'email', email, confirmButton, expectedEnabled);

  await fillTextFieldAndCheckButton(prefix, 'taxCode', '', confirmButton, false);
  await fillTextFieldAndCheckButton(prefix, 'taxCode', 'INVALIDTAXCODE', confirmButton, false);
  screen.getByText('Il Codice Fiscale inserito non è valido');
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode, confirmButton, expectedEnabled);

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
    const duplicateTaxCodeErrors = screen.queryAllByText(
      'Il codice fiscale inserito è già presente'
    );
    expect(duplicateTaxCodeErrors.length).toBe(expectedDuplicateTaxCodeMessages);
  }
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode, confirmButton, true);

  if (existentEmail) {
    await fillTextFieldAndCheckButton(prefix, 'email', existentEmail, confirmButton, false);
    const duplicateEmailErrors = screen.queryAllByText("L'indirizzo email inserito è già presente");
    expect(duplicateEmailErrors.length).toBe(expectedDuplicateEmailMessages);
  }
  await fillTextFieldAndCheckButton(prefix, 'email', email, confirmButton, true);
};

const fillTextFieldAndCheckButton = async (
  prefix: string,
  field: string,
  value: string,
  confirmButton: HTMLElement,
  expectedEnabled?: boolean
) => {
  fireEvent.change(document.getElementById(`${prefix}-${field}`) as HTMLElement, {
    target: { value },
  });
};

const checkLoggedUserAsAdminCheckbox = async (
  confirmButton: HTMLElement,
  addDelegateButton: HTMLElement
) => {
  clickAdminCheckBoxAndTestValues(
    confirmButton,
    addDelegateButton,
    'loggedName',
    'loggedSurname',
    'LGGLGD80A01B354S'
  );

  await fillTextFieldAndCheckButton('delegate-initial', 'email', 'a@a.aa', confirmButton, true);
  expect(addDelegateButton).toBeEnabled();

  await clickAdminCheckBoxAndTestValues(confirmButton, addDelegateButton, '', '', '');
};

const checkCorrectBodyBillingData = (
  expectedBusinessName: string = '',
  expectedRegisteredOfficeInput: string = '',
  expectedMailPEC: string = '',
  expectedZipCode: string = '',
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
  expect((document.getElementById('zipCode') as HTMLInputElement).value).toBe(expectedZipCode);
  expect((document.getElementById('taxCode') as HTMLInputElement).value).toBe(expectedTaxCode);
  expect((document.getElementById('vatNumber') as HTMLInputElement).value).toBe(expectedVatNumber);
  expect((document.getElementById('recipientCode') as HTMLInputElement).value).toBe(
    expectedRecipientCode
  );
};

const clickAdminCheckBoxAndTestValues = (
  confirmButton: HTMLElement,
  addDelegateButton: HTMLElement,
  expectedName: string = '',
  expectedSurname: string = '',
  expectedTaxCode: string = ''
) => {
  fireEvent.click(document.querySelector("input[type='checkbox']") as HTMLElement);
  expect((document.getElementById('delegate-initial-name') as HTMLInputElement).value).toBe(
    expectedName
  );
  expect((document.getElementById('delegate-initial-surname') as HTMLInputElement).value).toBe(
    expectedSurname
  );
  expect((document.getElementById('delegate-initial-taxCode') as HTMLInputElement).value).toBe(
    expectedTaxCode
  );
  expect((document.getElementById('delegate-initial-email') as HTMLInputElement).value).toBe('');
  expect(confirmButton).toBeDisabled();
  expect(addDelegateButton).toBeDisabled();
};

const checkAdditionalUsers = async (confirmButton: HTMLElement) => {
  console.log('Adding additional user');
  await checkRemovingEmptyAdditionalUser(0, confirmButton);

  await fillAdditionalUserAndCheckUniqueValues(0, confirmButton);
};

const checkRemovingEmptyAdditionalUser = async (index: number, confirmButton: HTMLElement) => {
  const removeUserButtons = await addAdditionEmptyUser(index, confirmButton);
  fireEvent.click(removeUserButtons[index]);

  await checkAdditionalUsersExistance(index, false, confirmButton);
};

const addAdditionEmptyUser = async (
  index: number,
  confirmButton: HTMLElement
): Promise<Array<HTMLElement>> => {
  await checkAdditionalUsersExistance(index, false, confirmButton);
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi un altro Amministratore' }));

  const removeUserButtons = findRemoveAdditionUsersButtons();
  expect(removeUserButtons.length).toBe(index + 1);
  return removeUserButtons;
};

const checkAdditionalUsersExistance = async (
  expectedAdditionalUsersCount: number,
  expectedEmptyForm: boolean,
  confirmButton: HTMLElement
) => {
  const titles = screen.queryAllByTestId('extra-delegate');
  await waitFor(() => expect(titles.length).toBe(expectedAdditionalUsersCount));

  const isAddUsersVisible = expectedAdditionalUsersCount < 2;
  const addDelegateButton = screen.queryByRole('button', {
    name: 'Aggiungi un altro Amministratore',
  });
  if (!isAddUsersVisible) {
    expect(addDelegateButton).toBeNull();
  }
  if (expectedEmptyForm) {
    expect(confirmButton).toBeDisabled();
    if (isAddUsersVisible) {
      expect(addDelegateButton).toBeDisabled();
    }
  } else {
    expect(confirmButton).toBeEnabled();
    if (isAddUsersVisible) {
      expect(addDelegateButton).toBeEnabled();
    }
  }
};

const findRemoveAdditionUsersButtons = () =>
  screen
    .getAllByRole('button')
    .filter((b) => b.children.length > 0 && b.children[0].tagName === 'svg');

const searchUserFormFromRemoveBtn = (removeButton: HTMLElement) => {
  if (!removeButton) {
    return null;
  } else {
    const parent = removeButton.parentElement as HTMLElement;
    if (parent.getAttribute('role') === 'add-delegate-form') {
      return parent;
    } else {
      return searchUserFormFromRemoveBtn(parent);
    }
  }
};
const fillAdditionalUserAndCheckUniqueValues = async (
  index: number,
  confirmButton: HTMLElement
) => {
  const removeUserButtons = await addAdditionEmptyUser(index, confirmButton);

  const prefix = getByLabelText(
    searchUserFormFromRemoveBtn(removeUserButtons[index]),
    'Nome'
  ).id.replace(/-name$/, '');

  await checkCertifiedUserValidation(prefix, confirmButton);

  const taxCode = 'SRNNMA80A01F205T';
  const email = '0@z.zz';
  await fillUserForm(
    confirmButton,
    prefix,
    taxCode,
    email,
    true,
    'SRNNMA80A01A794F',
    1,
    'b@b.bb',
    1
  );
  await checkAlreadyExistentValues(
    prefix,
    confirmButton,
    'SRNNMA80A01A794F',
    taxCode,
    1,
    'a@a.aa',
    email,
    2
  );
  await checkAlreadyExistentValues(
    prefix,
    confirmButton,
    'SRNNMA80A01A794F',
    taxCode,
    1,
    'a@a.aa',
    email,
    2
  );
};

const billingData2billingDataRequest = () => ({
  businessName: 'businessNameInput',
  registeredOffice: 'registeredOfficeInput',
  digitalAddress: 'a@a.it',
  zipCode: '09010',
  taxCode: '00000000000',
  taxCodeInvoicing: '87654321098',
  vatNumber: '00000000000',
  recipientCode: 'A1B2C3'.toUpperCase(),
});

const verifySubmit = async (productId = 'prod-io') => {
  await waitFor(() =>
    expect(fetchWithLogsSpy).lastCalledWith(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
      },
      {
        data: {
          billingData: billingData2billingDataRequest(),
          pspData: undefined,
          originId: '991',
          institutionType: 'PA',
          origin: 'IPA',
          users: [
            {
              email: 'b@b.bb',
              name: 'NAME',
              role: 'MANAGER',
              surname: 'SURNAME',
              taxCode: 'SRNNMA80A01A794F',
            },
            {
              email: 'a@a.aa',
              name: 'NAME',
              role: 'DELEGATE',
              surname: 'SURNAME',
              taxCode: 'SRNNMA80A01B354S',
            },
            {
              email: '0@z.zz',
              name: 'NAME',
              role: 'DELEGATE',
              surname: 'SURNAME',
              taxCode: 'SRNNMA80A01F205T',
            },
          ],
          pricingPlan: 'FA',
          geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
            ? [{ code: nationalValue, desc: 'ITALIA' }]
            : [],
          institutionLocationData: {
            city: 'Palermo',
            country: 'IT',
            county: 'PA',
          },
          assistanceContacts: { supportEmail: 'a@a.it' },
          productId,
          subunitCode: undefined,
          subunitType: undefined,
          taxCode: '00000000000',
          companyInformations: undefined,
          aggregates: undefined,
          additionalInformations: undefined,
          isAggregator: undefined,
        },
        method: 'POST',
      },
      expect.any(Function)
    )
  );
};

const verifySubmitPt = async (productId = 'prod-io-sign') => {
  await waitFor(() =>
    expect(fetchWithLogsSpy).lastCalledWith(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
      },
      {
        data: {
          billingData: billingData2billingDataRequest(),
          pspData: undefined,
          institutionType: 'PT',
          origin: undefined,
          users: [
            {
              email: 'b@b.bb',
              name: 'NAME',
              role: 'MANAGER',
              surname: 'SURNAME',
              taxCode: 'SRNNMA80A01A794F',
            },
            {
              email: 'a@a.aa',
              name: 'NAME',
              role: 'DELEGATE',
              surname: 'SURNAME',
              taxCode: 'SRNNMA80A01B354S',
            },
            {
              email: '0@z.zz',
              name: 'NAME',
              role: 'DELEGATE',
              surname: 'SURNAME',
              taxCode: 'SRNNMA80A01F205T',
            },
          ],
          pricingPlan: 'FA',
          geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
            ? [{ code: nationalValue, desc: 'ITALIA' }]
            : [],
          assistanceContacts: { supportEmail: undefined },
          productId,
          subunitCode: undefined,
          subunitType: undefined,
          taxCode: '00000000000',
          companyInformations: {
            businessRegisterPlace: undefined,
            rea: undefined,
            shareCapital: undefined,
          },
        },
        method: 'POST',
      },
      expect.any(Function)
    )
  );
};
