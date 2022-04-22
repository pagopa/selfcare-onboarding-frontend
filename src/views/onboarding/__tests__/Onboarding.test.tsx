import { fireEvent, getByLabelText, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import Onboarding from '../Onboarding';
import '../../../locale';

jest.mock('../../../lib/api-utils');

jest.setTimeout(20000);

let fetchWithLogsSpy: jest.SpyInstance;

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../../lib/api-utils'), 'fetchWithLogs');
});

const oldWindowLocation = global.window.location;
const initialLocation = {
  assign: jest.fn(),
  pathname: '',
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

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation) => Object.assign(mockedLocation, nextLocation),
  }),
}));

const renderComponent = (productId: string = 'prod-pagopa') => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onLogout, setOnLogout] = useState<(() => void) | null | undefined>();

    return (
      <HeaderContext.Provider
        value={{ subHeaderVisible, setSubHeaderVisible, onLogout, setOnLogout }}
      >
        <UserContext.Provider
          value={{ user, setUser, requiredLogin: false, setRequiredLogin: () => {} }}
        >
          <button onClick={onLogout}>LOGOUT</button>
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
const step2Title = 'Indica il Legale rappresentante';
const step3Title = "Indica l'Amministratore";
const completeSuccessTitle = 'La tua richiesta è stata inviata con successo';
const completeErrorTitle = 'Spiacenti, qualcosa è andato storto.';

test('test already onboarded', async () => {
  renderComponent();
  await executeStep1('agency onboarded');
  await waitFor(() => screen.getByText("L'Ente che hai scelto ha già aderito"));
  await executeGoHome();
});

test('test error retrieving onboarding info', async () => {
  renderComponent();
  await executeStep1('agency info error');
  await waitFor(() => screen.getByText('Spiacenti, qualcosa è andato storto.'));
  await executeGoHome();
});

test('test error productID', async () => {
  renderComponent('error');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('test complete', async () => {
  renderComponent();
  await executeStep1('agency x');
  await executeStepInstitutionType();
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(true);
  await executeGoHome();
});

test('test complete with error on submit', async () => {
  renderComponent();
  await executeStep1('agency error');
  await executeStepInstitutionType();
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(false);
  await executeGoHome();
});

test('test exiting during flow with unload event', async () => {
  renderComponent();
  await executeStep1('agency x');
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
  await executeStep1('agency x');

  expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull();

  const logoutButton = screen.getByRole('button', { name: 'LOGOUT' });
  await performLogout(logoutButton);

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());

  await performLogout(logoutButton);
  fireEvent.click(findRemoveAdditionUsersButtons()[0]);
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Esci' }));
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LOGOUT));
});

const performLogout = async (logoutButton: HTMLElement) => {
  fireEvent.click(logoutButton);
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).not.toBeNull());
};

const retrieveNavigationButtons = () => {
  const goBackButton = screen.getByRole('button', {
    name: 'Indietro',
  });
  expect(goBackButton).toBeEnabled();

  const confirmButton = screen.getByRole('button', {
    name: 'Conferma',
  });
  expect(confirmButton).toBeDisabled();

  return [goBackButton, confirmButton];
};

const executeGoHome = async () => {
  console.log('Go Home');
  const goHomeButton = screen.getByRole('button', {
    name: 'Chiudi',
  });
  expect(goHomeButton).toBeEnabled();
  fireEvent.click(goHomeButton);
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING));
};

const checkBackForwardNavigation = async (
  previousStepTitle: string,
  actualStepTitle: string
): Promise<Array<HTMLElement>> => {
  const [goBackButton] = retrieveNavigationButtons();
  expect(goBackButton).toBeEnabled();
  fireEvent.click(goBackButton);

  await waitFor(() => screen.getByText(previousStepTitle));

  const goForwardButton = screen.getByRole('button', {
    name: 'Conferma',
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

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Conferma' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
};

const executeStepInstitutionType = async () => {
  console.log('Testing step Institution Type');
  await waitFor(() => screen.getByText(stepInstitutionType));

  await checkBackForwardNavigation(step1Title, stepInstitutionType);
  await fillInstitutionTypeCheckbox('pa', 'gsp', 'scp', 'pt');

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Conferma' });
  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(stepBillingDataTitle));
};

const executeStepBillingData = async () => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText(stepBillingDataTitle));

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Conferma' });
  expect(confirmButtonEnabled).toBeDisabled();

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
  await waitFor(() => screen.getByText(step2Title));
};

const executeStep2 = async () => {
  console.log('Testing step 2');
  await waitFor(() => screen.getByText(step2Title));

  const confirmButton = screen.getByRole('button', { name: 'Conferma' });
  expect(confirmButton).toBeDisabled();

  await fillUserForm(confirmButton, 'LEGAL', 'BBBBBB00B00B000B', 'b@b.bb');

  expect(confirmButton).toBeEnabled();
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

  await fillUserForm(
    confirmButton,
    'delegate-initial',
    'CCCCCC00C00C000C',
    'a@a.aa',
    'BBBBBB00B00B000B',
    1,
    'b@b.bb',
    1
  );

  await checkAdditionalUsers(confirmButton);

  fireEvent.click(confirmButton);

  await waitFor(() =>
    screen.getByText(expectedSuccessfulSubmit ? completeSuccessTitle : completeErrorTitle)
  );
};

const fillInstitutionTypeCheckbox = async (pa: string, gsp: string, scp: string, pt: string) => {
  fireEvent.click(document.getElementById(pa));
  fireEvent.click(document.getElementById(gsp));
  fireEvent.click(document.getElementById(scp));
  fireEvent.click(document.getElementById(pt));
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
  fireEvent.change(document.getElementById(mailPECInput), { target: { value: 'a@a.it' } });
  fireEvent.change(document.getElementById(taxCodeInput), {
    target: { value: 'AAAAAA44D55F456K' },
  });
  fireEvent.change(document.getElementById(vatNumber), { target: { value: '11122233345' } });
  fireEvent.change(document.getElementById(recipientCode), {
    target: { value: 'recipientCode' },
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

const checkLoggedUserAsAdminCheckbox = async (
  confirmButton: HTMLElement,
  addDelegateButton: HTMLElement
) => {
  clickAdminCheckBoxAndTestValues(
    confirmButton,
    addDelegateButton,
    'loggedName',
    'loggedSurname',
    'AAAAAA00A00A000A'
  );

  await fillTextFieldAndCheckButton('delegate-initial', 'email', 'a@a.aa', confirmButton, true);
  expect(addDelegateButton).toBeEnabled();

  await clickAdminCheckBoxAndTestValues(confirmButton, addDelegateButton, '', '', '');
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
  for (let i = 0; i < 2; i++) {
    console.log('Adding additional user #', i);
    await checkRemovingEmptyAdditionalUser(i, confirmButton);

    await fillAdditionalUserAndCheckUniqueValues(i, confirmButton);
  }
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
  await checkAdditionalUsersExistance(index + 1, true, confirmButton);

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

  const taxCode = `ZZZZZZ0${index}A00A000A`;
  const email = `${index}@z.zz`;
  await fillUserForm(confirmButton, prefix, taxCode, email, 'BBBBBB00B00B000B', 1, 'b@b.bb', 1);
  await checkAlreadyExistentValues(
    prefix,
    confirmButton,
    'CCCCCC00C00C000C',
    taxCode,
    2,
    'a@a.aa',
    email,
    2
  );
  for (let j = index - 1; j >= 0; j--) {
    await checkAlreadyExistentValues(
      prefix,
      confirmButton,
      `ZZZZZZ0${j}A00A000A`,
      taxCode,
      2,
      `${j}@z.zz`,
      email,
      2
    );
  }
};
