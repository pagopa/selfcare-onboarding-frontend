import { fireEvent, getByLabelText, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import Onboarding from '../Onboarding';
import '../../../locale';

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
  search: '?pricingPlan=pricingPlan',
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

const stepSearchByBusinessName = 'Seleziona il tuo ente';
const stepSearchByTaxcode = 'Ricerca il tuo ente';
const stepInstitutionType = 'Seleziona il tipo di ente che rappresenti';
const stepBillingDataTitle = 'Indica i dati del tuo ente';
const step2Title = 'Indica il Legale Rappresentante';
const step3Title = "Indica l'Amministratore";
const completeSuccessTitle = 'La tua richiesta è stata inviata con successo';
const completeErrorTitle = 'Spiacenti, qualcosa è andato storto.';

const agencyOnboarded = 'AGENCY ONBOARDED';
const agencyInfoError = 'AGENCY INFO ERROR';
const agencyX = 'AGENCY X';
const agencyError = 'AGENCY ERROR';

test('test already onboarded', async () => {
  renderComponent();
  await executeStepInstitutionType('pa');
  await executeStepSearchByBusinessName(agencyOnboarded);
  await waitFor(() => screen.getByText("L'Ente che hai scelto ha già aderito"));
  await executeGoHome();
});

test('test error retrieving onboarding info', async () => {
  renderComponent();
  await executeStepInstitutionType('pa');
  await executeStepSearchByBusinessName(agencyInfoError);
  await waitFor(() => screen.getByText('Spiacenti, qualcosa è andato storto.'));
  await executeGoHome();
});

test('test error productID', async () => {
  renderComponent('error');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('test complete doing an onboarding with institutionType PA', async () => {
  renderComponent();
  await executeStepInstitutionType('pa');
  await executeStepSearchByBusinessName(agencyX);
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(true);
  await verifySubmit();
  await executeGoHome();
});

test.skip('test complete doing an onboarding with institutionType GPS (NOT PA)', async () => {
  renderComponent();
  await executeStepInstitutionType('gsp');
  await executeStepSearchByTaxCode('22222222222');
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(true);
  await verifySubmit();
  await executeGoHome();
});

test('test complete with error on submit', async () => {
  renderComponent();
  await executeStepInstitutionType('pa');
  await executeStepSearchByBusinessName(agencyError);
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(false);
  await executeGoHome();
});

test('test correct redirect to businessName research when selected type is EQUAL to PA', async () => {
  renderComponent();
  await executeStepInstitutionType('pa');
  await executeStepSearchByBusinessName(agencyError);
});

test('test correct redirect to taxCode research when selected type is NOT EQUAL to PA', async () => {
  renderComponent();
  await executeStepInstitutionType('pt');
  await executeStepSearchByTaxCode('11111111111');
});

test('test exiting during flow with unload event', async () => {
  renderComponent();
  await executeStepInstitutionType('pa');
  await executeStepSearchByBusinessName(agencyX);
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
  await executeStepInstitutionType('pa');

  await executeStepSearchByBusinessName(agencyX);

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
const executeStepSearchByBusinessName = async (partyName: string) => {
  console.log('Testing step search by business name');

  screen.getByText(stepSearchByBusinessName);
  screen.getAllByText('Cerca ente')[0];
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties');

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

const executeStepSearchByTaxCode = async (taxCode: string) => {
  console.log('Testing step search by taxCode');

  screen.getByText(stepSearchByTaxcode);
  screen.getAllByText('Codice Fiscale/P.IVA')[0];
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties');

  expect(inputPartyName).toBeTruthy();
  await waitFor(() => fireEvent.change(inputPartyName, { target: { value: taxCode } }));

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
};

const executeStepInstitutionType = async (selectedType: string) => {
  console.log('Testing step Institution Type');
  await waitFor(() => screen.getByText(stepInstitutionType));
  await fillInstitutionTypeCheckbox(selectedType);

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() =>
    selectedType === 'pa'
      ? screen.getByText(stepSearchByBusinessName)
      : screen.getByText(stepSearchByTaxcode)
  );
};

const executeStepBillingData = async () => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText(stepBillingDataTitle));

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
    'recipientCode'
  );

  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  await checkCorrectBodyBillingData(
    'businessNameInput',
    'registeredOfficeInput',
    'a@a.it',
    '09010',
    '22222222222',
    '22222222222',
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

  await fillUserForm(confirmButton, 'LEGAL', 'SRNNMA00B00B000B', 'b@b.BB', true);

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
    'SRNNMA00C00C000C',
    'a@a.AA',
    true,
    'SRNNMA00B00B000B',
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

const checkCertifiedUserValidation = async (prefix: string, confirmButton: HTMLElement) => {
  await fillUserForm(confirmButton, prefix, 'ZZZZZZ00A00Z000Z', 'b@c.BB', false);
  await waitFor(() => screen.getByText('Nome non corretto o diverso dal Codice Fiscale'));
  screen.getByText('Cognome non corretto o diverso dal Codice Fiscale');
};

const fillInstitutionTypeCheckbox = async (selectedType: string) => {
  fireEvent.click(document.getElementById(selectedType) as HTMLInputElement);
};

const fillUserBillingDataForm = async (
  businessNameInput: string,
  registeredOfficeInput: string,
  mailPECInput: string,
  zipCode: string,
  taxCodeInput: string,
  vatNumber: string,
  recipientCode: string
) => {
  fireEvent.change(document.getElementById(businessNameInput) as HTMLInputElement, {
    target: { value: 'businessNameInput' },
  });
  fireEvent.change(document.getElementById(registeredOfficeInput) as HTMLInputElement, {
    target: { value: 'registeredOfficeInput' },
  });
  fireEvent.change(document.getElementById(mailPECInput) as HTMLInputElement, {
    target: { value: 'a@a.it' },
  });
  fireEvent.change(document.getElementById(zipCode) as HTMLInputElement, {
    target: { value: '09010' },
  });
  fireEvent.change(document.getElementById(taxCodeInput) as HTMLInputElement, {
    target: { value: '22222222222' },
  });

  fireEvent.change(document.getElementById(recipientCode) as HTMLInputElement, {
    target: { value: 'recipientCode' },
  });
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
    'LGGLGD00A00A000A'
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

  await checkCertifiedUserValidation(prefix, confirmButton);

  const taxCode = `SRNNMA0${index}A00A000A`;
  const email = `${index}@z.zz`;
  await fillUserForm(
    confirmButton,
    prefix,
    taxCode,
    email,
    true,
    'SRNNMA00B00B000B',
    1,
    'b@b.bb',
    1
  );
  await checkAlreadyExistentValues(
    prefix,
    confirmButton,
    'SRNNMA00C00C000C',
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
      `SRNNMA0${j}A00A000A`,
      taxCode,
      2,
      `${j}@z.zz`,
      email,
      2
    );
  }
};

const verifySubmit = async () => {
  await waitFor(() =>
    expect(fetchWithLogsSpy).lastCalledWith(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
        endpointParams: { externalInstitutionId: 'id', productId: 'prod-pagopa' },
      },
      {
        data: {
          billingData: {
            businessName: 'businessNameInput',
            registeredOffice: 'registeredOfficeInput',
            digitalAddress: 'a@a.it',
            zipCode: '09010',
            taxCode: '22222222222',
            vatNumber: '12345678901',
            recipientCode: 'recipientCode',
            publicServices: false,
          },
          institutionType: 'GSP',
          origin: 'IPA',
          pricingPlan: 'pricingPlan',
          users: [
            {
              email: 'b@b.bb',
              name: 'NAME',
              role: 'MANAGER',
              surname: 'SURNAME',
              taxCode: 'SRNNMA00B00B000B',
            },
            {
              email: 'a@a.aa',
              name: 'NAME',
              role: 'DELEGATE',
              surname: 'SURNAME',
              taxCode: 'SRNNMA00C00C000C',
            },
            {
              email: '0@z.zz',
              name: 'NAME',
              role: 'DELEGATE',
              surname: 'SURNAME',
              taxCode: 'SRNNMA00A00A000A',
            },
            {
              email: '1@z.zz',
              name: 'NAME',
              role: 'DELEGATE',
              surname: 'SURNAME',
              taxCode: 'SRNNMA01A00A000A',
            },
          ],
        },
        method: 'POST',
      },
      expect.any(Function)
    )
  );
};
