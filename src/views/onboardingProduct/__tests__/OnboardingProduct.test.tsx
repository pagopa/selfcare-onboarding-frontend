import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import '@testing-library/jest-dom';
import { InstitutionType, User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import OnboardingProduct from '../OnboardingProduct';
import '../../../locale';
import { canInvoice, PRODUCT_IDS } from '../../../utils/constants';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import {
  mockedCategories,
  mockedPdndVisuraInfomacere,
} from '../../../lib/__mocks__/mockApiRequests';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import {
  checkCorrectBodyBillingData,
  executeGoHome,
  executeStepAddAdmin,
  executeStepAddManager,
  fillInstitutionTypeCheckbox,
  fillUserBillingDataForm,
  performLogout,
  Search,
  Source,
  verifySubmit,
} from '../../../utils/test-utils';
import { createStore } from '../../../redux/store';
import { Provider } from 'react-redux';

jest.setTimeout(40000);

jest.mock('../../../lib/api-utils');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation: any) => Object.assign(mockedLocation, nextLocation),
    push: mockedHistoryPush,
  }),
}));

let fetchWithLogsSpy: jest.SpyInstance;
let aggregatesCsv: File;

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
  i18n.changeLanguage('it');
  Object.defineProperty(window, 'location', { value: mockedLocation });
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../../lib/api-utils'), 'fetchWithLogs');
  Object.assign(mockedLocation, initialLocation);
  aggregatesCsv = new File(['csv data'], 'aggregates.csv', { type: 'multipart/form-data' });
});

const filterByCategory4Test = (institutionType?: string, productId?: string) => {
  if (productId === PRODUCT_IDS.SEND) {
    return mockedCategories.product['prod-pn'].ipa.PA;
  } else if (productId === PRODUCT_IDS.IDPAY_MERCHANT) {
    return mockedCategories.product['prod-idpay-merchant']?.merchantDetails?.atecoCodes;
  } else if (institutionType === 'GSP') {
    return mockedCategories.product.default.ipa.GSP;
  } else {
    return mockedCategories.product.default.ipa.PA;
  }
};

const renderComponent = (productId: string, injectedStore?: ReturnType<typeof createStore>) => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);
    const store = injectedStore ? injectedStore : createStore();
    const history = createMemoryHistory();

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
            <Router history={history}>
              <OnboardingProduct productId={productId} />
            </Router>
          </UserContext.Provider>
        </HeaderContext.Provider>
      </Provider>
    );
  };

  render(<Component />);
  return { history };
};

test('Test: Successfull complete onboarding request of PA party for prod-io search by business name', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
  await executeStepSearchParty(PRODUCT_IDS.IO, 'PA', 'AGENCY X', 'businessName');
  await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.IO, 'PA', fetchWithLogsSpy, 'IPA', false, false, 'businessName');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PA party for prod-io search by tax code', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.IO,
    'PA',
    'Comune Di Milano',
    'taxCode',
    undefined,
    '33445673222'
  );
  await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'Comune di Milano');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.IO, 'PA', fetchWithLogsSpy, 'IPA', false, false, 'taxCode');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of AOO party for product prod-interop', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'PA',
    'denominazione aoo test 1',
    'aooCode',
    'A356E00'
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    'PA',
    true,
    false,
    'IPA',
    'denominazione aoo test 1'
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.INTEROP, 'PA', fetchWithLogsSpy, 'IPA', false, false, 'aooCode');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of UO party for product prod-io-sign', async () => {
  renderComponent(PRODUCT_IDS.IO_SIGN);
  await executeStepInstitutionType(PRODUCT_IDS.IO_SIGN, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.IO_SIGN,
    'PA',
    'denominazione uo test 1',
    'uoCode',
    'A1B2C3'
  );
  await executeStepBillingData(
    PRODUCT_IDS.IO_SIGN,
    'PA',
    false,
    true,
    'IPA',
    'denominazione uo test 1'
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.IO_SIGN, 'PA', fetchWithLogsSpy, 'IPA', true, false, 'uoCode');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of GSP party searching from IPA source for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'GSP');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'GSP',
    'AGENCY X',
    'businessName',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    false
  );
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'GSP', false, false, 'IPA', 'AGENCY X');
  await executeStepAdditionalInfo('IPA');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'GSP', fetchWithLogsSpy, 'IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of GSP party without searching on IPA source for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'GSP');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'GSP',
    'AGENCY X',
    'businessName',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    true,
    false
  );
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'GSP', false, false, 'NO_IPA', 'AGENCY X');
  await executeStepAdditionalInfo('NO_IPA');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'GSP', fetchWithLogsSpy, 'NO_IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of GPU for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'GPU');
  await executeStepBillingData(
    PRODUCT_IDS.PAGOPA,
    'GPU',
    false,
    false,
    'NO_IPA',
    'Mocked GPU name',
    false
  );
  await executeStepAdditionalGpuInformations();
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'GPU', fetchWithLogsSpy, 'NO_IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PT for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PT');
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'PT', false, false, 'NO_IPA');
  await executeStepAddAdmin(true, true, false, false, true);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'PT', fetchWithLogsSpy, 'NO_IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PSP for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PSP');
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'PSP', false, false, 'NO_IPA');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'PSP', fetchWithLogsSpy, 'NO_IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of SA for product prod-interop search by business name', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'SA');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'SA',
    'descriptionAnac1',
    'businessName',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(PRODUCT_IDS.INTEROP, 'SA', false, false, 'ANAC', 'descriptionAnac1');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    'SA',
    fetchWithLogsSpy,
    'ANAC',
    false,
    false,
    'businessName'
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of SA for product prod-interop search by tax code', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'SA');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'SA',
    'descriptionAnac1',
    'taxCode',
    undefined,
    '12345678911',
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(PRODUCT_IDS.INTEROP, 'SA', false, false, 'ANAC', 'descriptionAnac1');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.INTEROP, 'SA', fetchWithLogsSpy, 'ANAC', false, false, 'taxCode');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of foreign AS for product prod-interop search by business name', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'AS');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'AS',
    'mocked foreign insurance company 1',
    'businessName',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    'AS',
    false,
    false,
    'IVASS',
    'mocked foreign insurance company 1',
    true
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    'AS',
    fetchWithLogsSpy,
    'IVASS',
    false,
    false,
    'businessName',
    true
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of italian AS for product prod-interop search by ivass code', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'AS');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'AS',
    'mocked italian insurance company 1',
    'ivassCode',
    undefined,
    undefined,
    '232DC',
    undefined,
    undefined,
    false,
    undefined,
    false
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    'AS',
    false,
    false,
    'IVASS',
    'mocked italian insurance company 1',
    false
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    'AS',
    fetchWithLogsSpy,
    'IVASS',
    false,
    false,
    'taxCode',
    false
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of italian AS without tax code for product prod-interop search by ivass code', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'AS');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'AS',
    'mocked italian insurance company without taxcode',
    'ivassCode',
    undefined,
    undefined,
    '4431B',
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    'AS',
    false,
    false,
    'IVASS',
    'mocked italian insurance company without taxcode',
    false,
    false
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    'AS',
    fetchWithLogsSpy,
    'IVASS',
    false,
    false,
    'taxCode',
    false,
    false
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of SCP for product prod-interop search from infocamere with tax code', async () => {
  await completeOnboardingPdndInfocamereRequest('SCP');
});

test('Test: Successfull complete onboarding request of PRV for product prod-interop search from infocamere with tax code', async () => {
  await completeOnboardingPdndInfocamereRequest('PRV');
});

test('Test: Successfull complete onboarding request of PA aggregator party for prod-io search by business name', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.IO,
    'PA',
    'AGENCY X',
    'businessName',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    false,
    true
  );
  await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, true, false, false);
  await executeStepUploadAggregates();
  await verifySubmit(
    PRODUCT_IDS.IO,
    'PA',
    fetchWithLogsSpy,
    'IPA',
    false,
    false,
    'businessName',
    undefined,
    true,
    true
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PRV for product prod-pagopa skipping step search party', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'oth');
  await executeStepBillingData(
    PRODUCT_IDS.PAGOPA,
    'PRV',
    false,
    false,
    undefined,
    'Mocked private 1',
    false
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.PAGOPA,
    'PRV',
    fetchWithLogsSpy,
    undefined,
    false,
    false,
    undefined,
    false,
    undefined,
    undefined
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PRV party for prod-idpay-merchant search by taxCode', async () => {
  renderComponent(PRODUCT_IDS.IDPAY_MERCHANT);
  await executeStepInstitutionType(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV');
  await executeStepSearchParty(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    mockedPdndVisuraInfomacere[0].businessName,
    'taxCode',
    undefined,
    '12345678901'
  );
  await executeStepBillingData(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV', false, false, 'PDND_INFOCAMERE');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    fetchWithLogsSpy,
    'PDND_INFOCAMERE',
    false,
    false,
    'taxCode'
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PRV party for prod-idpay-merchant search by reaCode', async () => {
  renderComponent(PRODUCT_IDS.IDPAY_MERCHANT);
  await executeStepInstitutionType(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV');
  await executeStepSearchParty(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    mockedPdndVisuraInfomacere[0].businessName,
    'reaCode',
    undefined,
    undefined,
    undefined,
    'MI-123456'
  );
  await executeStepBillingData(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV', false, false, 'PDND_INFOCAMERE');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    fetchWithLogsSpy,
    'PDND_INFOCAMERE',
    false,
    false,
    'taxCode'
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PRV_PF party for prod-idpay-merchant search by personalTaxCode', async () => {
  renderComponent(PRODUCT_IDS.IDPAY_MERCHANT);
  await executeStepInstitutionType(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV');
  await executeStepSearchParty(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    mockedPdndVisuraInfomacere[5].businessName,
    'personalTaxCode',
    undefined,
    undefined,
    undefined,
    undefined,
    'LGGLGD80A01B354S'
  );
  await executeStepBillingData(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV_PF',
    false,
    false,
    'PDND_INFOCAMERE',
    undefined,
    false,
    false,
    'personalTaxCode'
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV_PF',
    fetchWithLogsSpy,
    'PDND_INFOCAMERE',
    false,
    false,
    'personalTaxCode'
  );
  await executeGoHome(mockedLocation);
});

test('Test: Error on submit onboarding request of PA party for prod-io search by business name', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
  await executeStepSearchParty(PRODUCT_IDS.IO, 'PA', 'AGENCY ERROR', 'businessName');
  await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'AGENCY ERROR');
  await executeStepAddManager(false);
  await executeStepAddAdmin(false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.IO, 'PA', fetchWithLogsSpy, 'IPA', false, true);
  await executeGoHome(mockedLocation);
});

test('Test: Party already onboarded for a product that allow add new user, so the link is available', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'PA',
    'AGENCY ONBOARDED',
    'businessName',
    undefined,
    undefined,
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
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'PA',
    'AGENCY INFO ERROR',
    'businessName',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true
  );
  await waitFor(() => screen.getByText('Qualcosa è andato storto'));
  await executeGoHome(mockedLocation);
});

test('Test: Invalid productId', async () => {
  renderComponent('error');
  await waitFor(() => expect(fetchWithLogsSpy).toHaveBeenCalledTimes(2));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('Test: Exiting during flow with unload event', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(PRODUCT_IDS.PAGOPA, 'PA', 'AGENCY X', 'businessName');
  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  await waitFor(
    () =>
      (event.returnValue as unknown as string) ===
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
  );
});

test('Test: Exiting during flow with logout', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');

  await executeStepSearchParty(PRODUCT_IDS.IO, 'PA', 'AGENCY X', 'businessName');

  expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull();

  const logoutButton = screen.getByText('LOGOUT');
  await performLogout(logoutButton);

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Esci' }));
  await waitFor(() => expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGOUT));
});

test('Test: Search trying to type invalid characters', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'AGENCY X ())!/!/££!' } });

  await waitFor(() => screen.getByText('AGENCY X'));
});

test('Test: RecipientCode input client validation', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(PRODUCT_IDS.PAGOPA, 'PA', 'AGENCY X', 'businessName');
  const confirmButtonEnabled = await waitFor(() =>
    screen.getByRole('button', { name: 'Continua' })
  );
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

const completeOnboardingPdndInfocamereRequest = async (institutionType: InstitutionType) => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, institutionType);
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    institutionType,
    'Mocked business 1',
    'taxCode',
    undefined,
    '00112233445',
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    institutionType,
    false,
    false,
    'PDND_INFOCAMERE',
    'Mocked business 1',
    false
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    institutionType,
    fetchWithLogsSpy,
    'PDND_INFOCAMERE',
    false,
    false,
    'taxCode',
    false
  );
  await executeGoHome(mockedLocation);
};

const executeStepInstitutionType = async (productSelected: string, institutionType: string) => {
  if (
    productSelected !== PRODUCT_IDS.SEND &&
    productSelected !== PRODUCT_IDS.IDPAY &&
    productSelected !== PRODUCT_IDS.IDPAY_MERCHANT
  ) {
    await waitFor(() => screen.getByText('Seleziona il tipo di ente che rappresenti'));

    screen.getByText(/Indica il tipo di ente che aderirà a/);

    await waitFor(() => {
      fillInstitutionTypeCheckbox(institutionType);

      const confirmButtonEnabled = screen.getByText('Continua');

      expect(confirmButtonEnabled).toBeEnabled();

      fireEvent.click(confirmButtonEnabled);
    });
  } else {
    if (productSelected === PRODUCT_IDS.IDPAY_MERCHANT) {
      await waitFor(() => screen.getByText('Cerca il tuo ente'), { timeout: 5000 });
    } else {
      // Per SEND e IDPAY
      fillInstitutionTypeCheckbox('pa');
    }
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
  reaCode?: string,
  personalTaxCode?: string,
  expectedError: boolean = false,
  withoutIpa: boolean = false,
  isAggregator: boolean = false
) => {
  console.log('Testing step search party..');

  screen.getByText('Cerca il tuo ente');

  await waitFor(() => expect(fetchWithLogsSpy).toHaveBeenCalledTimes(2));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  const withoutIpaLink = document.getElementById('no_ipa') as HTMLElement;
  if (productId === PRODUCT_IDS.PAGOPA && institutionType === 'GSP') {
    expect(withoutIpaLink).toBeInTheDocument();
    if (withoutIpa) {
      fireEvent.click(withoutIpaLink);
      return;
    }
  } else {
    expect(withoutIpaLink).not.toBeInTheDocument();
  }

  const aggregatorCheckbox = screen.queryByLabelText('Sono un ente aggregatore') as HTMLElement;

  if (productId === PRODUCT_IDS.IO) {
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

      expect(fetchWithLogsSpy).toHaveBeenCalledTimes(3);
      expect(fetchWithLogsSpy).toHaveBeenNthCalledWith(
        3,
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
                : filterByCategory4Test(institutionType.toUpperCase(), productId),
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
    case 'reaCode':
    case 'personalTaxCode':
      const selectWrapper = document.getElementById('party-type-select');
      const input = selectWrapper?.firstChild as HTMLElement;
      fireEvent.keyDown(input, { keyCode: 40 });

      const option = document.getElementById(typeOfSearch) as HTMLElement;
      fireEvent.click(option);

      const valueToSet =
        typeOfSearch === 'taxCode'
          ? taxCode
          : typeOfSearch === 'ivassCode'
            ? ivassCode
            : typeOfSearch === 'reaCode'
              ? reaCode
              : typeOfSearch === 'personalTaxCode'
                ? personalTaxCode
                : subUnitCode;

      if (typeOfSearch === personalTaxCode) {
        expect(
          screen.getByText(
            'Se fai parte di una catena di negozi, l’adesione deve essere fatta dalla società capogruppo.'
          )
        ).toBeInTheDocument();

        fireEvent.change(inputPartyName, { target: { value: valueToSet } });

        expect(screen.getByRole('button', { name: 'Continua' })).toBeEnabled();

        fireEvent.change(inputPartyName, { target: { value: 'RSSLCU80A01F205N' } });

        expect(
          screen.getByText('Il codice ATECO inserito non è ammesso per l’adesione al portale')
        ).toBeInTheDocument();

        fireEvent.change(inputPartyName, { target: { value: 'FRSMRA70D30G786G' } });

        expect(
          screen.getByText(
            'La tua società non può aderire al portale perché risulta cessata o in liquidazione'
          )
        ).toBeInTheDocument();

        expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled();
      }

      if (typeOfSearch === reaCode) {
        expect(
          screen.getByText(
            'se l’esercente fa parte di una catena è la società padre a dover aderire'
          )
        ).toBeInTheDocument();

        fireEvent.change(inputPartyName, { target: { value: valueToSet } });

        expect(screen.getByRole('button', { name: 'Continua' })).toBeEnabled();

        fireEvent.change(inputPartyName, { target: { value: 'RM-234567' } });

        expect(
          screen.getByText(
            'Il codice ATECO al quale sei abilitato non corrisponde con quelli idonei al Bonus Elettrodomestici'
          )
        ).toBeInTheDocument();

        expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled();
      }

      if (typeOfSearch === taxCode && productId === PRODUCT_IDS.IDPAY_MERCHANT) {
        expect(
          screen.getByText(
            'se l’esercente fa parte di una catena è la società padre a dover aderire'
          )
        ).toBeInTheDocument();

        fireEvent.change(inputPartyName, { target: { value: valueToSet } });

        expect(screen.getByRole('button', { name: 'Continua' })).toBeEnabled();

        fireEvent.change(inputPartyName, { target: { value: '98765432109' } });

        expect(
          screen.getByText(
            'Il codice ATECO al quale sei abilitato non corrisponde con quelli idonei al Bonus Elettrodomestici'
          )
        ).toBeInTheDocument();

        expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled();
      }

      fireEvent.change(inputPartyName, { target: { value: valueToSet } });

      const endpoint =
        typeOfSearch === 'taxCode' || typeOfSearch === 'personalTaxCode'
          ? institutionType === 'SA'
            ? 'ONBOARDING_GET_SA_PARTY_FROM_FC'
            : institutionType === 'SCP' ||
                (institutionType === 'PRV' && productId !== PRODUCT_IDS.IDPAY_MERCHANT)
              ? 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE'
              : productId === PRODUCT_IDS.IDPAY_MERCHANT
                ? 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_CF'
                : 'ONBOARDING_GET_PARTY_FROM_CF'
          : typeOfSearch === 'aooCode'
            ? 'ONBOARDING_GET_AOO_CODE_INFO'
            : typeOfSearch === 'uoCode'
              ? 'ONBOARDING_GET_UO_CODE_INFO'
              : typeOfSearch === 'reaCode'
                ? 'ONBOARDING_GET_VISURA_INFOCAMERE_BY_REA'
                : 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE';

      const endpointParams =
        typeOfSearch === 'taxCode'
          ? institutionType === 'SA'
            ? { taxId: taxCode }
            : { id: taxCode }
          : typeOfSearch === 'personalTaxCode'
            ? institutionType === 'SA'
              ? { taxId: personalTaxCode }
              : { id: personalTaxCode }
            : typeOfSearch === 'aooCode'
              ? { codiceUniAoo: subUnitCode }
              : typeOfSearch === 'uoCode'
                ? { codiceUniUo: subUnitCode }
                : typeOfSearch === 'reaCode'
                  ? undefined
                  : { taxId: ivassCode };

      const updatedParams =
        typeOfSearch === 'reaCode'
          ? { rea: reaCode }
          : typeOfSearch === 'taxCode' ||
              typeOfSearch === 'ivassCode' ||
              typeOfSearch === 'personalTaxCode'
            ? institutionType === 'SA' || institutionType === 'AS'
              ? undefined
              : {
                  productId: undefined,
                  subunitCode: undefined,
                  taxCode: undefined,
                  categories:
                    institutionType === 'SCP' || institutionType === 'PRV'
                      ? undefined
                      : filterByCategory4Test(institutionType, productId),
                }
            : {
                origin: 'IPA',
                categories: filterByCategory4Test(institutionType, productId),
              };

      // expect(fetchWithLogsSpy).toHaveBeenCalledTimes(3);

      expect(fetchWithLogsSpy).toHaveBeenNthCalledWith(
        3,
        {
          endpoint: endpoint,
          endpointParams: endpointParams,
        },
        {
          method: 'GET',
          params: updatedParams,
        },
        expect.any(Function)
      );

      await waitFor(() => {
        fireEvent.click(
          screen.getByText(
            typeOfSearch === 'taxCode' ||
              typeOfSearch === 'reaCode' ||
              typeOfSearch === 'personalTaxCode'
              ? partyName.toLocaleLowerCase()
              : partyName
          )
        );
      });

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
  haveTaxCode: boolean = true,
  typeOfSearch?: Search
) => {
  console.log('Testing step billing data..');
  await waitFor(() => screen.getByText('Inserisci i dati dell’ente'));

  const isPrivateMerchant =
    (institutionType === 'PRV' || institutionType === 'PRV_PF') &&
    productId === PRODUCT_IDS.IDPAY_MERCHANT;
  const isInvoicable = canInvoice(institutionType.toUpperCase(), productId);

  await fillUserBillingDataForm(
    productId,
    'businessName',
    'registeredOffice',
    'digitalAddress',
    'zipCode',
    'taxCode',
    'vatNumber',
    'recipientCode',
    'holder',
    'iban',
    'confirmIban',
    'supportEmail',
    'rea',
    'city-select',
    'county',
    'country-select',
    from,
    institutionType,
    isAoo,
    isForeignInsurance,
    haveTaxCode,
    typeOfSearch
  );

  const confirmButton = screen.getByRole('button', { name: 'Continua' });

  if (isPrivateMerchant) {
    expect(document.getElementById('recipientCode')).not.toBeInTheDocument();
    expect(document.getElementById('taxCodeInvoicing')).not.toBeInTheDocument();
    expect(document.getElementById('supportEmail')).not.toBeInTheDocument();

    expect(document.getElementById('businessRegisterPlace')).toBeInTheDocument();
    expect(document.getElementById('rea')).toBeInTheDocument();
  } else {
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
          target: { value: 'AABBC' },
        });
        await waitFor(() => screen.getByText('Il codice deve essere di minimo 6 caratteri'));

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
          expect(
            document.getElementById('taxCodeInvoicing') as HTMLInputElement
          ).toBeInTheDocument()
        );
        expect(document.getElementById('taxCodeInvoicing') as HTMLInputElement).toBeDisabled();

        fireEvent.change(document.getElementById('taxCodeInvoicing') as HTMLInputElement, {
          target: { value: '87654321092' },
        });
        await waitFor(() =>
          screen.getByText('Il Codice Fiscale inserito non è relativo al tuo ente')
        );

        await waitFor(() => expect(confirmButton).toBeDisabled());

        fireEvent.change(document.getElementById('taxCodeInvoicing') as HTMLInputElement, {
          target: { value: taxCodeInvoicingInput },
        });
      }
    } else {
      expect(document.getElementById('taxCodeInvoicing')).not.toBeInTheDocument();
    }

    if (from !== 'IPA') {
      checkCorrectBodyBillingData(
        institutionType,
        productId,
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
  }

  await waitFor(() => expect(confirmButton).toBeEnabled());
  fireEvent.click(confirmButton);
};

const executeStepAdditionalInfo = async (from: 'IPA' | 'NO_IPA' = 'IPA') => {
  console.log('Testing step additional informations..');

  await waitFor(() =>
    screen.getByText(
      'Scegli l’opzione che descrive il tuo ente. Se nessuna è appropriata, seleziona “Altro” e inserisci maggiori dettagli.'
    )
  );

  const continueButton = screen.getByLabelText('Continua');

  const isEstabilishedRegulatoryProvisionYesInput = screen
    .getByTestId('isEstabilishedRegulatoryProvision-yes')
    .querySelector('input') as HTMLInputElement;
  const isEstabilishedRegulatoryProvisionNoInput = screen
    .getByTestId('isEstabilishedRegulatoryProvision-no')
    .querySelector('input') as HTMLInputElement;
  const fromBelongsRegulatedMarketYesInput = screen
    .getByTestId('fromBelongsRegulatedMarket-yes')
    .querySelector('input') as HTMLInputElement;
  const fromBelongsRegulatedMarketNoInput = screen
    .getByTestId('fromBelongsRegulatedMarket-no')
    .querySelector('input') as HTMLInputElement;
  const isConcessionaireOfPublicServiceYesInput = screen
    .getByTestId('isConcessionaireOfPublicService-yes')
    .querySelector('input') as HTMLInputElement;
  const isConcessionaireOfPublicServiceNoInput = screen
    .getByTestId('isConcessionaireOfPublicService-no')
    .querySelector('input') as HTMLInputElement;

  fireEvent.click(isEstabilishedRegulatoryProvisionYesInput);
  expect(isEstabilishedRegulatoryProvisionYesInput).toBeChecked();
  fireEvent.click(isEstabilishedRegulatoryProvisionNoInput);
  expect(isEstabilishedRegulatoryProvisionNoInput).toBeChecked();

  fireEvent.click(fromBelongsRegulatedMarketYesInput);
  expect(fromBelongsRegulatedMarketYesInput).toBeChecked();
  fireEvent.click(fromBelongsRegulatedMarketNoInput);
  expect(fromBelongsRegulatedMarketNoInput).toBeChecked();

  fireEvent.click(isConcessionaireOfPublicServiceYesInput);
  expect(isConcessionaireOfPublicServiceYesInput).toBeChecked();
  fireEvent.click(isConcessionaireOfPublicServiceNoInput);
  expect(isConcessionaireOfPublicServiceNoInput).toBeChecked();

  const isFromIPAYesInput = screen
    .getByTestId('isFromIPA-yes')
    .querySelector('input') as HTMLInputElement;
  const isFromIPANoInput = screen
    .getByTestId('isFromIPA-no')
    .querySelector('input') as HTMLInputElement;

  if (from === 'IPA') {
    expect(isFromIPAYesInput).toBeDisabled();
    expect(isFromIPANoInput).toBeDisabled();
    expect(isFromIPAYesInput).toBeChecked();
    expect(isFromIPANoInput).not.toBeChecked();
  } else {
    expect(isFromIPAYesInput).not.toBeDisabled();
    expect(isFromIPANoInput).not.toBeDisabled();
    expect(isFromIPAYesInput).not.toBeChecked();
    expect(isFromIPANoInput).toBeChecked();

    // Test click su isFromIPA solo se non è disabilitato
    fireEvent.click(isFromIPAYesInput);
    expect(isFromIPAYesInput).toBeChecked();
    fireEvent.click(isFromIPANoInput);
    expect(isFromIPANoInput).toBeChecked();
  }

  if (from !== 'IPA') {
    expect(continueButton).not.toBeEnabled();
  } else {
    expect(continueButton).toBeEnabled();
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

  if (from !== 'IPA') {
    expect(isFromIPANoInput).toBeChecked();
    fireEvent.click(isFromIPAYesInput);
    expect(isFromIPANoInput).not.toBeChecked();
    expect(isFromIPAYesInput).toBeChecked();

    expect(screen.getAllByText('Inserisci il codice IPA di riferimento')[1]).toBeInTheDocument();

    fireEvent.click(continueButton);

    expect(document.getElementById('isFromIPA-note-helper-text')?.textContent).toBe(
      'Inserisci il codice IPA di riferimento'
    );
    expect(continueButton).toBeDisabled();

    fireEvent.click(isFromIPANoInput);
    expect(isFromIPANoInput).toBeChecked();
    expect(isFromIPAYesInput).not.toBeChecked();

    expect(document.getElementById('isFromIPA-note-helper-text')?.textContent).toBeUndefined();
  }

  expect(continueButton).toBeEnabled();
  fireEvent.click(continueButton);
};

const executeStepAdditionalGpuInformations = async () => {
  console.log('Testing step additional gpu informations...');

  await waitFor(() =>
    screen.getByText('Seleziona tra le opzioni quella che descrive il tuo ente.')
  );

  const continueButton = screen.getByText('Continua');
  const businessRegisterNumber = document.getElementById(
    'businessRegisterNumber'
  ) as HTMLInputElement;
  const legalRegisterNumber = document.getElementById('legalRegisterNumber') as HTMLInputElement;
  const legalRegisterName = document.getElementById('legalRegisterName') as HTMLInputElement;
  const isPartyRegisteredTrue = document.getElementById('isPartyRegisteredTrue') as HTMLElement;
  const isPartyRegisteredFalse = document.getElementById('isPartyRegisteredFalse') as HTMLElement;
  const isPartyProvidingAServiceTrue = document.getElementById(
    'isPartyProvidingAServiceTrue'
  ) as HTMLElement;
  const isPartyProvidingAServiceFalse = document.getElementById(
    'isPartyProvidingAServiceFalse'
  ) as HTMLElement;
  const longTermPaymentsTrue = document.getElementById('longTermPaymentsTrue') as HTMLElement;
  const manager = document.getElementById('manager') as HTMLElement;
  const managerAuthorized = document.getElementById('managerAuthorized') as HTMLElement;
  const managerEligible = document.getElementById('managerEligible') as HTMLElement;
  const managerProsecution = document.getElementById('managerProsecution') as HTMLElement;
  const institutionCourtMeasures = document.getElementById(
    'institutionCourtMeasures'
  ) as HTMLElement;
  expect(continueButton).toBeDisabled();

  await waitFor(() => {
    expect(businessRegisterNumber).toBeDisabled();
    expect(legalRegisterNumber).toBeDisabled();
    expect(legalRegisterName).toBeDisabled();
  });

  fireEvent.click(isPartyRegisteredTrue);
  fireEvent.click(isPartyProvidingAServiceTrue);
  fireEvent.click(longTermPaymentsTrue);

  // Change di tutti i vari checkbox
  fireEvent.click(manager);
  fireEvent.click(managerAuthorized);
  fireEvent.click(managerEligible);
  fireEvent.click(managerProsecution);
  fireEvent.click(institutionCourtMeasures);

  expect(manager).toBeChecked();
  expect(managerAuthorized).toBeChecked();
  expect(managerEligible).toBeChecked();
  expect(managerProsecution).toBeChecked();
  expect(institutionCourtMeasures).toBeChecked();

  expect(continueButton).not.toBeDisabled();

  // Casistica di controllo validazione campi
  fireEvent.click(continueButton);

  // Pulizia validazione campi
  fireEvent.click(isPartyRegisteredFalse);
  fireEvent.click(isPartyProvidingAServiceFalse);

  // Riabilitazione campi di testo per effetturare il change
  fireEvent.click(isPartyRegisteredTrue);
  fireEvent.click(isPartyProvidingAServiceTrue);

  await waitFor(() => {
    expect(businessRegisterNumber).not.toBeDisabled();
    expect(legalRegisterNumber).not.toBeDisabled();
    expect(legalRegisterName).not.toBeDisabled();
  });

  fireEvent.change(businessRegisterNumber, { target: { value: 'a 1' } });
  fireEvent.change(legalRegisterNumber, { target: { value: 'a22' } });
  fireEvent.change(legalRegisterName, { target: { value: 'a 1' } });

  expect(businessRegisterNumber.value).toBe('a 1');
  expect(legalRegisterNumber.value).toBe('a22');
  expect(legalRegisterName.value).toBe('a 1');

  fireEvent.click(isPartyRegisteredFalse);
  fireEvent.click(isPartyProvidingAServiceFalse);

  expect(businessRegisterNumber.value).toBe('');
  expect(legalRegisterNumber.value).toBe('');
  expect(legalRegisterName.value).toBe('');

  fireEvent.click(isPartyRegisteredTrue);
  fireEvent.click(isPartyProvidingAServiceTrue);

  fireEvent.change(businessRegisterNumber, { target: { value: 'Comunale 12' } });
  fireEvent.change(legalRegisterNumber, { target: { value: '250301' } });
  fireEvent.change(legalRegisterName, { target: { value: 'SkiPass' } });

  fireEvent.click(continueButton);
};

const executeStepUploadAggregates = async () => {
  console.log('Testing step upload aggregates..');

  await waitFor(() => screen.getByText('Indica i soggetti aggregati per IO'));

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
