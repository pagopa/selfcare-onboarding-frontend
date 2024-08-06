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
import { mockedParties, mockPartyRegistry } from '../../../lib/__mocks__/mockApiRequests';

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
  await executeStepBillingData('prod-io', 'pa', false, false, true, 'AGENCY X');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-io', 'PA');
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
  await executeStepBillingData('prod-io', 'pa', false, false, true, 'Comune di Milano');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-io', 'PA', false, false, false, 'taxCode');
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
  await executeStepBillingData('prod-interop', 'pa', true, false, true, 'denominazione aoo test 1');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  // TODO VERIFY SUBMIT
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of UO party for product prod-io-sign', async () => {
  renderComponent('prod-io-sign');
  await executeStepInstitutionType('prod-io-sign', 'pa');
  await executeStepSearchParty('prod-io-sign', 'pa', 'denominazione uo test 1', 'uoCode', 'A1B2C3');
  await executeStepBillingData('prod-io-sign', 'pa', false, true, true, 'denominazione uo test 1');
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  // TODO VERIFY SUBMIT
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of GSP party search from IPA source for product prod-pagopa', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'gsp');
  await executeStepSearchParty(
    'prod-pagopa',
    'gsp',
    'AGENCY X',
    'businessName',
    undefined,
    undefined,
    false,
    false
  );
  await executeStepBillingData('prod-pagopa', 'gsp', false, false, true, 'AGENCY X');
  await executeStepAdditionalInfo(true);
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-pagopa', 'GSP');
  await executeGoHome(true);
});

test('Test: Successfull complete onboarding request of GSP party without search on IPA source for product prod-pagopa', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'gsp');
  await executeStepSearchParty(
    'prod-pagopa',
    'gsp',
    'AGENCY X',
    'businessName',
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData('prod-pagopa', 'gsp', false, false, false, 'AGENCY X');
  await executeStepAdditionalInfo(false);
  await executeStepAddManager();
  await executeStepAddAdmin(true);
  await verifySubmit('prod-pagopa', 'GSP', true);
  await executeGoHome(true);
});

// TODO TEST COMPLETE PT

// TODO TEST COMPLETE AS

// TODO TEST COMPLETE SA

// TODO TEST COMPLETE PSP

// TODO TEST COMPLETE SCP PDND INFOCAMERE

// TODO PA APP IO AGGREGATOR PARTY (IS AGGREGATE, UPLOAD AGGREGATE CSV ETC)

test('Test: Error on submit onboarding request of pa party for prod-io search by business name', async () => {
  renderComponent('prod-io');
  await executeStepInstitutionType('prod-io', 'pa');
  await executeStepSearchParty('prod-io', 'pa', 'AGENCY ERROR', 'businessName');
  await executeStepBillingData('prod-io', 'pa', false, false, true, 'AGENCY ERROR');
  await executeStepAddManager();
  await executeStepAddAdmin(false, false);
  await verifySubmit('prod-io', 'PA', false, false, true);
  await executeGoHome(true);
});

// TODO CAN THIS MERGE WITH executeStepSearchParty
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

test('Test: Search trying to type invalid characters', async () => {
  renderComponent('prod-pagopa');
  await executeStepInstitutionType('prod-pagopa', 'pa');
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'AGENCY X ())!/!/££!' } });

  await waitFor(() => screen.getByText('AGENCY X'));
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
    screen.getByText(/Indica il tipo di ente che aderirà a/);
    await fillInstitutionTypeCheckbox(institutionType);
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
  expectedError: boolean = false,
  withoutIpa: boolean = false
) => {
  console.log('Testing step search party..');

  screen.getByText('Cerca il tuo ente');

  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  const withoutIpaLink = document.getElementById('no_ipa') as HTMLElement;
  if (productId === 'prod-pagopa' && institutionType === 'gsp') {
    expect(withoutIpaLink).toBeInTheDocument();
    if (withoutIpa) {
      fireEvent.click(withoutIpaLink);
      return;
    }
  } else {
    expect(withoutIpaLink).not.toBeInTheDocument();
  }

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
            categories: filterByCategory(institutionType.toUpperCase(), productId),
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

  // TODO FIX ME
  /* await waitFor(() =>
    expect(fetchWithLogsSpy).toBeCalledTimes(expectedError ? 3 : typeOfSearch === 'uoCode' ? 7 : 5)
  ); */
};

const executeStepBillingData = async (
  productId: string,
  institutionType: string,
  isAoo: boolean = false,
  isUo: boolean = false,
  fromIpa: boolean = true,
  partyName: string
) => {
  console.log('Testing step Billing Data..');
  await waitFor(() => screen.getByText('Inserisci i dati dell’ente'));

  // TODO MANAGE ALL CASES
  if (!isAoo && !isUo) {
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
      fromIpa
    );
  } else {
    fireEvent.change(document.getElementById('vatNumber') as HTMLElement, {
      target: { value: '11111111111' },
    });
    fireEvent.change(document.getElementById('supportEmail') as HTMLElement, {
      target: { value: 'mail@mailtest.com' },
    });
  }

  const confirmButton = screen.getByRole('button', { name: 'Continua' });

  const isInvoicable = canInvoice(institutionType, productId);
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

    if (isUo || institutionType === 'pa') {
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

  // TODO MANAGE ALL CASES
  if (!isAoo && !isUo && !fromIpa) {
    await checkCorrectBodyBillingData(
      'businessNameInput',
      'registeredOfficeInput',
      'a@a.it',
      '09010',
      '00000000000',
      '00000000000',
      'A1B2C3',
      'Milano',
      'MI'
    );
  }

  await waitFor(() => expect(confirmButton).toBeEnabled());
  fireEvent.click(confirmButton);
};

const executeStepAdditionalInfo = async (fromIpa: boolean) => {
  console.log('Testing step additional informations..');

  await waitFor(() => screen.getByText('Inserisci ulteriori dettagli'));

  const continueButton = screen.getByText('Continua');
  expect(continueButton).toBeDisabled();

  if (fromIpa) {
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

  if (!fromIpa) {
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

  if (!fromIpa) {
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

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeDisabled();

  await checkCertifiedUserValidation('LEGAL', confirmButton);

  await fillUserForm(confirmButton, 'LEGAL', 'SRNNMA80A01A794F', 'b@b.BB', true);

  fireEvent.click(confirmButton);
};

const executeStepAddAdmin = async (
  expectedSuccessfulSubmit: boolean,
  isTechPartner: boolean = false
) => {
  console.log('Testing step add admin..');

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
      isTechPartner && expectedSuccessfulSubmit
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
  province?: string,
  fromIpa: boolean = true
) => {
  if (!fromIpa) {
    fireEvent.change(document.getElementById(businessNameInput) as HTMLElement, {
      target: { value: 'businessNameInput' },
    });
    fireEvent.change(document.getElementById(registeredOfficeInput) as HTMLElement, {
      target: { value: 'registeredOfficeInput' },
    });
    fireEvent.change(document.getElementById(mailPECInput) as HTMLElement, {
      target: { value: 'a@a.it' },
    });
    fireEvent.change(document.getElementById(zipCode) as HTMLElement, {
      target: { value: '09010' },
    });
    fireEvent.change(document.getElementById(taxCodeInput) as HTMLElement, {
      target: { value: '00000000000' },
    });

    const cityInput = document.getElementById(city);
    userEvent.type(cityInput, 'Mil');

    const option = await screen.findByText('Milano', {}, { timeout: 5000 });
    expect(option).toBeInTheDocument();
    fireEvent.click(option);
    expect(document.getElementById(province) as HTMLElement).toHaveValue('MI');

    if (rea) {
      fireEvent.change(document.getElementById(rea) as HTMLInputElement, {
        target: { value: 'MI-12345' },
      });
    }
  }

  // TODO Test this
  // const isTaxCodeEquals2PIVA = document.getElementById('taxCodeEquals2VatNumber');

  fireEvent.change(document.getElementById(vatNumber) as HTMLElement, {
    target: { value: '00000000000' },
  });

  fireEvent.change(document.getElementById(recipientCode) as HTMLElement, {
    target: { value: 'A1B2C3D' },
  });

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
  expectedRecipientCode: string = '',
  expectedCity: string = '',
  expectedProvince: string = ''
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
  expect((document.getElementById('city-select') as HTMLInputElement).value).toBe(expectedCity);
  expect((document.getElementById('county') as HTMLInputElement).value).toBe(expectedProvince);
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

const billingData2billingDataRequest = (
  SfeAvailable?: boolean,
  withoutIpa?: boolean,
  errorOnSubmit?: boolean,
  typeOfSearch: 'businessName' | 'taxCode' | 'aooCode' | 'uoCode' = 'businessName'
) => ({
  businessName: errorOnSubmit
    ? mockPartyRegistry.items[1].description
    : withoutIpa
    ? 'businessNameInput'
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].description
    : mockPartyRegistry.items[0].description,
  registeredOffice: errorOnSubmit
    ? mockPartyRegistry.items[1].address
    : withoutIpa
    ? 'registeredOfficeInput'
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].address
    : mockPartyRegistry.items[0].address,
  digitalAddress: errorOnSubmit
    ? mockPartyRegistry.items[1].digitalAddress
    : withoutIpa
    ? 'a@a.it'
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].digitalAddress
    : mockPartyRegistry.items[0].digitalAddress,
  zipCode: errorOnSubmit
    ? mockPartyRegistry.items[1].zipCode
    : withoutIpa
    ? '09010'
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].zipCode
    : mockPartyRegistry.items[0].zipCode,
  taxCode: errorOnSubmit
    ? mockPartyRegistry.items[1].taxCode
    : withoutIpa
    ? '00000000000'
    : typeOfSearch === 'taxCode'
    ? mockedParties[0].taxCode
    : mockPartyRegistry.items[0].taxCode,
  taxCodeInvoicing: SfeAvailable
    ? errorOnSubmit
      ? '75656445456'
      : typeOfSearch === 'taxCode'
      ? '998877665544'
      : '87654321098'
    : undefined,
  vatNumber: '00000000000',
  recipientCode: errorOnSubmit ? 'A2B3C4' : typeOfSearch === 'taxCode' ? 'A3B4C5' : 'A1B2C3',
});

const verifySubmit = async (
  productId: string = 'prod-io',
  institutionType: string,
  withoutIpa: boolean = false,
  uo: boolean = false,
  errorOnSubmit: boolean = false,
  typeOfSearch: 'businessName' | 'taxCode' | 'aooCode' | 'uoCode' = 'businessName'
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
            SfeAvailable,
            withoutIpa,
            errorOnSubmit,
            typeOfSearch
          ),
          institutionType,
          productId,
          origin: withoutIpa ? undefined : 'IPA',
          originId: withoutIpa
            ? undefined
            : errorOnSubmit
            ? mockPartyRegistry.items[1].originId
            : typeOfSearch === 'taxCode'
            ? mockedParties[0].originId
            : '991',
          taxCode: errorOnSubmit
            ? mockPartyRegistry.items[1].taxCode
            : withoutIpa
            ? '00000000000'
            : typeOfSearch === 'taxCode'
            ? mockedParties[0].taxCode
            : mockPartyRegistry.items[0].taxCode,
          additionalInformations:
            productId === 'prod-pagopa' && institutionType === 'GSP'
              ? {
                  agentOfPublicService: false,
                  agentOfPublicServiceNote: '',
                  belongRegulatedMarket: true,
                  establishedByRegulatoryProvision: false,
                  establishedByRegulatoryProvisionNote: '',
                  ipa: withoutIpa ? false : true,
                  ipaCode: withoutIpa ? '' : '991',
                  otherNote: 'optionalPartyInformations-note',
                  regulatedMarketNote: '',
                }
              : undefined,
          companyInformations:
            institutionType === 'GSP' && productId === 'prod-pagopa'
              ? withoutIpa
                ? {
                    businessRegisterPlace: undefined,
                    rea: 'MI-12345',
                    shareCapital: undefined,
                  }
                : {
                    businessRegisterPlace: undefined,
                    rea: undefined,
                    shareCapital: undefined,
                  }
              : undefined,
          pspData: undefined,
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
            city: 'Milano',
            country: 'IT',
            county: 'MI',
          },
          assistanceContacts: { supportEmail: 'a@a.it' },
          subunitCode: undefined,
          subunitType: undefined,
          aggregates: undefined,
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
