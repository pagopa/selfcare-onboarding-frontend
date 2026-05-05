import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import '@testing-library/jest-dom';
import { vi, MockInstance, afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import '../../../locale';
import { MemoryRouter } from 'react-router-dom';
import OnboardingUser from '../OnboardingUser';
import { mockPartyRegistry, mockedProducts } from '../../../lib/__mocks__/mockApiRequests';
import { executeStepAddAdmin, executeStepAddManager } from '../../../utils/test-utils';
import { createStore } from '../../../redux/store';
import { Provider } from 'react-redux';
import { PRODUCT_IDS } from '../../../utils/constants';

type Search = 'taxCode' | 'aooCode' | 'uoCode' | 'ivassCode' | 'personalTaxCode';

vi.setConfig({ testTimeout: 40000 });

const oldWindowLocation = window.location;
const mockedLocation = {
  assign: vi.fn(),
  pathname: '/user',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
};

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

let fetchWithLogsSpy: MockInstance;

beforeEach(async () => {
  const apiUtils = await import('../../../lib/api-utils');
  fetchWithLogsSpy = vi.spyOn(apiUtils, 'fetchWithLogs');
  fetchWithLogsSpy.mockClear();
});

const renderComponent = (
  productId: string,
  fromAlreadyOnboarded: boolean,
  injectedStore?: ReturnType<typeof createStore>
) => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);
    const product = mockedProducts.find((p) => p.id === productId);
    const store = injectedStore ? injectedStore : createStore();
    return (
      <Provider store={store}>
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
      </Provider>
    );
  };

  render(<Component />);
};

const executeStepSelectProduct = async (productId: string) => {
  console.log('Testing step select product..');

  await waitFor(() => screen.getByText(/Aggiungi un nuovo Amministratore/));
  const continueButton = screen.getByText('Continua');
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
  subunitCode?: string,
  taxCode?: string
) => {
  console.log('Testing step search onboarded party..');

  screen.getByText(/Aggiungi un nuovo amministratore/i);

  await waitFor(() => expect(fetchWithLogsSpy).toHaveBeenCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  const selectWrapper = document.getElementById('party-type-select');
  const input = selectWrapper?.firstChild as HTMLElement;
  fireEvent.keyDown(input, { keyCode: 40 });

  const option = document.getElementById(typeOfSearch) as HTMLElement;
  fireEvent.click(option);

  fireEvent.change(inputPartyName, {
    target: {
      value: typeOfSearch === 'taxCode' || typeOfSearch === 'personalTaxCode' ? taxCode! : subunitCode!,
    },
  });

  const partyNameSelect = await waitFor(() => screen.getByText(partyName));

  expect(fetchWithLogsSpy).toHaveBeenCalledTimes(2);

  expect(fetchWithLogsSpy).toHaveBeenCalledWith(
    { endpoint: 'ONBOARDING_GET_INSTITUTIONS' },
    {
      method: 'GET',
      params: {
        productId,
        taxCode,
        subunitCode,
      },
    },
    expect.any(Function)
  );

  fireEvent.click(partyNameSelect);

  const continueButton = screen.getByText('Continua');
  expect(continueButton).toBeEnabled();
  fireEvent.click(continueButton);
};

test('Test: Successfull added new user for a party who has already onboarded to the PagoPA platform product', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA, true);
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: NOT successfull added new user for a party who has already onboarded to the IO product', async () => {
  renderComponent(PRODUCT_IDS.IO, true);
  await executeStepAddManager(true);
  await executeStepAddAdmin(false, false, false, true, false, false);
});

test('Test: Successfull added new user for a party who has already onboarded to the SEND product', async () => {
  renderComponent(PRODUCT_IDS.SEND, true);
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Successfull added new user for a party who has already onboarded to product prod-interop', async () => {
  renderComponent(PRODUCT_IDS.INTEROP, true);
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-io-sign and search onboarded party with taxcode', async () => {
  renderComponent(PRODUCT_IDS.IO_SIGN, false);
  await executeStepSelectProduct(PRODUCT_IDS.IO_SIGN);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.IO_SIGN,
    'onboardedparty1',
    'taxCode',
    undefined,
    '00000000000'
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-pn and search onboarded party with taxcode', async () => {
  renderComponent(PRODUCT_IDS.SEND, false);
  await executeStepSelectProduct(PRODUCT_IDS.SEND);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.SEND,
    'onboardedparty1',
    'taxCode',
    undefined,
    '00000000000'
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-io-sign and search onboarded party with aoo code', async () => {
  renderComponent(PRODUCT_IDS.IO_SIGN, false);
  await executeStepSelectProduct(PRODUCT_IDS.IO_SIGN);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.IO_SIGN,
    'onboardedpartyaoo',
    'aooCode',
    'A356E00',
    undefined
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-io-sign and search onboarded party with uo code', async () => {
  renderComponent(PRODUCT_IDS.IO_SIGN, false);
  await executeStepSelectProduct(PRODUCT_IDS.IO_SIGN);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.IO_SIGN,
    'onboardedparty2',
    'uoCode',
    'AAA111',
    undefined
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-interop and search onboarded party with taxcode', async () => {
  renderComponent(PRODUCT_IDS.INTEROP, false);
  await executeStepSelectProduct(PRODUCT_IDS.INTEROP);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.INTEROP,
    'onboardedparty1',
    'taxCode',
    undefined,
    '00000000000'
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-interop and search onboarded party with aoo code', async () => {
  renderComponent(PRODUCT_IDS.INTEROP, false);
  await executeStepSelectProduct(PRODUCT_IDS.INTEROP);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.INTEROP,
    'onboardedpartyaoo',
    'aooCode',
    'A356E00',
    undefined
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-pagopa and search onboarded party with taxcode', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA, false);
  await executeStepSelectProduct(PRODUCT_IDS.PAGOPA);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.PAGOPA,
    'onboardedparty1',
    'taxCode',
    undefined,
    '00000000000'
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-io and search onboarded party with taxcode', async () => {
  renderComponent(PRODUCT_IDS.IO, false);
  await executeStepSelectProduct(PRODUCT_IDS.IO);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.IO,
    'onboardedparty1',
    'taxCode',
    undefined,
    '00000000000'
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(false, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-idpay-merchant and search onboarded party with taxcode', async () => {
  renderComponent(PRODUCT_IDS.IDPAY_MERCHANT, false);
  await executeStepSelectProduct(PRODUCT_IDS.IDPAY_MERCHANT);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'onboardedparty4',
    'taxCode',
    undefined,
    '12345678901'
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Added new user for a party with select product prod-idpay-merchant and search onboarded party with personal taxcode', async () => {
  renderComponent(PRODUCT_IDS.IDPAY_MERCHANT, false);
  await executeStepSelectProduct(PRODUCT_IDS.IDPAY_MERCHANT);
  await executeStepSearchOnboardedParty(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'onboardedparty3',
    'personalTaxCode',
    undefined,
    'RSSLCU80A01F205N'
  );
  await executeStepAddManager(true);
  await executeStepAddAdmin(true, false, false, true, false, false);
});

test('Test: Back navigation from search party step resets product selection', async () => {
  renderComponent(PRODUCT_IDS.IO_SIGN, false);
  await executeStepSelectProduct(PRODUCT_IDS.IO_SIGN);

  screen.getByText(/Aggiungi un nuovo amministratore/i);

  const backButton = screen.getByRole('button', { name: 'Indietro' });
  fireEvent.click(backButton);

  await waitFor(() => screen.getByText(/Aggiungi un nuovo Amministratore/));
  const continueButton = screen.getByText('Continua');
  expect(continueButton).toBeDisabled();
});
