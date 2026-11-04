import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { expect, MockInstance } from 'vitest';
import { InstitutionType } from '../../../../../types';
import { HeaderContext, UserContext } from '../../../../lib/context';
import { createStore } from '../../../../redux/store';
import { canInvoice, PRODUCT_IDS } from '../../../../utils/constants';
import { ENV } from '../../../../utils/env';
import {
  isGlobalServiceProvider,
  isIoProduct,
  isPrivateMerchantInstitution,
  isPublicAdministration,
} from '../../../../utils/institutionTypeUtils';
import {
  checkCorrectBodyBillingData,
  fillInstitutionTypeCheckbox,
  fillUserBillingDataForm,
  Search,
  Source,
} from '../../../../utils/test/test-utils';
import OnboardingProduct from '../../OnboardingProduct';
import {
  expectedBusinessNameSearchEndpoint,
  expectedBusinessNameSearchParams,
  expectedCodeSearchEndpoint,
  expectedCodeSearchEndpointParams,
  expectedCodeSearchQueryParams,
  type SearchPartyCodes,
  searchCodeValue,
  searchResultLabel,
} from './searchPartyExpectations';

export { filterByCategory4Test } from './searchPartyExpectations';

export const renderComponent = (
  productId: string,
  injectedStore?: ReturnType<typeof createStore>
) => {
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

export const executeStepInstitutionType = async (
  productSelected: string,
  institutionType: string
) => {
  if (
    productSelected !== PRODUCT_IDS.SEND &&
    productSelected !== PRODUCT_IDS.IDPAY &&
    productSelected !== PRODUCT_IDS.IDPAY_MERCHANT
  ) {
    await waitFor(() => screen.getByText('Seleziona il tipo di ente che rappresenti'));

    screen.getByText(/Indica il tipo di ente che aderirà a/);

    await waitFor(() => {
      fillInstitutionTypeCheckbox(institutionType, productSelected);

      const confirmButtonEnabled = screen.getByText('Continua');

      expect(confirmButtonEnabled).toBeEnabled();

      fireEvent.click(confirmButtonEnabled);
    });
  } else {
    await waitFor(() => screen.getByText('Cerca il tuo ente'), { timeout: 5000 });
  }
};

const checkWithoutIpaLink = (
  productId: string,
  institutionType: string,
  withoutIpa: boolean
): boolean => {
  const withoutIpaLink = document.getElementById('no_ipa') as HTMLElement;
  if (
    productId !== PRODUCT_IDS.PAGOPA ||
    !isGlobalServiceProvider(institutionType as InstitutionType)
  ) {
    expect(withoutIpaLink).not.toBeInTheDocument();
    return false;
  }
  expect(withoutIpaLink).toBeInTheDocument();
  if (withoutIpa) {
    fireEvent.click(withoutIpaLink);
  }
  return withoutIpa;
};

const checkAggregatorCheckbox = (
  productId: string,
  institutionType: string,
  isAggregator: boolean
) => {
  const aggregatorCheckbox = screen.queryByLabelText('Sono un ente aggregatore') as HTMLElement;
  const canAggregate =
    ENV.AGGREGATOR.SHOW_AGGREGATOR &&
    isPublicAdministration(institutionType as InstitutionType) &&
    ENV.AGGREGATOR.ELIGIBLE_PRODUCTS.split(',').includes(productId);

  if (!canAggregate) {
    expect(aggregatorCheckbox).not.toBeInTheDocument();
    return;
  }
  expect(aggregatorCheckbox).toBeInTheDocument();
  expect(aggregatorCheckbox).not.toBeChecked();
  if (isAggregator) {
    fireEvent.click(aggregatorCheckbox);
    expect(aggregatorCheckbox).toBeChecked();
  }
};

const searchByBusinessName = async (
  productId: string,
  institutionType: string,
  partyName: string,
  fetchWithLogsSpy: MockInstance,
  inputPartyName: HTMLElement
) => {
  fireEvent.change(inputPartyName, { target: { value: 'XXX' } });

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));

  expect(fetchWithLogsSpy).toHaveBeenCalledTimes(4);
  expect(fetchWithLogsSpy).toHaveBeenNthCalledWith(
    4,
    { endpoint: expectedBusinessNameSearchEndpoint(institutionType) },
    { method: 'GET', params: expectedBusinessNameSearchParams(institutionType, productId) },
    expect.any(Function)
  );
  fireEvent.click(partyNameSelection);
};

const BONUS_ATECO_ERROR =
  'Il codice ATECO al quale sei abilitato non corrisponde con quelli idonei al Bonus Elettrodomestici';
const PARENT_COMPANY_HINT =
  'se l’esercente fa parte di una catena è la società padre a dover aderire';

/** Types a valid code, then an invalid one, and checks the error and the disabled button. */
const checkInvalidCode = (
  inputPartyName: HTMLElement,
  validValue: string | undefined,
  invalidValue: string,
  expectedError: string
) => {
  fireEvent.change(inputPartyName, { target: { value: validValue } });
  expect(screen.getByRole('button', { name: 'Continua' })).toBeEnabled();

  fireEvent.change(inputPartyName, { target: { value: invalidValue } });
  expect(screen.getByText(expectedError)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continua' })).toBeDisabled();
};

// NB: these checks compare the search type with the typed code values, as the original helper
// did: they are kept unchanged to preserve the current test behavior.
const checkCodeValidations = (
  productId: string,
  typeOfSearch: Search,
  codes: SearchPartyCodes,
  valueToSet: string | undefined,
  inputPartyName: HTMLElement
) => {
  if (typeOfSearch === codes.personalTaxCode) {
    checkInvalidCode(
      inputPartyName,
      valueToSet,
      'FRSMRA70D30G786G',
      'La tua società non può aderire al portale perché risulta cessata o in liquidazione'
    );
  }

  if (typeOfSearch === codes.reaCode) {
    expect(screen.getByText(PARENT_COMPANY_HINT)).toBeInTheDocument();
    checkInvalidCode(inputPartyName, valueToSet, 'RM-234567', BONUS_ATECO_ERROR);
  }

  if (typeOfSearch === codes.taxCode && productId === PRODUCT_IDS.IDPAY_MERCHANT) {
    expect(screen.getByText(PARENT_COMPANY_HINT)).toBeInTheDocument();
    checkInvalidCode(inputPartyName, valueToSet, '98765432109', BONUS_ATECO_ERROR);
  }
};

const searchByCode = async (
  productId: string,
  institutionType: string,
  partyName: string,
  typeOfSearch: Search,
  fetchWithLogsSpy: MockInstance,
  codes: SearchPartyCodes,
  inputPartyName: HTMLElement
) => {
  const selectWrapper = document.getElementById('party-type-select');
  const input = selectWrapper?.firstChild as HTMLElement;
  fireEvent.keyDown(input, { keyCode: 40 });

  const option = document.getElementById(typeOfSearch) as HTMLElement;
  fireEvent.click(option);

  const valueToSet = searchCodeValue(typeOfSearch, codes);
  checkCodeValidations(productId, typeOfSearch, codes, valueToSet, inputPartyName);

  fireEvent.change(inputPartyName, { target: { value: valueToSet } });

  const endpoint = expectedCodeSearchEndpoint(typeOfSearch, institutionType, productId);
  expect(fetchWithLogsSpy).toHaveBeenNthCalledWith(
    4,
    {
      endpoint,
      endpointParams: expectedCodeSearchEndpointParams(typeOfSearch, institutionType, codes),
    },
    {
      method: 'GET',
      params: expectedCodeSearchQueryParams(endpoint, institutionType, productId, codes.reaCode),
    },
    expect.any(Function)
  );

  await waitFor(() => {
    fireEvent.click(screen.getByText(searchResultLabel(typeOfSearch, partyName)));
  });
};

const CODE_SEARCHES: ReadonlyArray<Search> = [
  'taxCode',
  'aooCode',
  'uoCode',
  'ivassCode',
  'reaCode',
  'personalTaxCode',
];

const confirmSearchParty = async (isAggregator: boolean) => {
  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  await waitFor(() => fireEvent.click(confirmButton));

  if (isAggregator) {
    await waitFor(() => screen.getByText(/Stai richiedendo l’adesione come ente aggregatore per /));
    const continueButtonModal = screen.getAllByText('Continua')[1];
    fireEvent.click(continueButtonModal);
  }
};

export const executeStepSearchParty = async (
  productId: string,
  institutionType: string,
  partyName: string,
  typeOfSearch: Search,
  fetchWithLogsSpy: MockInstance,
  subUnitCode?: string,
  taxCode?: string,
  ivassCode?: string,
  reaCode?: string,
  personalTaxCode?: string,
  _expectedError: boolean = false,
  withoutIpa: boolean = false,
  isAggregator: boolean = false
) => {
  console.log('Testing step search party..');

  screen.getByText('Cerca il tuo ente');

  await waitFor(() => expect(fetchWithLogsSpy).toHaveBeenCalledTimes(3));
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  if (checkWithoutIpaLink(productId, institutionType, withoutIpa)) {
    return;
  }
  checkAggregatorCheckbox(productId, institutionType, isAggregator);

  if (typeOfSearch === 'businessName') {
    await searchByBusinessName(
      productId,
      institutionType,
      partyName,
      fetchWithLogsSpy,
      inputPartyName
    );
  } else if (CODE_SEARCHES.includes(typeOfSearch)) {
    const codes = { subUnitCode, taxCode, ivassCode, reaCode, personalTaxCode };
    await searchByCode(
      productId,
      institutionType,
      partyName,
      typeOfSearch,
      fetchWithLogsSpy,
      codes,
      inputPartyName
    );
  }

  await confirmSearchParty(isAggregator);
};

/**
 * Clicks the "Indietro" button of the current step and waits for the step identified by
 * `expectedTitle` (text or regex) to be rendered.
 */
export const executeBack = async (expectedTitle: string | RegExp) => {
  const backButton = screen.getByRole('button', { name: 'Indietro' });
  expect(backButton).toBeEnabled();
  fireEvent.click(backButton);
  await waitFor(() => screen.getByText(expectedTitle));
};

export const executeStepContractsSummary = async () => {
  await waitFor(() => screen.getByText('Prepara i documenti'));
  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => fireEvent.click(confirmButton));
};

export const executeStepBillingData = async (
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

  if (isPrivateMerchantInstitution(institutionType as InstitutionType, productId)) {
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

    if (isInvoicable && !isIoProduct(productId)) {
      fireEvent.change(document.getElementById('recipientCode') as HTMLElement, {
        target: { value: recipientCodeInput },
      });

      if (isUo || isPublicAdministration(institutionType as InstitutionType)) {
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

export const executeStepAdditionalInfo = async (from: 'IPA' | 'NO_IPA' = 'IPA') => {
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

export const executeStepAdditionalGpuInformations = async () => {
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

  fireEvent.click(continueButton);

  fireEvent.click(isPartyRegisteredFalse);
  fireEvent.click(isPartyProvidingAServiceFalse);

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

export const executeStepUploadAggregates = async (aggregatesCsv: File) => {
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

const uploadRequiredDocument = async (fileName: string) => {
  const uploader = document.querySelectorAll<HTMLInputElement>('input[type="file"]')[0];
  await userEvent.upload(
    uploader,
    new File([new Uint8Array(1024)], fileName, { type: 'application/pdf' })
  );
  await screen.findByText(fileName);
};

const forwardFromDocumentStep = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Continua' }));

export const executeStepUploadRequiredDocuments = async (fetchWithLogsSpy: MockInstance) => {
  console.log('Testing step upload required documents..');

  await waitFor(() => screen.getByText('Inserisci i documenti'));

  await screen.findByText('DOCUMENTAZIONE SULLA NATURA GIURIDICA');
  await uploadRequiredDocument('statuto.pdf');
  forwardFromDocumentStep();

  await screen.findByText('VISURA CAMERALE');
  await uploadRequiredDocument('visura.pdf');
  forwardFromDocumentStep();

  await screen.findByText('DOCUMENTAZIONE SULLA GESTIONE DEL SERVIZIO PUBBLICO');
  fireEvent.change(screen.getByLabelText('Titolo del documento'), {
    target: { value: 'Convenzione 2024' },
  });
  await uploadRequiredDocument('attestazione.pdf');
  forwardFromDocumentStep();

  await screen.findByText('Riepilogo documenti caricati');
  forwardFromDocumentStep();
  fireEvent.click(await screen.findByRole('button', { name: 'Conferma' }));

  await waitFor(() => screen.getByText('Richiesta di adesione inviata'));

  expect(
    fetchWithLogsSpy.mock.calls
      .filter((call: any) => call[0]?.endpoint === 'ONBOARDING_POST_ATTACHMENT')
      .map((call: any) => call[0].endpointParams)
  ).toEqual([
    { onboardingId: 'mock-onboarding-id', filename: 'statuto.pdf' },
    { onboardingId: 'mock-onboarding-id', filename: 'visura-camerale.pdf' },
    { onboardingId: 'mock-onboarding-id', filename: 'attestazione-gsp.pdf' },
  ]);
  expect(
    fetchWithLogsSpy.mock.calls.filter((call: any) => call[0]?.endpoint === 'TRIGGER_ONBOARDING')
  ).toHaveLength(1);
};
