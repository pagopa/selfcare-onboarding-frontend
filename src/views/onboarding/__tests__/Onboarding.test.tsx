import { fireEvent, getByLabelText, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import Onboarding from '../Onboarding';
import '../../../locale';
import { GeographicTaxonomy } from '../../../model/GeographicTaxonomies';

jest.mock('../../../lib/api-utils');
jest.setTimeout(30000);

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

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

beforeEach(() => Object.assign(mockedLocation, initialLocation));

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation) => Object.assign(mockedLocation, nextLocation),
  }),
}));

const renderComponent = (productId: string = 'prod-pn') => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);

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
          <Onboarding productId={productId} />
        </UserContext.Provider>
      </HeaderContext.Provider>
    );
  };

  render(<Component />);
};

const step1Title = 'Seleziona il tuo ente';
const stepInstitutionType = 'Seleziona il tipo di ente che rappresenti';
const stepBillingDataTitle = 'Indica i dati del tuo ente';
const step2Title = 'Indica il Legale Rappresentante';
const step3Title = "Indica l'Amministratore";
const completeSuccessTitle = 'Richiesta di adesione inviata';
const completeErrorTitle = 'Spiacenti, qualcosa è andato storto.';

const agencyOnboarded = 'AGENCY ONBOARDED';
const agencyInfoError = 'AGENCY INFO ERROR';
const agencyX = 'AGENCY X';
const agencyError = 'AGENCY ERROR';
const comune = 'Comune di Milano';

test('test already onboarded', async () => {
  renderComponent();
  await executeStepInstitutionType();
  await executeStep1(agencyOnboarded);
  await waitFor(() => screen.getByText("L'Ente che hai scelto ha già aderito"));
  await executeGoHome(false);
});

test('test error retrieving onboarding info', async () => {
  renderComponent();
  await executeStepInstitutionType();
  await executeStep1(agencyInfoError);
  await waitFor(() => screen.getByText('Spiacenti, qualcosa è andato storto.'));
  await executeGoHome(false);
});

test('test error productID', async () => {
  renderComponent('error');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('test complete', async () => {
  renderComponent();
  await executeStepInstitutionType();
  await executeStep1(agencyX);
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(true);
  await verifySubmit();
  await executeGoHome(true);
});

test('test complete with error on submit', async () => {
  renderComponent();
  await executeStepInstitutionType();
  await executeStep1(agencyError);
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(false);
  await executeGoHome(false);
});

test('test exiting during flow with unload event', async () => {
  renderComponent();
  await executeStepInstitutionType();
  await executeStep1(agencyX);
  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  await waitFor(
    () =>
      (event.returnValue as unknown as string) ===
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
  );
});

test('test exiting during flow with logout', async () => {
  renderComponent();
  await executeStepInstitutionType();

  await executeStep1(agencyX);

  expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull();

  const logoutButton = screen.getByRole('button', { name: 'LOGOUT' });
  await performLogout(logoutButton);

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());

  /* closeIcon not shown
  await performLogout(logoutButton);
  fireEvent.click(findRemoveAdditionUsersButtons()[0]); // to search closeIcon, same logic as searching remove additional delegate
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());
  */

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Esci' }));
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LOGOUT));
});

test('test advanvced search business name', async () => {
  renderComponent('prod-pn');
  await executeStepInstitutionType();
  await executeAdvancedSearchForBusinessName(agencyX);
});

test('test advanvced search taxcode', async () => {
  renderComponent('prod-pn');
  await executeStepInstitutionType();
  await executeAdvancedSearchForTaxCode(comune);
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
  const goHomeButton = !expectedSuccessfulSubmit
    ? screen.getByRole('button', {
        name: 'Chiudi',
      })
    : screen.getByRole('button', {
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
const executeStep1 = async (partyName: string) => {
  console.log('Testing step 1');

  screen.getByText(step1Title);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties');

  expect(inputPartyName).toBeTruthy();
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
      },
    },
    expect.any(Function)
  );

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
};

const executeAdvancedSearchForBusinessName = async (partyName: string) => {
  console.log('Testing step 1');

  screen.getByText(step1Title);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties');

  fireEvent.click(document.getElementById('businessName'));

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'XXX' } });

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));

  expect(fetchWithLogsSpy).toBeCalledTimes(2);

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
};

const executeAdvancedSearchForTaxCode = async (partyName: string) => {
  console.log('Testing step 1');

  screen.getByText(step1Title);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties');

  fireEvent.click(document.getElementById('taxcode'));

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: '33344455567' } });

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));

  expect(fetchWithLogsSpy).toBeCalledTimes(2);

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
};

const executeStepInstitutionType = async () => {
  console.log('Testing step Institution Type');
  await waitFor(() => screen.getByText(stepInstitutionType));

  await fillInstitutionTypeCheckbox('pa');

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButtonEnabled).toBeEnabled();

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(step1Title));
};

const executeStepBillingData = async () => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText(stepBillingDataTitle));
  await fillUserBillingDataForm(
    'businessName',
    'registeredOffice',
    'digitalAddress',
    'zipCode',
    'taxCode',
    'vatNumber',
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
    'zipCode',
    'taxCode',
    'vatNumber',
    'recipientCode',
    'supportEmail'
  );

  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  await checkCorrectBodyBillingData(
    'businessNameInput',
    'registeredOfficeInput',
    'a@a.it',
    '09010',
    'AAAAAA44D55F456K',
    'AAAAAA44D55F456K',
    'recipientCode'
  );
  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(step2Title));
};

const executeStep2 = async () => {
  console.log('Testing step 2');
  await waitFor(() => screen.getByText(step2Title));

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeDisabled();

  await checkCertifiedUserValidation('LEGAL', confirmButton);

  await fillUserForm(confirmButton, 'LEGAL', 'SRNNMA80A01A794F', 'b@b.BB', true);

  fireEvent.click(confirmButton);

  await waitFor(() => screen.getByText(step3Title));
};

const executeStep3 = async (expectedSuccessfulSubmit: boolean) => {
  console.log('Testing step 3');

  await waitFor(() => screen.getByText(step3Title));
  const [_, confirmButton] = await checkBackForwardNavigation(step2Title, step3Title);

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

  await waitFor(() => checkAdditionalUsers(confirmButton));

  await waitFor(() => expect(confirmButton).toBeEnabled());

  await waitFor(() => fireEvent.click(confirmButton));

  await waitFor(() =>
    screen.getByText(expectedSuccessfulSubmit ? completeSuccessTitle : completeErrorTitle)
  );
};

const checkCertifiedUserValidation = async (prefix: string, confirmButton: HTMLElement) => {
  await fillUserForm(confirmButton, prefix, 'FRRMRA80A01F205X', 'b@c.BB', false);
  await waitFor(() => screen.getByText('Nome non corretto o diverso dal Codice Fiscale'));
  screen.getByText('Cognome non corretto o diverso dal Codice Fiscale');
};

const fillInstitutionTypeCheckbox = async (pa: string, gsp: string, scp: string, pt: string) => {
  fireEvent.click(document.getElementById(pa));
};

const fillUserBillingDataForm = async (
  businessNameInput: string,
  registeredOfficeInput: string,
  mailPECInput: string,
  zipCode: string,
  taxCodeInput: string,
  vatNumber: string,
  recipientCode: string,
  supportEmail: string
) => {
  fireEvent.change(document.getElementById(businessNameInput), {
    target: { value: 'businessNameInput' },
  });
  fireEvent.change(document.getElementById(registeredOfficeInput), {
    target: { value: 'registeredOfficeInput' },
  });
  fireEvent.change(document.getElementById(mailPECInput), { target: { value: 'a@a.it' } });
  fireEvent.change(document.getElementById(zipCode), { target: { value: '09010' } });
  fireEvent.change(document.getElementById(taxCodeInput), {
    target: { value: 'AAAAAA44D55F456K' },
  });

  const isTaxCodeEquals2PIVA = document.getElementById('onboardingFormData');
  expect(isTaxCodeEquals2PIVA).toBeTruthy();

  fireEvent.change(document.getElementById(vatNumber), {
    target: { value: 'AAAAAA44D55F456K' },
  });
  fireEvent.change(document.getElementById(recipientCode), {
    target: { value: 'recipientCode' },
  });
  fireEvent.change(document.getElementById(supportEmail), { target: { value: 'a@a.it' } });
  // TODO: remove comment if REACT_APP_ENABLE_GEOTAXONOMY is true -- await waitFor(() => fireEvent.click(document.getElementById('national_geographicTaxonomies')));
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
  expectedEnabled?: boolean
) => {
  fireEvent.change(document.getElementById(`${prefix}-${field}`), { target: { value } });
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
  fireEvent.click(document.querySelector("input[type='checkbox']"));
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

const checkAdditionalUsersExistance = (
  expectedAdditionalUsersCount: number,
  expectedEmptyForm: boolean,
  confirmButton: HTMLElement
) => {
  const titles = screen.queryAllByTestId('extra-delegate');
  expect(titles.length).toBe(expectedAdditionalUsersCount);

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

const fillAdditionalUserAndCheckUniqueValues = async (
  index: number,
  confirmButton: HTMLElement
) => {
  const removeUserButtons = await addAdditionEmptyUser(index, confirmButton);
  const prefix = getByLabelText(
    removeUserButtons[index].parentElement.children[0] as HTMLElement,
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
  taxCode: 'AAAAAA44D55F456K',
  vatNumber: 'AAAAAA44D55F456K',
  recipientCode: 'recipientCode',
});

const verifySubmit = async () => {
  await waitFor(() =>
    expect(fetchWithLogsSpy).lastCalledWith(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
        endpointParams: { externalInstitutionId: 'id', productId: 'prod-pn' },
      },
      {
        data: {
          billingData: billingData2billingDataRequest(),
          pspData: undefined,
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
            ? [{ code: '100', desc: 'ITALIA' }]
            : [],
          assistanceContacts: { supportEmail: 'a@a.it' },
        },
        method: 'POST',
      },
      expect.any(Function)
    )
  );
};
