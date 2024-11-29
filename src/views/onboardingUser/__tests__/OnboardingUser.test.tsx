import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import '@testing-library/jest-dom';
import { User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import '../../../locale';
import { MemoryRouter } from 'react-router-dom';
import OnboardingUser from '../OnboardingUser';
import { mockPartyRegistry, mockedProducts } from '../../../lib/__mocks__/mockApiRequests';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';

type Search = 'taxCode' | 'aooCode' | 'uoCode' | 'ivassCode';

jest.setTimeout(40000);

let fetchWithLogsSpy: jest.SpyInstance;

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../../lib/api-utils'), 'fetchWithLogs');
});

beforeAll(() => {
  i18n.changeLanguage('it');
});

const renderComponent = (productId: string, fromAlreadyOnboarded: boolean) => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);
    const product = mockedProducts.find((p) => p.id === productId);
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
          <MemoryRouter
            initialEntries={[
              {
                pathname: `/user`,
                search: '',
                state: fromAlreadyOnboarded
                  ? {
                      data: { party: mockPartyRegistry.items[2], product, institutionType: 'PA' },
                    }
                  : undefined,
              },
            ]}
          >
            <OnboardingUser />
          </MemoryRouter>
        </UserContext.Provider>
      </HeaderContext.Provider>
    );
  };

  render(<Component />);
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

const executeStepSelectProduct = async (productId: string) => {
  console.log('Testing step select product..');

  await waitFor(() => screen.getByText(/Aggiungi un nuovo Amministratore/));
  const continueButton = screen.getByRole('button', { name: 'Continua' });
  expect(continueButton).toBeDisabled();

  const elementId = productId.toLowerCase();

  fireEvent.click(document.getElementById(elementId) as HTMLElement);
  expect(document.getElementById(elementId) as HTMLElement).toBeChecked();
  expect(continueButton).toBeEnabled();

  fireEvent.click(continueButton);
};

const executeStepSearchOnboardedParty = async (
  productId: string,
  partyName: string,
  typeOfSearch: Search,
  subUnitCode?: string,
  taxCode?: string
) => {
  console.log('Testing step search onboarded party..');

  screen.getByText(/Aggiungi un nuovo amministratore/i);

  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  const selectWrapper = document.getElementById('party-type-select');
  const input = selectWrapper?.firstChild as HTMLElement;
  fireEvent.keyDown(input, { keyCode: 40 });

  const option = document.getElementById(typeOfSearch) as HTMLElement;
  fireEvent.click(option);

  fireEvent.change(inputPartyName, {
    target: {
      value: typeOfSearch === 'taxCode' ? 'taxCode' : subUnitCode,
    },
  });

  const partyNameSelect = await waitFor(() =>
    screen.getByText(typeOfSearch === 'taxCode' ? /onboardedparty1/i : partyName)
  );

  expect(fetchWithLogsSpy).toBeCalledTimes(2);

  expect(fetchWithLogsSpy).toHaveBeenCalledWith(
    { endpoint: 'ONBOARDING_GET_INSTITUTIONS' },
    {
      method: 'GET',
      params: {
        productId,
        taxCode,
        subUnitCode,
      },
    },
    expect.any(Function)
  );

  fireEvent.click(partyNameSelect);

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  await waitFor(() => fireEvent.click(confirmButton));
};

const executeStepAddManager = async () => {
  console.log('Testing step add manager..');
  await waitFor(() => screen.getByText('Indica il Legale Rappresentante'));

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeDisabled();

  await checkCertifiedUserValidation('LEGAL', confirmButton);

  await fillUserForm(confirmButton, 'LEGAL', 'SRNNMA80A01A794F', 'b@b.BB', true);

  fireEvent.click(confirmButton);
};

const executeStepAddAdmin = async (expectedSuccessfulSubmit: boolean) => {
  console.log('Testing step add admin..');

  await waitFor(() => screen.getByText("Indica l'Amministratore"));
  const [_, confirmButton] = await checkBackForwardNavigation(
    'Indica il Legale Rappresentante',
    "Indica l'Amministratore"
  );

  await checkCertifiedUserValidation('delegate-initial', confirmButton);

  await fillUserForm(
    confirmButton,
    'delegate-initial',
    'SRNNMA80A01B354S',
    'a@a.AA',
    true,
    'SRNNMA80A01A794F',
    0,
    'b@b.bb',
    0
  );

  await waitFor(() => expect(confirmButton).toBeEnabled());

  await waitFor(() => fireEvent.click(confirmButton));

  const confimationModalBtn = await waitFor(() => screen.getByText('Conferma'));

  await waitFor(() => fireEvent.click(confimationModalBtn));

  await waitFor(() =>
    screen.getByText(
      expectedSuccessfulSubmit ? 'Hai inviato la richiesta' : 'Qualcosa è andato storto.'
    )
  );
};

const checkCertifiedUserValidation = async (prefix: string, confirmButton: HTMLElement) => {
  await fillUserForm(confirmButton, prefix, 'FRRMRA80A01F205X', 'b@c.BB', false);
  await waitFor(() => screen.getByText('Nome non corretto o diverso dal Codice Fiscale'));
  screen.getByText('Cognome non corretto o diverso dal Codice Fiscale');
};

test('Test: Successfull added new user for a party who has already onboarded to the PagoPA platform product', async () => {
  renderComponent('prod-pagopa', true);
  await executeStepAddManager();
  await executeStepAddAdmin(true);
});

test('Test: NOT successfull added new user for a party who has already onboarded to the IO product', async () => {
  renderComponent('prod-io', true);
  await executeStepAddManager();
  await executeStepAddAdmin(false);
});

// TODO
test.skip('Test: Added new user for a party with select product prod-io-sign and search onboarded party with tax code', async () => {
  renderComponent('prod-io-sign', false);
  await executeStepSelectProduct('prod-io-sign');
  await executeStepSearchOnboardedParty(
    'prod-io-sign',
    'onboardedparty1',
    'taxCode',
    undefined,
    '00000000000'
  );
  /* await executeStepAddManager();
  await executeStepAddAdmin(false); */
});
