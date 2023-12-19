import React, { useEffect } from 'react';
import { fireEvent, getByLabelText, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import '@testing-library/jest-dom';
import { User } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import Onboarding from '../Onboarding';
import '../../../locale';
import { nationalValue } from '../../../model/GeographicTaxonomies';

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

const step1Title = 'Cerca il tuo ente';
const stepInstitutionType = 'Seleziona il tipo di ente che rappresenti';
const stepBillingDataTitle = 'Indica i dati del tuo ente';
const step2Title = 'Indica il Legale Rappresentante';
const step3Title = "Indica l'Amministratore";

const completeSuccessTitle = 'Richiesta di adesione inviata';
const completeSuccessTitleForPt = 'Richiesta di registrazione inviata';
const completeErrorTitle = 'Spiacenti, qualcosa è andato storto.';

const filterByCategory = (productId: string, institutionType: string) =>
  productId === 'prod-pn'
    ? 'L6,L4,L45'
    : institutionType === 'gsp'
    ? 'L37,SAG'
    : 'C17,C16,L10,L19,L13,L2,C10,L20,L21,L22,L15,L1,C13,C5,L40,L11,L39,L46,L8,L34,L7,L35,L45,L47,L6,L12,L24,L28,L42,L36,L44,C8,C3,C7,C14,L16,C11,L33,C12,L43,C2,L38,C1,L5,L4,L31,L18,L17,S01,SA';

test('test already onboarded', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa');
  await executeStep1('AGENCY ONBOARDED', 'prod-pagopa', 'pa');
  await waitFor(() => screen.getByText("L'Ente che hai scelto ha già aderito"));
  await executeGoHome(false);
});

test('onboarding of pa with origin IPA', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa');
  await executeStep1('AGENCY X', 'prod-pagopa', 'pa');
  const searchCitySelect = document.getElementById('city-select') as HTMLInputElement;
  const searchCounty = document.getElementById('county');

  await waitFor(() => expect(searchCitySelect.value).toBe('Palermo'));
  await waitFor(() => expect(searchCounty).toBeDisabled());
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
});

test('test error retrieving onboarding info', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa');
  await executeStep1('AGENCY INFO ERROR', 'prod-pagopa', 'pa');
  await waitFor(() => screen.getByText('Spiacenti, qualcosa è andato storto.'));
  await executeGoHome(false);
});

test('test search trying to type invalid characters', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa');
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'AGENCY ERROR ())!/!/££!' } });

  await waitFor(() => screen.getByText('AGENCY ERROR'));
});

test('test error productID', async () => {
  renderComponent('error');
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  await waitFor(() => screen.getByText('Impossibile individuare il prodotto desiderato'));
});

test('test complete', async () => {
  renderComponent('prod-idpay');
  await executeStepInstitutionType('prod-idpay');
  await executeStep1('AGENCY X', 'prod-idpay', 'pa');
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(true);
  await verifySubmit();
  await executeGoHome(true);
});

test('test complete with error on submit', async () => {
  renderComponent('prod-cgn');
  await executeStepInstitutionType('prod-cgn');
  await executeStep1('AGENCY ERROR', 'prod-cgn', 'pa');
});

test('test exiting during flow with unload event', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa');
  await executeStep1('AGENCY X', 'prod-pagopa', 'pa');
  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  await waitFor(
    () =>
      (event.returnValue as unknown as string) ===
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
  );
});

test('test exiting during flow with logout', async () => {
  renderComponent('prod-idpay');
  await executeStepInstitutionType('prod-idpay');

  await executeStep1('AGENCY X', 'prod-idpay', 'pa');

  expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull();

  const logoutButton = screen.getByRole('button', { name: 'LOGOUT' });
  await performLogout(logoutButton);

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Esci' }));
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LOGOUT));
});

test('test advanced search business name', async () => {
  renderComponent();
  await executeStepInstitutionType('prod-pn');
  await executeAdvancedSearchForBusinessName('AGENCY X');
});

test('test advanced search taxcode', async () => {
  renderComponent();
  await executeStepInstitutionType('prod-pn');
  await executeAdvancedSearchForTaxCode('Comune di Milano');
});

test.skip('test billingData without Support Mail', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop');
  await executeStep1('AGENCY ERROR', 'prod-interop', 'pa');
  await executeStepBillingDataWithoutSupportMail();
});

test('test complete onboarding AOO with product interop', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionType('prod-interop');
  await executeAdvancedSearchForAoo();
  await executeStep2();
  await executeStep3(true);
  const onboardingCompleted = await waitFor(() =>
    screen.getByText('Richiesta di adesione inviata')
  );
  expect(onboardingCompleted).toBeInTheDocument();
});

test('test label recipientCode only for institutionType is not PA', async () => {
  renderComponent('prod-io-sign');
  await executeStepInstitutionTypeScp();
  await executeStepBillingDataLabels();
});
ENV.PT.SHOW_PT &&
  test.skip('test prod-io only for institutionType is PT and PT already onboarded', async () => {
    renderComponent('prod-pagopa');
    await executeStepInstitutionTypePt();
    await executeStepBillingDataLabelsForPtAlreadyOnboarded();
  });

ENV.PT.SHOW_PT &&
  test.skip('test prod-pagopa only for institutionType is PT', async () => {
    renderComponent('prod-pagopa');
    await executeStepInstitutionTypePt();
    await executeStepBillingDataLabelsForPt();
    await executeStep2();
    await executeStep3(true, true);
    await verifySubmitPt('prod-pagopa');
  });

test.skip('test party search if gps for prod-interop', async () => {
  renderComponent('prod-interop');
  await executeStepInstitutionTypeGspForInterop();
  await executeStep1('AGENCY X', 'prod-interop', 'gsp');
  await executeStepBillingData();
  await executeStep2();
  await executeStep3(true);
  await verifySubmit('prod-interop');
  await executeGoHome(true);
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
const executeStep1 = async (partyName: string, productId: string, institutionType: string) => {
  console.log('Testing step 1');

  screen.getByText(step1Title);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

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
        categories: filterByCategory(productId, institutionType),
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

const executeStep1Base = async (partyName: string) => {
  console.log('Testing step 1 Base');
  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  screen.getByText(step1Title);

  expect(document.getElementById('Parties')).toBeTruthy();
  fireEvent.change(document.getElementById('Parties') as HTMLElement, { target: { value: 'XXX' } });

  await waitFor(() => fireEvent.click(screen.getByText(partyName)));

  expect(screen.getByRole('button', { name: 'Continua' })).toBeEnabled();
  await waitFor(() => fireEvent.click(confirmButton));
  expect(screen.getByText('Indica i dati del tuo ente'));
};

const executeAdvancedSearchForBusinessName = async (partyName: string) => {
  console.log('Testing step 1');

  screen.getByText(step1Title);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  const selectWrapper = document.getElementById('party-type-select');
  const input = selectWrapper?.firstChild as HTMLElement;
  fireEvent.keyDown(input, { keyCode: 40 });

  const option = (await document.getElementById('businessName')) as HTMLElement;
  fireEvent.click(option);

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
  const inputPartyName = document.getElementById('Parties') as HTMLElement;
  const selectWrapper = document.getElementById('party-type-select');

  const input = selectWrapper?.firstChild as HTMLElement;
  fireEvent.keyDown(input, { keyCode: 40 });

  const option = (await document.getElementById('taxCode')) as HTMLElement;
  fireEvent.click(option);

  expect(inputPartyName).toBeTruthy();
  await waitFor(() => fireEvent.change(inputPartyName, { target: { value: '33445673222' } }));

  expect(fetchWithLogsSpy).toBeCalledTimes(2);

  fireEvent.click(screen.getByText('comune di milano'));

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
};

const executeAdvancedSearchForAoo = async () => {
  console.log('Testing Advanced search for aoo');

  screen.getByText(step1Title);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  const selectWrapper = document.getElementById('party-type-select');
  const input = selectWrapper?.firstChild as HTMLElement;
  fireEvent.keyDown(input, { keyCode: 40 });

  const option = document.getElementById('aooCode') as HTMLElement;
  fireEvent.click(option);
  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'A356E00' } });

  const partyNameSelection = await waitFor(() => screen.getByText('denominazione aoo test'));

  expect(fetchWithLogsSpy).toBeCalledTimes(3);

  fireEvent.click(partyNameSelection);

  const confirmButton = await waitFor(() => screen.getByRole('button', { name: 'Continua' }));
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(7));

  const aooCode = document.getElementById('aooUniqueCode') as HTMLInputElement;
  const aooName = document.getElementById('aooName') as HTMLInputElement;

  await waitFor(() => expect(aooCode.value).toBe('A356E00'));
  await waitFor(() => expect(aooName.value).toBe('Denominazione Aoo Test'));

  const searchCitySelect = document.getElementById('city-select') as HTMLInputElement;
  expect(searchCitySelect.value).toBe('Palermo');

  const isTaxCodeEquals2PIVA = document.getElementById('onboardingFormData');
  expect(isTaxCodeEquals2PIVA).toBeTruthy();

  const vatNumber = document.getElementById('vatNumber') as HTMLInputElement;

  fireEvent.change(vatNumber as HTMLElement, {
    target: { value: 'AAAAAA44D55F456K' },
  });

  const continueButton = await waitFor(() => screen.getByRole('button', { name: 'Continua' }));
  expect(continueButton).toBeEnabled();

  fireEvent.click(continueButton);
};

const executeAdvancedSearchForUo = async () => {
  console.log('Testing Advanced search for uo');

  screen.getByText(step1Title);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  const selectWrapper = document.getElementById('party-type-select');
  const input = selectWrapper?.firstChild as HTMLElement;
  fireEvent.keyDown(input, { keyCode: 40 });
  const option = (await waitFor(() => document.getElementById('uoCode'))) as HTMLElement;

  fireEvent.click(option);

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'UF9YK6' } });

  const partyNameSelection = await waitFor(() => screen.getByText('denominazione uo test'));

  expect(fetchWithLogsSpy).toBeCalledTimes(3);

  fireEvent.click(partyNameSelection);

  const confirmButton = await waitFor(() => screen.getByRole('button', { name: 'Continua' }));
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(6));
};

const executeStepInstitutionType = async (productSelected) => {
  await waitFor(() => screen.getByText(stepInstitutionType));

  if (productSelected !== 'prod-pn' && productSelected !== 'prod-idpay') {
    await fillInstitutionTypeCheckbox('pa');
    screen.getByText(/Indica il tipo di ente che aderirà a/);
    const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
    expect(confirmButtonEnabled).toBeEnabled();

    fireEvent.click(confirmButtonEnabled);
  }
  await waitFor(() => screen.getByText(step1Title));
};

const executeStepInstitutionTypeScp = async () => {
  console.log('Testing step Institution Type');
  await waitFor(() => screen.getByText(stepInstitutionType));

  await fillInstitutionTypeCheckbox('scp');

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButtonEnabled).toBeEnabled();

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText('Indica i dati del tuo ente'));
};

const executeStepInstitutionTypePt = async () => {
  console.log('Testing step Institution Type');
  await waitFor(() => screen.getByText(stepInstitutionType));

  await fillInstitutionTypeCheckbox('pt');

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButtonEnabled).toBeEnabled();

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText('Inserisci i dati'));
};

const executeStepInstitutionTypeGspForInterop = async () => {
  console.log('Testing step Institution Type');
  await waitFor(() => screen.getByText(stepInstitutionType));

  await fillInstitutionTypeCheckbox('gsp');

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButtonEnabled).toBeEnabled();

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(step1Title));
};

const executeStepInstitutionTypeGspForProdIoSign = async () => {
  console.log('Testing step Institution Type for Prod io sign');
  await waitFor(() => screen.getByText(stepInstitutionType));

  const ptLabel = await waitFor(() => screen.queryByText('Partner Tecnologico'));
  expect(ptLabel).not.toBeInTheDocument();

  await fillInstitutionTypeCheckbox('gsp');
  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButtonEnabled).toBeEnabled();

  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText('Indica i dati del tuo ente'));
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
    'supportEmail',
    'city',
    'province'
  );

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());

  fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
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
    'supportEmail',
    'city',
    'province'
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

const executeStepBillingDataLabels = async () => {
  console.log('test label recipientCode only for institutionType !== PA');

  const backButton = screen.getByRole('button', { name: 'Indietro' });

  await waitFor(() => screen.getByText('Indica i dati del tuo ente'));
  expect(screen.getByText('Codice SDI'));

  expect(backButton).toBeEnabled();
  await waitFor(() => fireEvent.click(backButton));
  await waitFor(() => screen.getByText('Seleziona il tipo di ente che rappresenti'));
};

const executeStepBillingDataLabelsForPt = async () => {
  console.log('test label recipientCode only for institutionType !== PA');

  const backButton = screen.getByRole('button', { name: 'Indietro' });

  await waitFor(() => screen.getByText('Inserisci i dati'));
  expect(screen.getByText('Codice SDI'));

  const geotaxArea = screen.queryByText('INDICA L’AREA GEOGRAFICA');
  expect(geotaxArea).not.toBeInTheDocument;

  const assistanceEmail = screen.queryByText('Indirizzo email visibile ai cittadini');
  expect(assistanceEmail).not.toBeInTheDocument;

  await waitFor(() =>
    fillUserBillingDataForm(
      'businessName',
      'registeredOffice',
      'digitalAddress',
      'zipCode',
      'taxCode',
      'vatNumber',
      'recipientCode',
      'city',
      'province'
    )
  );

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());
  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(step2Title));
};

const executeStepBillingDataLabelsForPtAlreadyOnboarded = async () => {
  console.log('test label recipientCode only for institutionType !== PA');

  await waitFor(() => screen.getByText('Inserisci i dati'));
  expect(screen.getByText('Codice SDI'));

  const geotaxArea = screen.queryByText('INDICA L’AREA GEOGRAFICA');
  expect(geotaxArea).not.toBeInTheDocument;

  const assistanceEmail = screen.queryByText('Indirizzo email visibile ai cittadini');
  expect(assistanceEmail).not.toBeInTheDocument;

  await waitFor(() =>
    fillUserBillingDataForm(
      'businessName',
      'registeredOffice',
      'digitalAddress',
      'zipCode',
      'taxCode',
      'vatNumber',
      'recipientCode',
      'city',
      'province'
    )
  );

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());
  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText('Il Partner è già registrato'));
};

const executeStepBillingDataReaField = async () => {
  console.log('Testing step Billing Data');
  await waitFor(() => screen.getByText(stepBillingDataTitle));

  await waitFor(() => screen.getByText('REA'));

  await fillUserBillingDataForm(
    'businessName',
    'registeredOffice',
    'digitalAddress',
    'zipCode',
    'taxCode',
    'vatNumber',
    'recipientCode',
    'supportEmail',
    'rea'
  );

  const confirmButtonEnabled = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(confirmButtonEnabled).toBeEnabled());
  fireEvent.click(confirmButtonEnabled);
  await waitFor(() => screen.getByText(step2Title));
};

const executeStepBillingDataWithoutSupportMail = async () => {
  console.log('execute Step Billing Data Without SupportMail');
  await waitFor(() => screen.getByText(stepBillingDataTitle));
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

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  fireEvent.change(document.getElementById('supportEmail') as HTMLElement, {
    target: { value: 'h' },
  });

  await waitFor(() => screen.getByText('L’indirizzo email non è valido'));

  expect(confirmButton).toBeDisabled();

  fireEvent.change(document.getElementById('supportEmail') as HTMLElement, {
    target: { value: '' },
  });

  await waitFor(() => expect(confirmButton).toBeDisabled());
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

  await waitFor(() => expect(confirmButton).toBeEnabled());

  await checkCorrectBodyBillingData(
    'businessNameInput',
    'registeredOfficeInput',
    'a@a.it',
    '09010',
    'AAAAAA44D55F456K',
    'AAAAAA44D55F456K',
    'recipientCode'
  );
  fireEvent.click(confirmButton);
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

const executeStep3 = async (expectedSuccessfulSubmit: boolean, isTechPartner = false) => {
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

  const confimationModalBtn = await waitFor(() => screen.getByText('Conferma'));

  await waitFor(() => fireEvent.click(confimationModalBtn));

  await waitFor(() =>
    screen.getByText(
      expectedSuccessfulSubmit
        ? !isTechPartner
          ? completeSuccessTitle
          : completeSuccessTitleForPt
        : completeErrorTitle
    )
  );
};

const verifyDescriptionInStep3 = async () => {
  console.log('Testing step 3');
  await waitFor(() => screen.getByText(step3Title));
  expect(
    waitFor(() => screen.getByText('Puoi aggiungere da uno a tre Amministratori o suoi delegati.'))
  );
};

const checkCertifiedUserValidation = async (prefix: string, confirmButton: HTMLElement) => {
  await fillUserForm(confirmButton, prefix, 'FRRMRA80A01F205X', 'b@c.BB', false);
  await waitFor(() => screen.getByText('Nome non corretto o diverso dal Codice Fiscale'));
  screen.getByText('Cognome non corretto o diverso dal Codice Fiscale');
};

const fillInstitutionTypeCheckbox = async (element: string) => {
  fireEvent.click(document.getElementById(element));
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
    target: { value: 'AAAAAA44D55F456K' },
  });

  const isTaxCodeEquals2PIVA = document.getElementById('onboardingFormData');
  expect(isTaxCodeEquals2PIVA).toBeTruthy();

  fireEvent.change(document.getElementById(vatNumber) as HTMLElement, {
    target: { value: 'AAAAAA44D55F456K' },
  });
  fireEvent.change(document.getElementById(recipientCode) as HTMLElement, {
    target: { value: 'recipientCode' },
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
    fireEvent.change(document.getElementById(supportEmail) as HTMLElement, {
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
  taxCode: 'AAAAAA44D55F456K',
  vatNumber: 'AAAAAA44D55F456K',
  recipientCode: 'recipientCode',
});

const verifySubmit = async (productId = 'prod-idpay') => {
  await waitFor(() =>
    expect(fetchWithLogsSpy).lastCalledWith(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
      },
      {
        data: {
          billingData: billingData2billingDataRequest(),
          pspData: undefined,
          ivassCode: undefined,
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
          taxCode: 'AAAAAA44D55F456K',
          companyInformations: undefined,
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
          taxCode: 'AAAAAA44D55F456K',
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
