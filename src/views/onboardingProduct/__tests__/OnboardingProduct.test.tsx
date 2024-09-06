import React, { useEffect } from 'react';
import { fireEvent, getByLabelText, render, screen, waitFor, within } from '@testing-library/react';
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
import userEvent from '@testing-library/user-event';
import {
  mockedANACParties,
  mockedAoos,
  mockedInsuranceResource,
  mockedParties,
  mockedPartiesFromInfoCamere,
  mockedUos,
  mockPartyRegistry,
} from '../../../lib/__mocks__/mockApiRequests';

type Source = 'IPA' | 'NO_IPA' | 'ANAC' | 'IVASS' | 'INFOCAMERE' | 'PDND_INFOCAMERE';
type Search = 'businessName' | 'taxCode' | 'aooCode' | 'uoCode' | 'ivassCode';

jest.mock('../../../lib/api-utils');
jest.setTimeout(40000);

let fetchWithLogsSpy: jest.SpyInstance;
let aggregatesCsv: File;

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

beforeEach(() => {
  aggregatesCsv = new File(['csv data'], 'aggregates.csv', { type: 'multipart/form-data' });
});

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
  await executeStepInstitutionType('prod-io', 'PA');
  await executeStepSearchParty('prod-io', 'PA', 'AGENCY X', 'businessName');
  await executeStepBillingData('prod-io', 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-io', 'PA', 'IPA', false, false, 'businessName');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of PA party for prod-io search by tax code', async () => {
  renderComponent('prod-io');
  await executeStepInstitutionType('prod-io', 'PA');
  await executeStepSearchParty(
    'prod-io',
    'PA',
    'Comune Di Milano',
    'taxCode',
    undefined,
    '33445673222'
  );
  await executeStepBillingData('prod-io', 'PA', false, false, 'IPA', 'Comune di Milano');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-io', 'PA', 'IPA', false, false, 'taxCode');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of AOO party for product prod-interop', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'PA');
  await executeStepSearchParty(
    'prod-interop',
    'PA',
    'denominazione aoo test 1',
    'aooCode',
    'A356E00'
  );
  await executeStepBillingData(
    'prod-interop',
    'PA',
    true,
    false,
    'IPA',
    'denominazione aoo test 1'
  );
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-interop', 'PA', 'IPA', false, false, 'aooCode');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of UO party for product prod-io-sign', async () => {
  renderComponent('prod-io-sign');
  await executeStepInstitutionType('prod-io-sign', 'PA');
  await executeStepSearchParty('prod-io-sign', 'PA', 'denominazione uo test 1', 'uoCode', 'A1B2C3');
  await executeStepBillingData('prod-io-sign', 'PA', false, true, 'IPA', 'denominazione uo test 1');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-io-sign', 'PA', 'IPA', true, false, 'uoCode');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of GSP party search from IPA source for product prod-pagopa', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'GSP');
  await executeStepSearchParty(
    'prod-pagopa',
    'GSP',
    'AGENCY X',
    'businessName',
    undefined,
    undefined,
    undefined,
    false,
    false
  );
  await executeStepBillingData('prod-pagopa', 'GSP', false, false, 'IPA', 'AGENCY X');
  await executeStepAdditionalInfo('IPA');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-pagopa', 'GSP', 'IPA');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of GSP party without search on IPA source for product prod-pagopa', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'GSP');
  await executeStepSearchParty(
    'prod-pagopa',
    'GSP',
    'AGENCY X',
    'businessName',
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData('prod-pagopa', 'GSP', false, false, 'NO_IPA', 'AGENCY X');
  await executeStepAdditionalInfo('NO_IPA');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-pagopa', 'GSP', 'NO_IPA');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of PT for product prod-pagopa', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'PT');
  await executeStepBillingData('prod-pagopa', 'PT', false, false, 'NO_IPA');
  await executeStepAddAdmin(true, true);
  await verifySubmit('prod-pagopa', 'PT', 'NO_IPA');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of PSP for product prod-pagopa', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'PSP');
  await executeStepBillingData('prod-pagopa', 'PSP', false, false, 'NO_IPA');
  await executeStepAddManager();
  await executeStepAddAdmin(true, false);
  await verifySubmit('prod-pagopa', 'PSP', 'NO_IPA');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of SA for product prod-interop search by business name', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'SA');
  await executeStepSearchParty(
    'prod-interop',
    'SA',
    'descriptionAnac1',
    'businessName',
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData('prod-interop', 'SA', false, false, 'ANAC', 'descriptionAnac1');
  await executeStepAddManager();
  await executeStepAddAdmin(true, false);
  await verifySubmit('prod-interop', 'SA', 'ANAC', false, false, 'businessName');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of SA for product prod-interop search by tax code', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'SA');
  await executeStepSearchParty(
    'prod-interop',
    'SA',
    'descriptionAnac1',
    'taxCode',
    undefined,
    '12345678911',
    undefined,
    false,
    true
  );
  await executeStepBillingData('prod-interop', 'SA', false, false, 'ANAC', 'descriptionAnac1');
  await executeStepAddManager();
  await executeStepAddAdmin(true, false);
  await verifySubmit('prod-interop', 'SA', 'ANAC', false, false, 'taxCode');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of foreign AS for product prod-interop search by business name', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'AS');
  await executeStepSearchParty(
    'prod-interop',
    'AS',
    'mocked foreign insurance company 1',
    'businessName',
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    'prod-interop',
    'AS',
    false,
    false,
    'IVASS',
    'mocked foreign insurance company 1',
    true
  );
  await executeStepAddManager();
  await executeStepAddAdmin(true, false);
  await verifySubmit('prod-interop', 'AS', 'IVASS', false, false, 'businessName', true);
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of italian AS for product prod-interop search by ivass code', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'AS');
  await executeStepSearchParty(
    'prod-interop',
    'AS',
    'mocked italian insurance company 1',
    'ivassCode',
    undefined,
    undefined,
    '232DC',
    false,
    true
  );
  await executeStepBillingData(
    'prod-interop',
    'AS',
    false,
    false,
    'IVASS',
    'mocked italian insurance company 1',
    false
  );
  await executeStepAddManager();
  await executeStepAddAdmin(true, false);
  await verifySubmit('prod-interop', 'AS', 'IVASS', false, false, 'taxCode', false);
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of italian AS without tax code for product prod-interop search by ivass code', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'AS');
  await executeStepSearchParty(
    'prod-interop',
    'AS',
    'mocked italian insurance company without taxcode',
    'ivassCode',
    undefined,
    undefined,
    '4431B',
    false,
    true
  );
  await executeStepBillingData(
    'prod-interop',
    'AS',
    false,
    false,
    'IVASS',
    'mocked italian insurance company without taxcode',
    false,
    false
  );
  await executeStepAddManager();
  await executeStepAddAdmin(true, false);
  await verifySubmit('prod-interop', 'AS', 'IVASS', false, false, 'taxCode', false, false);
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of SCP for product prod-interop search from infocamere with tax code', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'SCP');
  await executeStepSearchParty(
    'prod-interop',
    'SCP',
    'Mocked business 1',
    'taxCode',
    undefined,
    '00112233445',
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    'prod-interop',
    'SCP',
    false,
    false,
    'PDND_INFOCAMERE',
    'Mocked business 1',
    false
  );
  await executeStepAddManager();
  await executeStepAddAdmin(true, false);
  await verifySubmit('prod-interop', 'SCP', 'PDND_INFOCAMERE', false, false, 'taxCode', false);
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of PRV for product prod-interop search from infocamere with tax code', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop', 'PRV');
  await executeStepSearchParty(
    'prod-interop',
    'PRV',
    'Mocked business 1',
    'taxCode',
    undefined,
    '00112233445',
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    'prod-interop',
    'PRV',
    false,
    false,
    'PDND_INFOCAMERE',
    'Mocked business 1',
    false
  );
  await executeStepAddManager();
  await executeStepAddAdmin(true, false);
  await verifySubmit('prod-interop', 'PRV', 'PDND_INFOCAMERE', false, false, 'taxCode', false);
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of PA aggregator party for prod-io search by business name', async () => {
  renderComponent('prod-io');
  await executeStepInstitutionType('prod-io', 'PA');
  await executeStepSearchParty(
    'prod-io',
    'PA',
    'AGENCY X',
    'businessName',
    undefined,
    undefined,
    undefined,
    false,
    false,
    true
  );
  await executeStepBillingData('prod-io', 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager();
  await executeStepAddAdmin(true, false, true);
  await executeStepUploadAggregates();
  await verifySubmit('prod-io', 'PA', 'IPA', false, false, 'businessName', undefined, true, true);
  await executeGoHome(true);
});

test('Test: Error on submit onboarding request of PA party for prod-io search by business name', async () => {
  renderComponent('prod-io');
  await executeStepInstitutionType('prod-io', 'PA');
  await executeStepSearchParty('prod-io', 'PA', 'AGENCY ERROR', 'businessName');
  await executeStepBillingData('prod-io', 'PA', false, false, 'IPA', 'AGENCY ERROR');
  await executeStepAddManager();
  await executeStepAddAdmin(false, false);
  await verifySubmit('prod-io', 'PA', 'IPA', false, true);
  await executeGoHome(true);
});

test('Test: Party already onboarded for a product that allow add new user, so the link is available', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'PA');
  await executeStepSearchParty(
    'prod-pagopa',
    'PA',
    'AGENCY ONBOARDED',
    'businessName',
    undefined,
    undefined,
    undefined,
    true
  );
  await waitFor(() => screen.getByText(/L’ente selezionato ha già aderito/));

  const addNewUserLink = screen.getByText('Aggiungi un nuovo Amministratore');
  await waitFor(() => fireEvent.click(addNewUserLink));

  expect(history.length).toBe(1);
});

test('Test: Error retrieving onboarding info', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'PA');
  await executeStepSearchParty(
    'prod-pagopa',
    'PA',
    'AGENCY INFO ERROR',
    'businessName',
    undefined,
    undefined,
    undefined,
    true
  );
  await waitFor(() => screen.getByText('Qualcosa è andato storto'));
  await executeGoHome(false);
});

test('Test: Invalid productId', async () => {
  renderComponent('error');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('Test: Exiting during flow with unload event', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'PA');
  await executeStepSearchParty('prod-pagopa', 'PA', 'AGENCY X', 'businessName');
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
  await executeStepInstitutionType('prod-io', 'PA');

  await executeStepSearchParty('prod-io', 'PA', 'AGENCY X', 'businessName');

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

test('Test: Search trying to type invalid characters', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'PA');
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'AGENCY X ())!/!/££!' } });

  await waitFor(() => screen.getByText('AGENCY X'));
});

test('Test: RecipientCode input client validation', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'PA');
  await executeStepSearchParty('prod-pagopa', 'PA', 'AGENCY X', 'businessName');
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
  const institutionTypeElementId = institutionType.toLowerCase();
  await waitFor(() => screen.getByText('Seleziona il tipo di ente che rappresenti'));

  if (productSelected !== 'prod-pn' && productSelected !== 'prod-idpay') {
    screen.getByText(/Indica il tipo di ente che aderirà a/);
    await fillInstitutionTypeCheckbox(institutionTypeElementId);
    const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
    expect(confirmButtonEnabled).toBeEnabled();

    fireEvent.click(confirmButtonEnabled);
  } else {
    await fillInstitutionTypeCheckbox('pa');
  }
};

const executeStepSearchParty = async (
  productId: string,
  institutionType: string,
  partyName: string,
  typeOfSearch: Search,
  subUnitCode?: string,
  taxCode?: string,
  ivassCode?: string,
  expectedError: boolean = false,
  withoutIpa: boolean = false,
  isAggregator: boolean = false
) => {
  console.log('Testing step search party..');

  screen.getByText('Cerca il tuo ente');

  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  const withoutIpaLink = document.getElementById('no_ipa') as HTMLElement;
  if (productId === 'prod-pagopa' && institutionType === 'GSP') {
    expect(withoutIpaLink).toBeInTheDocument();
    if (withoutIpa) {
      fireEvent.click(withoutIpaLink);
      return;
    }
  } else {
    expect(withoutIpaLink).not.toBeInTheDocument();
  }

  const aggregatorCheckbox = screen.queryByLabelText('Sono un ente aggregatore');

  if (productId === 'prod-io') {
    expect(aggregatorCheckbox).toBeInTheDocument();
    expect(aggregatorCheckbox).not.toBeChecked();
    if (isAggregator) {
      fireEvent.click(aggregatorCheckbox);
      expect(aggregatorCheckbox).toBeChecked();
    }
  } else {
    expect(aggregatorCheckbox).not.toBeInTheDocument();
  }

  switch (typeOfSearch) {
    case 'businessName':
      fireEvent.change(inputPartyName, { target: { value: 'XXX' } });

      const partyNameSelection = await waitFor(() => screen.getByText(partyName));

      expect(fetchWithLogsSpy).toBeCalledTimes(2);

      expect(fetchWithLogsSpy).toHaveBeenCalledWith(
        {
          endpoint:
            institutionType === 'SA'
              ? 'ONBOARDING_GET_SA_PARTIES_NAME'
              : institutionType === 'AS'
              ? 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME'
              : 'ONBOARDING_GET_SEARCH_PARTIES',
        },
        {
          method: 'GET',
          params: {
            limit:
              institutionType === 'SA' || institutionType === 'AS'
                ? undefined
                : ENV.MAX_INSTITUTIONS_FETCH,
            categories:
              institutionType === 'SA' || institutionType === 'AS'
                ? undefined
                : filterByCategory(institutionType.toUpperCase(), productId),
            page: 1,
            search: 'XXX',
          },
        },
        expect.any(Function)
      );
      fireEvent.click(partyNameSelection);
      break;
    case 'taxCode':
    case 'aooCode':
    case 'uoCode':
    case 'ivassCode':
      const selectWrapper = document.getElementById('party-type-select');
      const input = selectWrapper?.firstChild as HTMLElement;
      fireEvent.keyDown(input, { keyCode: 40 });

      const option = document.getElementById(typeOfSearch) as HTMLElement;
      fireEvent.click(option);

      fireEvent.change(inputPartyName, {
        target: {
          value:
            typeOfSearch === 'taxCode'
              ? taxCode
              : typeOfSearch === 'ivassCode'
              ? ivassCode
              : subUnitCode,
        },
      });

      const partyNameSelect = await waitFor(() =>
        screen.getByText(
          typeOfSearch === 'taxCode' && institutionType !== 'SCP' && institutionType !== 'PRV'
            ? partyName.toLowerCase()
            : partyName
        )
      );

      const endpoint =
        typeOfSearch === 'taxCode'
          ? institutionType === 'SA'
            ? 'ONBOARDING_GET_SA_PARTY_FROM_FC'
            : institutionType === 'SCP' || institutionType === 'PRV'
            ? 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE'
            : 'ONBOARDING_GET_PARTY_FROM_CF'
          : typeOfSearch === 'aooCode'
          ? 'ONBOARDING_GET_AOO_CODE_INFO'
          : typeOfSearch === 'uoCode'
          ? 'ONBOARDING_GET_UO_CODE_INFO'
          : 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE';

      const endpointParams =
        typeOfSearch === 'taxCode'
          ? institutionType === 'SA'
            ? { taxId: taxCode }
            : { id: taxCode }
          : typeOfSearch === 'aooCode'
          ? { codiceUniAoo: subUnitCode }
          : typeOfSearch === 'uoCode'
          ? { codiceUniUo: subUnitCode }
          : { taxId: ivassCode };

      const params =
        typeOfSearch === 'taxCode' || typeOfSearch === 'ivassCode'
          ? institutionType === 'SA' || institutionType === 'AS'
            ? undefined
            : {
                productId: undefined,
                subunitCode: undefined,
                taxCode:
                  institutionType === 'SCP' || institutionType === 'PRV' ? undefined : taxCode,
              }
          : {
              origin: 'IPA',
              categories: filterByCategory(institutionType, productId),
            };

      expect(fetchWithLogsSpy).toBeCalledTimes(
        typeOfSearch === 'aooCode' || typeOfSearch === 'uoCode' ? 3 : 2
      );

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

  if (isAggregator) {
    await waitFor(() => screen.getByText(/Stai richiedendo l’adesione come ente aggregatore per /));
    const continueButtonModal = screen.getAllByText('Continua')[1];
    fireEvent.click(continueButtonModal);
  }
};

const executeStepBillingData = async (
  productId: string,
  institutionType: string,
  isAoo: boolean = false,
  isUo: boolean = false,
  from: Source = 'IPA',
  partyName?: string,
  isForeignInsurance?: boolean,
  haveTaxCode: boolean = true
) => {
  console.log('Testing step billing data..');
  await waitFor(() => screen.getByText('Inserisci i dati dell’ente'));

  await fillUserBillingDataForm(
    'businessName',
    'registeredOffice',
    'digitalAddress',
    'zipCode',
    'taxCode',
    'vatNumber',
    'recipientCode',
    'supportEmail',
    'rea',
    'city-select',
    'county',
    'country-select',
    from,
    institutionType,
    isAoo,
    isForeignInsurance,
    haveTaxCode
  );

  const confirmButton = screen.getByRole('button', { name: 'Continua' });

  const isInvoicable = canInvoice(institutionType.toUpperCase(), productId);
  const recipientCodeInput =
    partyName === 'AGENCY ERROR'
      ? 'A2B3C4'
      : partyName === 'Comune di Milano'
      ? 'A3B4C5'
      : 'A1B2C3';
  const taxCodeInvoicingInput =
    partyName === 'AGENCY ERROR'
      ? '75656445456'
      : partyName === 'Comune di Milano'
      ? '998877665544'
      : '87654321098';

  if (isInvoicable) {
    fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
      target: { value: recipientCodeInput },
    });

    if (isUo || institutionType === 'PA') {
      await waitFor(() =>
        expect(document.getElementById('taxCodeInvoicing')).toHaveValue(taxCodeInvoicingInput)
      );
      await waitFor(() => expect(confirmButton).toBeEnabled());
      fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
        target: { value: '' },
      });
      expect(
        document.getElementById('taxCodeInvoicing') as HTMLInputElement
      ).not.toBeInTheDocument();

      await waitFor(() => expect(confirmButton).toBeDisabled());

      fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
        target: { value: 'AABBC1' },
      });
      await waitFor(() => screen.getByText('Il codice inserito non è associato al tuo ente'));

      expect(
        document.getElementById('taxCodeInvoicing') as HTMLInputElement
      ).not.toBeInTheDocument();

      fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
        target: { value: '2A3B4C' },
      });

      expect(
        document.getElementById('taxCodeInvoicing') as HTMLInputElement
      ).not.toBeInTheDocument();

      await waitFor(() =>
        screen.getByText(
          'Il codice inserito è associato al codice fiscale di un ente che non ha il servizio di fatturazione attivo'
        )
      );

      fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
        target: { value: 'A1B2C31' },
      });

      await waitFor(() => screen.getByText('Il codice inserito non è associato al tuo ente'));

      await waitFor(() =>
        expect(
          document.getElementById('taxCodeInvoicing') as HTMLInputElement
        ).not.toBeInTheDocument()
      );

      fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
        target: { value: recipientCodeInput },
      });

      await waitFor(() =>
        expect(document.getElementById('taxCodeInvoicing') as HTMLInputElement).toBeInTheDocument()
      );
      expect(document.getElementById('taxCodeInvoicing') as HTMLInputElement).toBeDisabled();

      fireEvent.change(document.getElementById('taxCodeInvoicing') as HTMLInputElement, {
        target: { value: '87654321092' },
      });
      await waitFor(() =>
        screen.getByText('Il Codice Fiscale inserito non è relativo al tuo ente')
      );

      await waitFor(() => expect(confirmButton).toBeDisabled());

      fireEvent.change(document.getElementById('taxCodeInvoicing') as HTMLElement, {
        target: { value: taxCodeInvoicingInput },
      });
    }
  } else {
    expect(document.getElementById('taxCodeInvoicing')).not.toBeInTheDocument();
  }

  if (from !== 'IPA') {
    await checkCorrectBodyBillingData(
      institutionType,
      'businessNameInput',
      'registeredOfficeInput',
      'a@a.it',
      '09010',
      '00000000000',
      '00000000000',
      'A1B2C3',
      'Milano',
      'MI',
      isForeignInsurance,
      haveTaxCode
    );
  }

  await waitFor(() => expect(confirmButton).toBeEnabled());
  fireEvent.click(confirmButton);
};

const executeStepAdditionalInfo = async (from: 'IPA' | 'NO_IPA' = 'IPA') => {
  console.log('Testing step additional informations..');

  await waitFor(() => screen.getByText('Inserisci ulteriori dettagli'));

  const continueButton = screen.getByText('Continua');
  expect(continueButton).toBeDisabled();

  if (from === 'IPA') {
    expect(document.getElementById('isFromIPA-yes')).toBeChecked();
    expect(document.getElementById('isFromIPA-no')).not.toBeChecked();
  } else {
    expect(document.getElementById('isFromIPA-yes')).not.toBeChecked();
    expect(document.getElementById('isFromIPA-no')).toBeChecked();
  }

  fireEvent.click(document.getElementById('isEstabilishedRegulatoryProvision-no') as HTMLElement);
  fireEvent.click(document.getElementById('fromBelongsRegulatedMarket-no') as HTMLElement);

  fireEvent.click(document.getElementById('isConcessionaireOfPublicService-yes') as HTMLElement);
  expect(continueButton).toBeEnabled();

  fireEvent.click(document.getElementById('isConcessionaireOfPublicService-no') as HTMLElement);

  if (from !== 'IPA') {
    expect(continueButton).toBeDisabled();
  }

  fireEvent.click(document.getElementById('optionalPartyInformations-checked') as HTMLElement);
  expect(continueButton).toBeEnabled();

  fireEvent.click(continueButton);

  expect(screen.queryByText('Campo obbligatorio')).toBeInTheDocument();
  expect(continueButton).toBeDisabled();

  fireEvent.change(document.getElementById('optionalPartyInformations') as HTMLElement, {
    target: { value: 'optionalPartyInformations-note' },
  });
  expect(screen.queryByText('Campo obbligatorio')).not.toBeInTheDocument();
  expect(continueButton).toBeEnabled();

  fireEvent.click(
    document.getElementById('isConcessionaireOfPublicService-add-note') as HTMLInputElement
  );
  expect(continueButton).toBeEnabled();

  fireEvent.click(continueButton);

  expect(
    document.getElementById('isConcessionaireOfPublicService-note-helper-text')?.textContent
  ).toBe('Non hai inserito nessuna nota');
  expect(continueButton).toBeDisabled();

  fireEvent.click(
    document.getElementById('isConcessionaireOfPublicService-remove-field') as HTMLElement
  );

  expect(
    document.getElementById('isConcessionaireOfPublicService-note-helper-text')?.textContent
  ).toBeUndefined();
  expect(continueButton).toBeEnabled();

  expect(document.getElementById('fromBelongsRegulatedMarket-no')).toBeChecked();
  fireEvent.click(document.getElementById('fromBelongsRegulatedMarket-yes') as HTMLElement);
  expect(document.getElementById('fromBelongsRegulatedMarket-no')).not.toBeChecked();
  expect(document.getElementById('fromBelongsRegulatedMarket-yes')).toBeChecked();

  if (from !== 'IPA') {
    expect(document.getElementById('isFromIPA-no')).toBeChecked();
    fireEvent.click(document.getElementById('isFromIPA-yes') as HTMLElement);
    expect(document.getElementById('isFromIPA-no')).not.toBeChecked();
    expect(document.getElementById('isFromIPA-yes')).toBeChecked();

    expect(screen.queryAllByText('Inserisci il codice IPA di riferimento')[0]).toBeInTheDocument();

    fireEvent.click(continueButton);

    expect(document.getElementById('isFromIPA-no')).not.toBeChecked();
    expect(document.getElementById('isFromIPA-note-helper-text')?.textContent).toBe(
      'Inserisci il codice IPA di riferimento'
    );
    expect(continueButton).toBeDisabled();

    fireEvent.click(document.getElementById('isFromIPA-no') as HTMLElement);
    expect(document.getElementById('isFromIPA-no')).toBeChecked();
    expect(document.getElementById('isFromIPA-yes')).not.toBeChecked();

    expect(document.getElementById('isFromIPA-note-helper-text')?.textContent).toBeUndefined();
  }

  expect(continueButton).toBeEnabled();

  fireEvent.click(continueButton);
};

const executeStepAddManager = async () => {
  console.log('Testing step add manager..');

  await waitFor(() => screen.getByText('Indica il Legale Rappresentante'));

  screen.getByText('Più informazioni sui ruoli');

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeDisabled();

  await checkCertifiedUserValidation('LEGAL', confirmButton);

  await fillUserForm(confirmButton, 'LEGAL', 'SRNNMA80A01A794F', 'b@b.BB', true);

  fireEvent.click(confirmButton);
};

const executeStepAddAdmin = async (
  expectedSuccessfulSubmit: boolean,
  isTechPartner: boolean = false,
  isAggregator: boolean = false
) => {
  console.log('Testing step add admin..');

  await waitFor(() => screen.getByText("Indica l'Amministratore"));

  screen.getByText('Più informazioni sui ruoli');

  const prevStep = isTechPartner ? 'Inserisci i dati dell’ente' : 'Indica il Legale Rappresentante';

  const [_, confirmButton] = await checkBackForwardNavigation(prevStep, "Indica l'Amministratore");

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
    isTechPartner ? 0 : 1,
    'b@b.bb',
    isTechPartner ? 0 : 1
  );

  await waitFor(() => expect(confirmButton).toBeEnabled());

  expect(addDelegateButton).toBeEnabled();
  await waitFor(() => checkAdditionalUsers(confirmButton, isTechPartner));

  await waitFor(() => fireEvent.click(confirmButton));

  if (!isTechPartner) {
    const confimationModalBtn = await waitFor(() => screen.getByText('Conferma'));

    await waitFor(() => fireEvent.click(confimationModalBtn));
  }

  if (!isAggregator) {
    await waitFor(() =>
      screen.getByText(
        isTechPartner && expectedSuccessfulSubmit
          ? 'Richiesta di registrazione inviata'
          : expectedSuccessfulSubmit
          ? 'Richiesta di adesione inviata'
          : 'Qualcosa è andato storto.'
      )
    );
  }
};

const executeStepUploadAggregates = async () => {
  console.log('Testing step upload aggregates..');

  await waitFor(() => screen.getByText('Indica i soggetti aggregati per App IO'));

  const upload = document.getElementById('file-uploader') as HTMLElement;
  const continueButton = screen.getByRole('button', { name: 'Continua' });
  const downloadExampleCsv = screen.getByText('Scarica l’esempio');
  fireEvent.click(downloadExampleCsv);

  const csvWithErrors = screen.queryByText(/Il file contiene uno o più errori/);
  const invalidFormatFile = screen.queryByText(/Il formato del file non è valido/);

  expect(continueButton).toBeDisabled();

  userEvent.upload(upload, aggregatesCsv);

  await waitFor(() => expect(continueButton).toBeEnabled());
  fireEvent.click(continueButton);

  expect(csvWithErrors).not.toBeInTheDocument();
  expect(invalidFormatFile).not.toBeInTheDocument();
  await waitFor(() => screen.getByText('Richiesta di adesione inviata'));
};

const checkCertifiedUserValidation = async (prefix: string, confirmButton: HTMLElement) => {
  await fillUserForm(confirmButton, prefix, 'FRRMRA80A01F205X', 'b@c.BB', false);
  await waitFor(() => screen.getByText('Nome non corretto o diverso dal Codice Fiscale'));
  screen.getByText('Cognome non corretto o diverso dal Codice Fiscale');
};

const fillInstitutionTypeCheckbox = async (element: string) => {
  const selectedInstitutionType = document.getElementById(element) as HTMLElement;
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
  county?: string,
  country?: string,
  from: Source = 'IPA',
  institutionType?: string,
  isAoo?: boolean,
  isForeignInsurance: boolean = false,
  haveTaxCode: boolean = true
) => {
  if (from !== 'IPA' && from !== 'INFOCAMERE' && from !== 'PDND_INFOCAMERE') {
    if (institutionType !== 'SA' && institutionType !== 'AS') {
      fireEvent.change(document.getElementById(businessNameInput) as HTMLElement, {
        target: { value: 'businessNameInput' },
      });
      fireEvent.change(document.getElementById(mailPECInput) as HTMLElement, {
        target: { value: 'a@a.it' },
      });

      const taxCodeElement = document.getElementById(taxCodeInput) as HTMLElement;

      if (haveTaxCode) {
        fireEvent.change(taxCodeElement, {
          target: { value: '00000000000' },
        });
      } else {
        expect(taxCodeElement).not.toBeInTheDocument();
      }
    }

    fireEvent.change(document.getElementById(registeredOfficeInput) as HTMLElement, {
      target: { value: 'registeredOfficeInput' },
    });

    const input = isForeignInsurance ? 'Spa' : 'Mil';
    const expectedOption = isForeignInsurance ? 'Spagna' : 'Milano';

    const autocomplete = document.getElementById((isForeignInsurance ? country : city) as string);
    userEvent.type(autocomplete, input);

    const option = await screen.findByText(expectedOption, {}, { timeout: 8000 });
    expect(option).toBeInTheDocument();
    fireEvent.click(option);

    if (!isForeignInsurance) {
      fireEvent.change(document.getElementById(zipCode) as HTMLElement, {
        target: { value: '09010' },
      });
      expect(document.getElementById(county) as HTMLElement).toHaveValue('MI');
    } else {
      fireEvent.change(document.getElementById('city') as HTMLElement, {
        target: { value: 'Valencia' },
      });
    }

    if (institutionType !== 'PT' && institutionType !== 'AS' && institutionType !== 'PSP') {
      fireEvent.change(document.getElementById(rea) as HTMLInputElement, {
        target: { value: 'MI-12345' },
      });
    }
  } else {
    const isTaxCodeEquals2PIVA = document.getElementById('taxCodeEquals2VatNumber') as HTMLElement;
    fireEvent.click(isTaxCodeEquals2PIVA);

    expect((document.getElementById('vatNumber') as HTMLInputElement).value).toBe(
      (document.getElementById('taxCode') as HTMLInputElement).value
    );
  }

  if (from !== 'IVASS' || !isForeignInsurance) {
    fireEvent.change(document.getElementById(vatNumber) as HTMLElement, {
      target: { value: '00000000000' },
    });
  }

  const vatNumberGroup = document.getElementById('vatNumberGroup') as HTMLElement;
  const commercialRegisterNumber = document.getElementById(
    'commercialRegisterNumber'
  ) as HTMLElement;
  const registrationInRegister = document.getElementById('registrationInRegister') as HTMLElement;
  const registerNumber = document.getElementById('registerNumber') as HTMLElement;
  const abiCode = document.getElementById('abiCode') as HTMLElement;
  const dpoDataSection = document.getElementById('dpo-data-section') as HTMLElement;

  if (institutionType === 'PSP') {
    expect(dpoDataSection).toBeInTheDocument();
    expect(vatNumberGroup).toBeInTheDocument();
    fireEvent.click(vatNumberGroup);

    const dpoAddress = document.getElementById('dpoAddress') as HTMLElement;
    const dpoPecAddress = document.getElementById('dpoPecAddress') as HTMLElement;
    const dpoEmailAddress = document.getElementById('dpoEmailAddress') as HTMLElement;

    fireEvent.change(dpoAddress as HTMLInputElement, {
      target: { value: 'Via milano 5' },
    });
    fireEvent.change(dpoPecAddress as HTMLInputElement, {
      target: { value: 'dpopec@mailtest.com' },
    });
    fireEvent.change(dpoEmailAddress as HTMLInputElement, {
      target: { value: 'dpomail@mailtest.com' },
    });

    fireEvent.change(commercialRegisterNumber as HTMLInputElement, {
      target: { value: '1234455566' },
    });
    await waitFor(() =>
      expect(document.getElementById('commercialRegisterNumber-helper-text')?.textContent).toBe(
        'Il n. Iscrizione al Registro delle Imprese non è valido'
      )
    );

    fireEvent.change(commercialRegisterNumber as HTMLInputElement, {
      target: { value: '12344555667' },
    });
    await waitFor(() =>
      expect(
        document.getElementById('commercialRegisterNumber-helper-text')?.textContent
      ).toBeUndefined()
    );

    fireEvent.change(registrationInRegister as HTMLInputElement, {
      target: { value: '123' },
    });

    fireEvent.change(registerNumber as HTMLInputElement, {
      target: { value: '24' },
    });

    fireEvent.change(abiCode as HTMLInputElement, {
      target: { value: '4' },
    });
    await waitFor(() =>
      expect(document.getElementById('abiCode-helper-text')?.textContent).toBe(
        'Il Codice ABI non è valido'
      )
    );

    fireEvent.change(abiCode as HTMLInputElement, {
      target: { value: '23321' },
    });
    await waitFor(() =>
      expect(document.getElementById('abiCode-helper-text')?.textContent).toBeUndefined()
    );
  } else {
    expect(vatNumberGroup).not.toBeInTheDocument();
    expect(commercialRegisterNumber).not.toBeInTheDocument();
    expect(registrationInRegister).not.toBeInTheDocument();
    expect(registerNumber).not.toBeInTheDocument();
    expect(abiCode).not.toBeInTheDocument();
    expect(dpoDataSection).not.toBeInTheDocument();
  }

  if (
    (institutionType === 'PA' && !isAoo) ||
    institutionType === 'GSP' ||
    institutionType === 'PSP'
  ) {
    fireEvent.change(document.getElementById(recipientCode) as HTMLElement, {
      target: { value: 'A1B2C3D' },
    });
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
  institutionType: string,
  expectedBusinessName: string = '',
  expectedRegisteredOfficeInput: string = '',
  expectedMailPEC: string = '',
  expectedZipCode: string = '',
  expectedTaxCode: string = '',
  expectedVatNumber: string = '',
  expectedRecipientCode: string = '',
  expectedCity: string = '',
  expectedCounty: string = '',
  isForeignInsurance?: boolean,
  haveTaxCode?: boolean
) => {
  expect((document.getElementById('businessName') as HTMLInputElement).value).toBe(
    institutionType === 'SA'
      ? mockedANACParties[0].description
      : institutionType === 'AS'
      ? haveTaxCode
        ? isForeignInsurance
          ? mockedInsuranceResource.items[0].description
          : mockedInsuranceResource.items[2].description
        : mockedInsuranceResource.items[4].description
      : institutionType === 'SCP' || institutionType === 'PRV'
      ? mockedPartiesFromInfoCamere[0].businessName
      : expectedBusinessName
  );
  expect((document.getElementById('digitalAddress') as HTMLInputElement).value).toBe(
    institutionType === 'SA'
      ? mockedANACParties[0].digitalAddress
      : institutionType === 'AS'
      ? haveTaxCode
        ? isForeignInsurance
          ? mockedInsuranceResource.items[0].digitalAddress
          : mockedInsuranceResource.items[2].digitalAddress
        : mockedInsuranceResource.items[4].digitalAddress
      : institutionType === 'SCP' || institutionType === 'PRV'
      ? mockedPartiesFromInfoCamere[0].digitalAddress
      : expectedMailPEC
  );

  if (haveTaxCode) {
    expect((document.getElementById('taxCode') as HTMLInputElement).value).toBe(
      institutionType === 'SA'
        ? mockedANACParties[0].taxCode
        : institutionType === 'AS'
        ? isForeignInsurance
          ? mockedInsuranceResource.items[0].taxCode
          : mockedInsuranceResource.items[2].taxCode
        : institutionType === 'SCP' || institutionType === 'PRV'
        ? mockedPartiesFromInfoCamere[0].businessTaxId
        : expectedTaxCode
    );
  }

  if (isForeignInsurance) {
    expect((document.getElementById('city') as HTMLInputElement).value).toBe('Valencia');
    expect((document.getElementById('country-select') as HTMLInputElement).value).toBe('Spagna');
  } else {
    expect((document.getElementById('zipCode') as HTMLInputElement).value).toBe(
      institutionType === 'SCP' || institutionType === 'PRV'
        ? mockedPartiesFromInfoCamere[0].zipCode
        : expectedZipCode
    );
    expect((document.getElementById('vatNumber') as HTMLInputElement).value).toBe(
      expectedVatNumber
    );
    expect((document.getElementById('city-select') as HTMLInputElement).value).toBe(
      institutionType === 'SCP' || institutionType === 'PRV'
        ? mockedPartiesFromInfoCamere[0].city
        : expectedCity
    );
    expect((document.getElementById('county') as HTMLInputElement).value).toBe(
      institutionType === 'SCP' || institutionType === 'PRV'
        ? mockedPartiesFromInfoCamere[0].county
        : expectedCounty
    );
  }

  if (institutionType === 'PA' || institutionType === 'GSP' || institutionType === 'PSP') {
    expect((document.getElementById('recipientCode') as HTMLInputElement).value).toBe(
      expectedRecipientCode
    );
  }

  if (institutionType === 'SA') {
    fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
      target: { value: 'business register place' },
    });
    fireEvent.change(document.getElementById('rea') as HTMLElement, {
      target: { value: 'MI-12345' },
    });
    fireEvent.change(document.getElementById('shareCapital') as HTMLElement, {
      target: { value: '€ 332.323' },
    });
  }

  expect((document.getElementById('registeredOffice') as HTMLInputElement).value).toBe(
    institutionType === 'SCP' || institutionType === 'PRV'
      ? mockedPartiesFromInfoCamere[0].address
      : expectedRegisteredOfficeInput
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

const checkAdditionalUsers = async (confirmButton: HTMLElement, isTechPartner: boolean) => {
  console.log('Adding additional user');
  await checkRemovingEmptyAdditionalUser(0, confirmButton);

  await fillAdditionalUserAndCheckUniqueValues(0, confirmButton, isTechPartner);
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
  confirmButton: HTMLElement,
  isTechPartner: boolean
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
    isTechPartner ? 0 : 1,
    'b@b.bb',
    isTechPartner ? 0 : 1
  );
  await checkAlreadyExistentValues(
    prefix,
    confirmButton,
    'SRNNMA80A01A794F',
    taxCode,
    isTechPartner ? 0 : 1,
    'a@a.aa',
    email,
    2
  );
  await checkAlreadyExistentValues(
    prefix,
    confirmButton,
    'SRNNMA80A01A794F',
    taxCode,
    isTechPartner ? 0 : 1,
    'a@a.aa',
    email,
    2
  );
};

const billingData2billingDataRequest = (
  institutionType: string,
  SfeAvailable?: boolean,
  from: Source = 'IPA',
  errorOnSubmit?: boolean,
  typeOfSearch: Search = 'businessName',
  isForeignInsurance?: boolean,
  haveTaxCode?: boolean
) => ({
  businessName: errorOnSubmit
    ? mockPartyRegistry.items[1].description
    : from === 'NO_IPA'
    ? 'businessNameInput'
    : from === 'ANAC'
    ? mockedANACParties[0].description
    : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
    ? mockedPartiesFromInfoCamere[0].businessName
    : from === 'IVASS'
    ? haveTaxCode
      ? isForeignInsurance
        ? mockedInsuranceResource.items[0].description
        : mockedInsuranceResource.items[2].description
      : mockedInsuranceResource.items[4].description
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].description
    : typeOfSearch === 'aooCode'
    ? mockedAoos[0].denominazioneAoo
    : typeOfSearch === 'uoCode'
    ? mockedUos[0].descrizioneUo
    : mockPartyRegistry.items[0].description,
  registeredOffice: errorOnSubmit
    ? mockPartyRegistry.items[1].address
    : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
    ? mockedPartiesFromInfoCamere[0].address
    : from !== 'IPA'
    ? 'registeredOfficeInput'
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].address
    : typeOfSearch === 'aooCode'
    ? mockedAoos[0].indirizzo
    : typeOfSearch === 'uoCode'
    ? mockedUos[0].indirizzo
    : mockPartyRegistry.items[0].address,
  digitalAddress: errorOnSubmit
    ? mockPartyRegistry.items[1].digitalAddress
    : from === 'NO_IPA'
    ? 'a@a.it'
    : from === 'ANAC'
    ? mockedANACParties[0].digitalAddress
    : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
    ? mockedPartiesFromInfoCamere[0].digitalAddress
    : from === 'IVASS'
    ? haveTaxCode
      ? isForeignInsurance
        ? mockedInsuranceResource.items[0].digitalAddress
        : mockedInsuranceResource.items[2].digitalAddress
      : mockedInsuranceResource.items[4].digitalAddress
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].digitalAddress
    : typeOfSearch === 'aooCode'
    ? mockedAoos[0].mail1
    : typeOfSearch === 'uoCode'
    ? mockedUos[0].mail1
    : mockPartyRegistry.items[0].digitalAddress,
  zipCode: errorOnSubmit
    ? mockPartyRegistry.items[1].zipCode
    : isForeignInsurance
    ? undefined
    : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
    ? mockedPartiesFromInfoCamere[0].zipCode
    : from !== 'IPA'
    ? '09010'
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].zipCode
    : typeOfSearch === 'aooCode'
    ? mockedAoos[0].CAP
    : typeOfSearch === 'uoCode'
    ? mockedUos[0].CAP
    : mockPartyRegistry.items[0].zipCode,
  taxCode: errorOnSubmit
    ? mockPartyRegistry.items[1].taxCode
    : from === 'IPA'
    ? typeOfSearch === 'taxCode'
      ? mockedParties[0].taxCode
      : typeOfSearch === 'aooCode'
      ? mockedAoos[0].codiceFiscaleEnte
      : typeOfSearch === 'uoCode'
      ? mockedUos[0].codiceFiscaleEnte
      : mockPartyRegistry.items[0].taxCode
    : from === 'NO_IPA'
    ? '00000000000'
    : from === 'ANAC'
    ? mockedANACParties[0].taxCode
    : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
    ? mockedPartiesFromInfoCamere[0].businessTaxId
    : from === 'IVASS'
    ? haveTaxCode
      ? isForeignInsurance
        ? mockedInsuranceResource.items[0].taxCode
        : mockedInsuranceResource.items[2].taxCode
      : mockedInsuranceResource.items[4].taxCode
    : '12345678911',
  vatNumber: errorOnSubmit
    ? mockPartyRegistry.items[1].taxCode
    : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
    ? mockedPartiesFromInfoCamere[0].businessTaxId
    : from === 'IPA'
    ? typeOfSearch === 'taxCode'
      ? mockedParties[0].taxCode
      : typeOfSearch === 'aooCode'
      ? mockedAoos[0].codiceFiscaleEnte
      : typeOfSearch === 'uoCode'
      ? mockedUos[0].codiceFiscaleEnte
      : mockPartyRegistry.items[0].taxCode
    : from === 'NO_IPA' || from === 'ANAC'
    ? '00000000000'
    : from === 'IVASS'
    ? isForeignInsurance
      ? undefined
      : '00000000000'
    : '12345678911',
  taxCodeInvoicing: SfeAvailable
    ? errorOnSubmit
      ? '75656445456'
      : typeOfSearch === 'taxCode'
      ? '998877665544'
      : '87654321098'
    : undefined,
  recipientCode: errorOnSubmit
    ? 'A2B3C4'
    : // MERGE THIS CONDITIONS
    institutionType === 'PSP'
    ? 'A1B2C3'
    : (from === 'IPA' || institutionType === 'GSP') && typeOfSearch !== 'aooCode'
    ? typeOfSearch === 'taxCode'
      ? 'A3B4C5'
      : 'A1B2C3'
    : undefined,
});

const verifySubmit = async (
  productId: string = 'prod-io',
  institutionType: string,
  from: Source = 'IPA',
  uo: boolean = false,
  errorOnSubmit: boolean = false,
  typeOfSearch: Search = 'businessName',
  isForeignInsurance?: boolean | undefined,
  haveTaxCode: boolean = true,
  isAggregator?: boolean
) => {
  const SfeAvailable = (uo || institutionType === 'PA') && canInvoice(institutionType, productId);
  await waitFor(() =>
    expect(fetchWithLogsSpy).lastCalledWith(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
      },
      {
        data: {
          billingData: billingData2billingDataRequest(
            institutionType,
            SfeAvailable,
            from,
            errorOnSubmit,
            typeOfSearch,
            isForeignInsurance,
            haveTaxCode
          ),
          institutionType,
          productId,
          origin:
            from === 'IPA'
              ? 'IPA'
              : from === 'IVASS'
              ? 'IVASS'
              : from === 'INFOCAMERE'
              ? 'INFOCAMERE'
              : from === 'PDND_INFOCAMERE'
              ? 'PDND_INFOCAMERE'
              : from === 'ANAC'
              ? 'ANAC'
              : undefined,
          originId: errorOnSubmit
            ? mockPartyRegistry.items[1].originId
            : from === 'NO_IPA'
            ? undefined
            : from === 'ANAC'
            ? mockedANACParties[0].originId
            : from === 'IVASS'
            ? haveTaxCode
              ? isForeignInsurance
                ? mockedInsuranceResource.items[0].originId
                : mockedInsuranceResource.items[2].originId
              : mockedInsuranceResource.items[4].originId
            : from === 'INFOCAMERE'
            ? undefined
            : from === 'PDND_INFOCAMERE'
            ? '00112233445'
            : typeOfSearch === 'taxCode'
            ? mockedParties[0].originId
            : typeOfSearch === 'aooCode'
            ? mockedAoos[0].codiceUniAoo
            : typeOfSearch === 'uoCode'
            ? mockedUos[0].codiceUniUo
            : '991',
          taxCode: errorOnSubmit
            ? mockPartyRegistry.items[1].taxCode
            : from === 'NO_IPA'
            ? '00000000000'
            : from === 'ANAC'
            ? mockedANACParties[0].taxCode
            : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
            ? mockedPartiesFromInfoCamere[0].businessTaxId
            : from === 'IVASS'
            ? haveTaxCode
              ? isForeignInsurance
                ? mockedInsuranceResource.items[0].taxCode
                : mockedInsuranceResource.items[2].taxCode
              : mockedInsuranceResource.items[4]?.taxCode
            : typeOfSearch === 'taxCode'
            ? mockedParties[0].taxCode
            : typeOfSearch === 'aooCode'
            ? mockedAoos[0].codiceFiscaleEnte
            : typeOfSearch === 'uoCode'
            ? mockedUos[0].codiceFiscaleEnte
            : mockPartyRegistry.items[0].taxCode,
          additionalInformations:
            productId === 'prod-pagopa' && institutionType === 'GSP'
              ? {
                  agentOfPublicService: false,
                  agentOfPublicServiceNote: '',
                  belongRegulatedMarket: true,
                  establishedByRegulatoryProvision: false,
                  establishedByRegulatoryProvisionNote: '',
                  ipa: from === 'IPA',
                  ipaCode: from === 'IPA' ? '991' : '',
                  otherNote: 'optionalPartyInformations-note',
                  regulatedMarketNote: '',
                }
              : undefined,
          companyInformations:
            (from === 'ANAC' ||
              from === 'INFOCAMERE' ||
              from === 'PDND_INFOCAMERE' ||
              (institutionType === 'GSP' && from !== 'IPA')) &&
            institutionType !== 'PT'
              ? {
                  businessRegisterPlace: from === 'ANAC' ? 'business register place' : undefined,
                  shareCapital: from === 'ANAC' ? 332323 : undefined,
                  rea:
                    from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
                      ? mockedPartiesFromInfoCamere[0].cciaa.concat(
                          '-',
                          mockedPartiesFromInfoCamere[0].nRea
                        )
                      : 'MI-12345',
                }
              : undefined,
          pspData:
            institutionType === 'PSP'
              ? {
                  abiCode: '23321',
                  businessRegisterNumber: '12344555667',
                  dpoData: {
                    address: 'Via milano 5',
                    email: 'dpomail@mailtest.com',
                    pec: 'dpopec@mailtest.com',
                  },
                  legalRegisterName: '123',
                  legalRegisterNumber: '24',
                  vatNumberGroup: true,
                }
              : undefined,
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
          ].filter((u) => (institutionType === 'PT' ? u.role !== 'MANAGER' : u)),
          pricingPlan: 'FA',
          geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
            ? [{ code: nationalValue, desc: 'ITALIA' }]
            : [],
          institutionLocationData: isForeignInsurance
            ? {
                city: 'Valencia',
                county: undefined,
                country: 'ES',
              }
            : (institutionType === 'SCP' || institutionType === 'PRV') &&
              (from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE')
            ? {
                city: mockedPartiesFromInfoCamere[0].city,
                county: mockedPartiesFromInfoCamere[0].county,
                country:
                  institutionType === 'SCP' && productId === 'prod-interop' ? 'IT' : undefined,
              }
            : {
                city: 'Milano',
                county: 'MI',
                country: 'IT',
              },
          assistanceContacts:
            typeOfSearch !== 'aooCode' &&
            institutionType !== 'PT' &&
            (from === 'IPA' || from === 'NO_IPA')
              ? { supportEmail: 'a@a.it' }
              : undefined,
          subunitType:
            typeOfSearch === 'aooCode' ? 'AOO' : typeOfSearch === 'uoCode' ? 'UO' : undefined,
          subunitCode:
            typeOfSearch === 'aooCode'
              ? mockedAoos[0].codiceUniAoo
              : typeOfSearch === 'uoCode'
              ? mockedUos[0].codiceUniUo
              : undefined,
          isAggregator,
          aggregates: isAggregator ? [] : undefined,
        },
        method: 'POST',
      },
      expect.any(Function)
    )
  );
};
