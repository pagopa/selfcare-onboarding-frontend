/* eslint-disable complexity */
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React, { useState } from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { Provider } from 'react-redux';
import { User } from '../../types';
import {
  mockPartyRegistry,
  mockedANACParties,
  mockedPartiesFromInfoCamere,
  mockedInsuranceResource,
  mockedParties,
  mockedAoos,
  mockedUos,
  mockedPspOnboardingData,
  mockedGeoTaxonomy,
  mockedPdndVisuraInfomacere,
} from '../lib/__mocks__/mockApiRequests';
import { nationalValue } from '../model/GeographicTaxonomies';
import { store } from '../redux/store';
import { HeaderContext, UserContext } from './../lib/context';
import { ENV } from './env';
import { canInvoice, PRODUCT_IDS } from './constants';

export type Source =
  | 'IPA'
  | 'NO_IPA'
  | 'ANAC'
  | 'IVASS'
  | 'INFOCAMERE'
  | 'PDND_INFOCAMERE'
  | 'SELC';
export type Search =
  | 'businessName'
  | 'taxCode'
  | 'aooCode'
  | 'uoCode'
  | 'ivassCode'
  | 'reaCode'
  | 'personalTaxCode';

export const renderComponentWithProviders = (
  component: React.ReactElement,
  productId: string = PRODUCT_IDS.SEND,
  injectedHistory?: ReturnType<typeof createMemoryHistory>
) => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);
    const history = injectedHistory ? injectedHistory : createMemoryHistory();

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
          <Router history={history as any}>
            {React.createElement(component.type, { ...component.props, productId })}
          </Router>
        </UserContext.Provider>
      </HeaderContext.Provider>
    );
  };

  render(
    <Provider store={store}>
      <Component />
    </Provider>
  );
};

export const checkCertifiedUserValidation = async (
  prefix: string,
  addUserFlow: boolean,
  onlyAdmin: boolean
) => {
  await fillUserForm(prefix, 'FRRMRA80A01F205X', 'b@c.BB', addUserFlow, onlyAdmin);
  await waitFor(() => screen.getByText('Nome non corretto o diverso dal Codice Fiscale'));
  screen.getByText('Cognome non corretto o diverso dal Codice Fiscale');
};

export const fillTextFieldAndCheckButton = async (prefix: string, field: string, value: string) => {
  await waitFor(() => {
    const input = screen.getByTestId(`${prefix}-${field}`) as HTMLInputElement;
    fireEvent.change(input, { target: { value } });
  });
};

const checkAlreadyExistentValues = async (
  prefix: string,
  existentTaxCode: string | undefined,
  expectedDuplicateTaxCodeMessages: number | undefined,
  existentEmail: string | undefined,
  expectedDuplicateEmailMessages: number | undefined
) => {
  if (existentTaxCode) {
    await fillTextFieldAndCheckButton(prefix, 'name', 'NAME');
    await fillTextFieldAndCheckButton(prefix, 'surname', 'SURNAME');
    await fillTextFieldAndCheckButton(prefix, 'taxCode', existentTaxCode);
    const duplicateTaxCodeErrors = screen.queryAllByText(
      'Il codice fiscale inserito è già presente'
    );
    expect(duplicateTaxCodeErrors.length).toBe(expectedDuplicateTaxCodeMessages);
  }
  await fillTextFieldAndCheckButton(prefix, 'taxCode', '');

  if (existentEmail) {
    await fillTextFieldAndCheckButton(prefix, 'email', existentEmail);

    const duplicateEmailErrors = screen.queryAllByText("L'indirizzo email inserito è già presente");
    expect(duplicateEmailErrors.length).toBe(expectedDuplicateEmailMessages);
  }
  await fillTextFieldAndCheckButton(prefix, 'email', '');
  await fillTextFieldAndCheckButton(prefix, 'name', '');
  await fillTextFieldAndCheckButton(prefix, 'surname', '');
};

export const fillUserForm = async (
  prefix: string,
  taxCode: string,
  email: string,
  addUserFlow: boolean,
  onlyAdmin: boolean,
  name?: string,
  surname?: string
) => {
  if (prefix === 'delegate-initial' && !addUserFlow && !onlyAdmin) {
    await checkAlreadyExistentValues('delegate-initial', 'SRNNMA80A01A794F', 1, 'b@b.BB', 1);
  }

  await fillTextFieldAndCheckButton(prefix, 'name', name ? name : 'NAME');
  await fillTextFieldAndCheckButton(prefix, 'surname', surname ? surname : 'SURNAME');
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode);
  await fillTextFieldAndCheckButton(prefix, 'email', email);

  await fillTextFieldAndCheckButton(prefix, 'taxCode', '');
  await fillTextFieldAndCheckButton(prefix, 'taxCode', 'INVALIDTAXCODE');
  expect(document.getElementById(`${prefix}-taxCode-helper-text`)).toBeInTheDocument();
  await fillTextFieldAndCheckButton(prefix, 'taxCode', '');
  await fillTextFieldAndCheckButton(prefix, 'taxCode', taxCode);

  await fillTextFieldAndCheckButton(prefix, 'email', '');
  await fillTextFieldAndCheckButton(prefix, 'email', 'INVALIDEMAIL');
  expect(document.getElementById(`${prefix}-email-helper-text`)).toBeInTheDocument();
  await fillTextFieldAndCheckButton(prefix, 'email', '');
  await fillTextFieldAndCheckButton(prefix, 'email', email);
};

export const executeStepAddManager = async (
  addUserFlow: boolean,
  isPremium?: boolean,
  expectedSuccessfulSubmit?: boolean,
  fetchWithLogsSpy?: jest.SpyInstance
) => {
  console.log('Testing step add manager..');

  await waitFor(() => screen.getByText('Indica il Legale Rappresentante'));

  screen.getByText('Più informazioni sui ruoli');

  const continueButton = screen.getByLabelText('Continua');
  expect(continueButton).toBeDisabled();

  await checkCertifiedUserValidation('manager-initial', addUserFlow, false);

  await fillUserForm('manager-initial', 'SRNNMA80A01A794F', 'b@b.BB', addUserFlow, false);

  fireEvent.click(continueButton);

  if (isPremium) {
    await waitFor(() => screen.getByText('Confermi la richiesta di invio?'));
    const confirmButton = screen.getByRole('button', { name: 'Conferma' });
    if (!expectedSuccessfulSubmit && fetchWithLogsSpy) {
      fetchWithLogsSpy.mockRejectedValue(() => Promise.reject({ status: 500 }));
    }

    await waitFor(() => fireEvent.click(confirmButton));

    await waitFor(() =>
      screen.getByText(
        expectedSuccessfulSubmit
          ? 'La richiesta di adesione è stata inviata con successo'
          : 'Qualcosa è andato storto'
      )
    );
  }
};

const clickAdminCheckBoxAndTestValues = (
  confirmButton: HTMLElement,
  addDelegateButton: HTMLElement | null,
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
  if (addDelegateButton) {
    expect(addDelegateButton).toBeDisabled();
  }
};

const checkBackForwardNavigation = async (previousStepTitle: string, actualStepTitle: string) => {
  const goBackButton = screen.getByRole('button', {
    name: 'Indietro',
  });
  expect(goBackButton).toBeEnabled();
  fireEvent.click(goBackButton);

  await waitFor(() => screen.getByText(previousStepTitle));

  const goForwardButton = screen.getByRole('button', {
    name: 'Continua',
  });
  await waitFor(() => expect(goForwardButton).toBeEnabled());
  fireEvent.click(goForwardButton);

  await waitFor(() => screen.getByText(actualStepTitle));
};

const checkLoggedUserAsAdminCheckbox = async (
  confirmButton: HTMLElement,
  addDelegateButton: HTMLElement | null
) => {
  clickAdminCheckBoxAndTestValues(
    confirmButton,
    addDelegateButton,
    'loggedName',
    'loggedSurname',
    'LGGLGD80A01B354S'
  );

  await fillTextFieldAndCheckButton('delegate-initial', 'email', 'a@a.aa');
  if (addDelegateButton) {
    expect(addDelegateButton).toBeEnabled();
  }

  clickAdminCheckBoxAndTestValues(confirmButton, addDelegateButton, '', '', '');
};

export const executeStepAddAdmin = async (
  expectedSuccessfulSubmit: boolean,
  isTechPartner: boolean = false,
  isAggregator: boolean = false,
  addUserFlow: boolean,
  onlyAdmin: boolean
) => {
  console.log('Testing step add admin..');
  console.log('ADD USER FLOW', addUserFlow);

  await waitFor(() => screen.getByText("Indica l'Amministratore"));

  screen.getByText('Più informazioni sui ruoli');

  const prevStep = isTechPartner ? 'Inserisci i dati dell’ente' : 'Indica il Legale Rappresentante';

  await checkBackForwardNavigation(prevStep, "Indica l'Amministratore");

  // eslint-disable-next-line functional/no-let
  let addDelegateButton: HTMLElement | null = null;
  if (!addUserFlow) {
    addDelegateButton = screen.getByRole('button', {
      name: 'Aggiungi un altro Amministratore',
    });
    expect(addDelegateButton).toBeDisabled();
  }
  const continueButton = screen.getByLabelText('Continua');

  await checkLoggedUserAsAdminCheckbox(continueButton, addDelegateButton);

  await checkCertifiedUserValidation('delegate-initial', addUserFlow, onlyAdmin);

  await fillUserForm(
    'delegate-initial',
    'RSSLCU80A01F205N',
    'a@a.AA',
    addUserFlow,
    onlyAdmin,
    'LUCA',
    'ROSSI'
  );

  expect(continueButton).toBeEnabled();
  if (!addUserFlow) {
    expect(addDelegateButton).toBeEnabled();
  }

  fireEvent.click(continueButton);

  if (!isTechPartner) {
    await waitFor(() => screen.getByText('Confermi la richiesta di invio?'));
    const confirmButton = screen.getByRole('button', { name: 'Conferma' });
    await waitFor(() => fireEvent.click(confirmButton));

    await waitFor(() => fireEvent.click(confirmButton));
  }

  if (!isAggregator) {
    await waitFor(() =>
      screen.getByText(
        isTechPartner && expectedSuccessfulSubmit
          ? 'Richiesta di registrazione inviata'
          : expectedSuccessfulSubmit
            ? addUserFlow
              ? 'Hai inviato la richiesta'
              : 'Richiesta di adesione inviata'
            : 'Qualcosa è andato storto.'
      )
    );
  }
};

export const billingData2billingDataRequest = (
  institutionType: string,
  SfeAvailable?: boolean,
  from: Source = 'IPA',
  errorOnSubmit?: boolean,
  typeOfSearch: Search = 'businessName',
  isForeignInsurance?: boolean,
  haveTaxCode?: boolean,
  productId?: string
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isPrivateMerchant = institutionType === 'PRV' && productId === PRODUCT_IDS.IDPAY_MERCHANT;

  return {
    businessName: errorOnSubmit
      ? mockPartyRegistry.items[1].description
      : isPrivateMerchant && typeOfSearch === 'personalTaxCode'
        ? mockedPdndVisuraInfomacere[5].businessName
        : isPrivateMerchant && typeOfSearch === 'taxCode'
          ? mockedPdndVisuraInfomacere[0].businessName
          : from === 'NO_IPA'
            ? 'businessNameInput'
            : from === 'ANAC'
              ? mockedANACParties[0].description
              : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
                ? typeOfSearch === 'personalTaxCode'
                  ? mockedPdndVisuraInfomacere[5].businessName
                  : mockedPartiesFromInfoCamere[0].businessName
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
      : isPrivateMerchant && typeOfSearch === 'personalTaxCode'
        ? mockedPdndVisuraInfomacere[5].digitalAddress
        : isPrivateMerchant && typeOfSearch === 'taxCode'
          ? mockedPdndVisuraInfomacere[0].digitalAddress
          : from === 'NO_IPA'
            ? 'a@a.it'
            : from === 'ANAC'
              ? mockedANACParties[0].digitalAddress
              : from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
                ? typeOfSearch === 'personalTaxCode'
                  ? mockedPdndVisuraInfomacere[5].digitalAddress
                  : mockedPartiesFromInfoCamere[0].digitalAddress
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
      : isPrivateMerchant && typeOfSearch === 'personalTaxCode'
        ? mockedPdndVisuraInfomacere[5].businessTaxId
        : isPrivateMerchant && typeOfSearch === 'taxCode'
          ? mockedPdndVisuraInfomacere[0].businessTaxId
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
      : isPrivateMerchant
        ? mockedPdndVisuraInfomacere[0].businessTaxId
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

    recipientCode: isPrivateMerchant
      ? undefined
      : errorOnSubmit
        ? 'A2B3C4'
        : institutionType === 'PSP'
          ? 'A1B2C3'
          : (from === 'IPA' ||
                institutionType === 'GSP' ||
                (from === 'NO_IPA' && institutionType === 'GPU')) &&
              typeOfSearch !== 'aooCode'
            ? typeOfSearch === 'taxCode'
              ? 'A3B4C5'
              : 'A1B2C3'
            : undefined,
    legalForm:
      isPrivateMerchant && typeOfSearch === 'personalTaxCode'
        ? mockedPdndVisuraInfomacere[5].legalForm
        : isPrivateMerchant && typeOfSearch === 'taxCode'
          ? mockedPdndVisuraInfomacere[0].legalForm
          : undefined,
  };
};

export const verifySubmit = async (
  productId: string = PRODUCT_IDS.IO,
  institutionType: string,
  fetchWithLogsSpy: jest.SpyInstance<any, any, any>,
  from?: Source,
  uo: boolean = false,
  errorOnSubmit: boolean = false,
  typeOfSearch: Search = 'businessName',
  isForeignInsurance?: boolean | undefined,
  haveTaxCode: boolean = true,
  isAggregator?: boolean
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isPrivateMerchant = institutionType === 'PRV' && productId === PRODUCT_IDS.IDPAY_MERCHANT;
  const SfeAvailable = (uo || institutionType === 'PA') && canInvoice(institutionType, productId);

  // eslint-disable-next-line functional/immutable-data
  const lastCall = fetchWithLogsSpy.mock.calls.pop();
  const expectedResponse = [
    { endpoint: 'ONBOARDING_POST_LEGALS' },
    {
      method: 'POST',
      data: {
        billingData: billingData2billingDataRequest(
          institutionType,
          SfeAvailable,
          from,
          errorOnSubmit,
          typeOfSearch,
          isForeignInsurance,
          haveTaxCode,
          productId
        ),
        atecoCodes:
          isPrivateMerchant && typeOfSearch === 'personalTaxCode'
            ? mockedPdndVisuraInfomacere[5].atecoCodes
            : isPrivateMerchant && typeOfSearch === 'taxCode'
              ? mockedPdndVisuraInfomacere[0].atecoCodes
              : undefined,
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
                    : from === 'SELC' ||
                        (from === 'NO_IPA' && institutionType === 'PSP') ||
                        institutionType === 'PSP' ||
                        institutionType === 'GPU' ||
                        institutionType === 'PT' ||
                        (institutionType === 'PRV' &&
                          productId !== PRODUCT_IDS.INTEROP &&
                          productId !== PRODUCT_IDS.IDPAY_MERCHANT) ||
                        (institutionType === 'GSP' && from === 'NO_IPA')
                      ? 'SELC'
                      : undefined,
        originId: errorOnSubmit
          ? mockPartyRegistry.items[1].originId
          : isPrivateMerchant
            ? typeOfSearch === 'personalTaxCode'
              ? mockedPdndVisuraInfomacere[5].businessTaxId
              : mockedPdndVisuraInfomacere[0].businessTaxId
            : from === 'NO_IPA'
              ? mockPartyRegistry.items[0].taxCode
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
                      : from === 'SELC'
                        ? mockPartyRegistry.items[0].taxCode
                        : typeOfSearch === 'taxCode'
                          ? mockedParties[0].originId
                          : typeOfSearch === 'aooCode'
                            ? mockedAoos[0].codiceUniAoo
                            : typeOfSearch === 'uoCode'
                              ? mockedUos[0].codiceUniUo
                              : (institutionType === 'PT' ||
                                    institutionType === 'GPU' ||
                                    institutionType === 'GSP') &&
                                  productId === PRODUCT_IDS.PAGOPA
                                ? '991'
                                : productId === PRODUCT_IDS.PAGOPA && institutionType === 'PRV'
                                  ? mockPartyRegistry.items[0].taxCode
                                  : institutionType === 'GPU' &&
                                      (productId === PRODUCT_IDS.INTEROP ||
                                        productId === PRODUCT_IDS.IO_SIGN ||
                                        productId === PRODUCT_IDS.IO)
                                    ? undefined
                                    : '991',
        istatCode: from !== 'IPA' ? mockedGeoTaxonomy[1].istat_code : undefined,
        taxCode: errorOnSubmit
          ? mockPartyRegistry.items[1].taxCode
          : isPrivateMerchant && typeOfSearch === 'personalTaxCode'
            ? mockedPdndVisuraInfomacere[5].businessTaxId
            : isPrivateMerchant && typeOfSearch === 'taxCode'
              ? mockedPdndVisuraInfomacere[0].businessTaxId
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
                        : typeOfSearch === 'personalTaxCode'
                          ? mockedPdndVisuraInfomacere[5].businessTaxId
                          : typeOfSearch === 'aooCode'
                            ? mockedAoos[0].codiceFiscaleEnte
                            : typeOfSearch === 'uoCode'
                              ? mockedUos[0].codiceFiscaleEnte
                              : mockPartyRegistry.items[0].taxCode,
        additionalInformations:
          productId === PRODUCT_IDS.PAGOPA && institutionType === 'GSP'
            ? {
                agentOfPublicService: false,
                agentOfPublicServiceNote: '',
                belongRegulatedMarket: false,
                establishedByRegulatoryProvision: false,
                establishedByRegulatoryProvisionNote: '',
                ipa: from === 'IPA' ? true : false,
                ipaCode: from === 'IPA' ? '991' : '',
                otherNote: 'optionalPartyInformations-note',
                regulatedMarketNote: '',
              }
            : undefined,
        payment:
          institutionType === 'PRV' && productId === PRODUCT_IDS.IDPAY_MERCHANT
            ? {
                holder: 'holder',
                iban: 'IT60X0542811101000000123456',
              }
            : undefined,
        gpuData:
          institutionType === 'GPU' && productId === PRODUCT_IDS.PAGOPA
            ? {
                businessRegisterNumber: 'Comunale 12',
                legalRegisterNumber: '250301',
                legalRegisterName: 'SkiPass',
                longTermPayments: true,
                manager: true,
                managerAuthorized: true,
                managerEligible: true,
                managerProsecution: true,
                institutionCourtMeasures: true,
              }
            : undefined,
        soleTrader: isPrivateMerchant && typeOfSearch === 'personalTaxCode' ? true : undefined,
        companyInformations:
          ((from === 'ANAC' ||
            from === 'INFOCAMERE' ||
            from === 'PDND_INFOCAMERE' ||
            ((institutionType === 'GSP' || institutionType === 'GPU') && from !== 'IPA')) &&
            institutionType !== 'PT') ||
          (institutionType === 'PRV' && productId === PRODUCT_IDS.PAGOPA) ||
          isPrivateMerchant
            ? {
                businessRegisterPlace:
                  from === 'ANAC' ||
                  (institutionType === 'PRV' &&
                    (productId === PRODUCT_IDS.PAGOPA ||
                      productId === PRODUCT_IDS.INTEROP ||
                      productId === PRODUCT_IDS.IDPAY_MERCHANT))
                    ? '01234567891'
                    : undefined,
                shareCapital:
                  from === 'ANAC' ||
                  (institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP)
                    ? 332323
                    : undefined,
                rea:
                  from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE'
                    ? isPrivateMerchant && typeOfSearch === 'personalTaxCode'
                      ? mockedPdndVisuraInfomacere[5].nRea
                      : isPrivateMerchant && typeOfSearch === 'taxCode'
                        ? mockedPdndVisuraInfomacere[0].nRea
                        : mockedPartiesFromInfoCamere[0].cciaa.concat(
                            '-',
                            mockedPartiesFromInfoCamere[0].nRea
                          )
                    : institutionType === 'PRV' && productId === PRODUCT_IDS.PAGOPA
                      ? undefined
                      : 'MO-123456',
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
            name: 'LUCA',
            role: 'DELEGATE',
            surname: 'ROSSI',
            taxCode: 'RSSLCU80A01F205N',
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
          : (institutionType === 'SCP' ||
                (institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP)) &&
              (from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE')
            ? {
                city: mockedPartiesFromInfoCamere[0].city,
                county: mockedPartiesFromInfoCamere[0].county,
                country:
                  (institutionType === 'SCP' && productId === PRODUCT_IDS.INTEROP) ||
                  institutionType === 'PRV'
                    ? 'IT'
                    : undefined,
              }
            : {
                city: 'Milano',
                county: 'MI',
                country: 'IT',
              },
        assistanceContacts:
          productId === PRODUCT_IDS.IO_SIGN &&
          typeOfSearch !== 'aooCode' &&
          institutionType !== 'PT' &&
          institutionType !== 'GPU' &&
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
    },
    expect.any(Function),
  ];

  expect(lastCall).toEqual(expectedResponse);
};

const billingData2billingDataRequestIoPremium = () => ({
  businessName: 'Comune di Milano',
  registeredOffice: 'Milano, Piazza Colonna 370',
  digitalAddress: 'comune.milano@pec.it',
  zipCode: '20021',
  taxCode: '33445673222',
  taxCodeInvoicing: '87654321098',
  vatNumber: undefined,
  recipientCode: 'A1B2C3',
});

const billingData2billingDataRequestPspDashboard = () => ({
  businessName: 'Banca Popolare di Milano',
  registeredOffice: 'Piazza Meda 4',
  digitalAddress: 'info@bpm.it',
  zipCode: '20121',
  taxCode: '98765432101',
  vatNumber: '98765432101',
  taxCodeInvoicing: undefined,
  recipientCode: 'Z9X8Y1',
  legalForm: undefined,
});
export const verifySubmitPostLegalsIoPremium = async (
  fetchWithLogsSpy: jest.SpyInstance<any, any, any>
) => {
  await waitFor(() => {
    const postLegalsCalls = fetchWithLogsSpy.mock.calls.filter(
      (call) => call[0]?.endpoint === 'ONBOARDING_POST_LEGALS'
    );

    expect(postLegalsCalls.length).toBeGreaterThan(0);

    const lastPostLegalsCall = postLegalsCalls[postLegalsCalls.length - 1];

    expect(lastPostLegalsCall).toEqual([
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
      },
      {
        method: 'POST',
        data: {
          users: [
            {
              name: 'NAME',
              surname: 'SURNAME',
              role: 'MANAGER',
              taxCode: 'SRNNMA80A01A794F',
              email: 'b@b.bb',
            },
          ],
          billingData: {
            ...billingData2billingDataRequestIoPremium(),
            legalForm: undefined,
          },
          pspData: undefined,
          institutionLocationData: {
            city: 'Milano',
            country: undefined,
            county: 'MI',
          },
          institutionType: 'PA',
          pricingPlan: 'C0',
          origin: 'IPA',
          originId: '1',
          geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
            ? [{ code: nationalValue, desc: 'ITALIA' }]
            : [],
          productId: PRODUCT_IDS.IO_PREMIUM,
          subunitCode: undefined,
          subunitType: undefined,
          taxCode: '33445673222',
          companyInformations: undefined,
        },
      },
      expect.any(Function),
    ]);
  });
};

export const verifySubmitPostLegalsPspDashBoard = async (
  fetchWithLogsSpy: jest.SpyInstance<any, any, any>
) => {
  const postLegalsCalls = fetchWithLogsSpy.mock.calls.filter(
    (call) => call[0]?.endpoint === 'ONBOARDING_POST_LEGALS'
  );

  expect(postLegalsCalls.length).toBeGreaterThan(0);

  const lastPostLegalsCall = postLegalsCalls[postLegalsCalls.length - 1];

  expect(lastPostLegalsCall).toEqual([
    {
      endpoint: 'ONBOARDING_POST_LEGALS',
    },
    {
      method: 'POST',
      data: {
        users: [
          {
            name: 'NAME',
            surname: 'SURNAME',
            role: 'MANAGER',
            taxCode: 'SRNNMA80A01A794F',
            email: 'b@b.bb',
          },
        ],
        billingData: billingData2billingDataRequestPspDashboard(),
        pspData: {
          businessRegisterNumber: '56789123456',
          legalRegisterName: 'BP Milano',
          legalRegisterNumber: '34',
          abiCode: '98765',
          vatNumberGroup: true,
          dpoData: {
            address: 'Via Manzoni 12',
            pec: 'pec@bpm.it',
            email: 'dpo@bpm.it',
          },
        },
        institutionType: 'PSP',
        origin: 'SELC',
        originId: '98765432101',
        companyInformations: {
          businessRegisterPlace: undefined,
          rea: undefined,
          shareCapital: undefined,
        },
        geographicTaxonomies: [],
        institutionLocationData: {
          city: 'Milano',
          country: {},
          county: 'MI',
        },
        productId: PRODUCT_IDS.DASHBOARD_PSP,
        taxCode: mockedPspOnboardingData[1].institution.billingData.taxCode,
        pricingPlan: undefined,
        subunitCode: undefined,
        subunitType: undefined,
      },
    },
    expect.any(Function),
  ]);
};

export const performLogout = async (logoutButton: HTMLElement) => {
  fireEvent.click(logoutButton);
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).not.toBeNull());
};

export const executeGoHome = async (mockedLocation: any) => {
  console.log('Go Home');
  const goHomeButton = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  expect(goHomeButton).toBeEnabled();
  fireEvent.click(goHomeButton);
  await waitFor(() => expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING));
};

export const fillInstitutionTypeCheckbox = (element: string) => {
  const label = screen.getByText(
    i18n.t(`stepInstitutionType.institutionTypes.${element.toLowerCase()}.title`)
  );
  const parentLabel = label.closest('label');
  const radioButtonCheckedIcon = parentLabel?.querySelector(
    '[data-testid="RadioButtonCheckedIcon"]'
  );
  if (radioButtonCheckedIcon) {
    fireEvent.click(radioButtonCheckedIcon);
    const radioButton = parentLabel?.querySelector('input');
    expect(radioButton).toBeChecked();
  }
};

export const fillUserBillingDataForm = async (
  productId: string,
  businessNameInput: string,
  registeredOfficeInput: string,
  mailPECInput: string,
  zipCode: string,
  taxCodeInput: string,
  vatNumber: string,
  recipientCode: string,
  holder?: string,
  iban?: string,
  confirmIban?: string,
  supportEmail?: string,
  rea?: string,
  city?: string,
  county?: string,
  country?: string,
  from: Source = 'IPA',
  institutionType?: string,
  isAoo?: boolean,
  isForeignInsurance: boolean = false,
  haveTaxCode: boolean = true,
  typeOfSearch?: Search
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isPrivateMerchant = institutionType === 'PRV' && productId === PRODUCT_IDS.IDPAY_MERCHANT;

  if (from !== 'IPA' && from !== 'INFOCAMERE' && from !== 'PDND_INFOCAMERE' && !isPrivateMerchant) {
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

    const autocomplete = document.getElementById(
      (isForeignInsurance ? country : city) as string
    ) as HTMLElement;
    await userEvent.type(autocomplete, input);

    const option = await screen.findByText(expectedOption, {}, { timeout: 8000 });
    expect(option).toBeInTheDocument();
    fireEvent.click(option);

    if (!isForeignInsurance) {
      fireEvent.change(document.getElementById(zipCode) as HTMLElement, {
        target: { value: '09010' },
      });
      expect(document.getElementById(county ?? '') as HTMLElement).toHaveValue('MI');
    } else {
      fireEvent.change(document.getElementById('city') as HTMLElement, {
        target: { value: 'Valencia' },
      });
    }

    if (institutionType !== 'PT' && institutionType !== 'AS' && institutionType !== 'PSP') {
      fireEvent.change(document.getElementById(rea ?? '') as HTMLInputElement, {
        target: { value: 'MO-123456' },
      });
    }
  } else {
    if (institutionType === 'PRV' && productId === PRODUCT_IDS.PAGOPA) {
      // Logica esistente per PAGOPA + PRV
      fireEvent.change(document.getElementById(businessNameInput) as HTMLElement, {
        target: { value: mockPartyRegistry.items[0].description },
      });
      fireEvent.change(document.getElementById(mailPECInput) as HTMLElement, {
        target: { value: mockPartyRegistry.items[0].digitalAddress },
      });

      fireEvent.change(document.getElementById(zipCode) as HTMLElement, {
        target: { value: mockPartyRegistry.items[0].zipCode },
      });

      const autocomplete = document.getElementById(
        (isForeignInsurance ? country : city) as string
      ) as HTMLElement;
      await userEvent.type(autocomplete, 'Mil');

      const option = await screen.findByText('Milano', {}, { timeout: 8000 });
      expect(option).toBeInTheDocument();
      fireEvent.click(option);

      expect(document.getElementById(county ?? '') as HTMLElement).toHaveValue('MI');

      fireEvent.change(document.getElementById('registeredOffice') as HTMLInputElement, {
        target: { value: mockPartyRegistry.items[0].address },
      });

      fireEvent.change(document.getElementById(taxCodeInput) as HTMLElement, {
        target: { value: mockPartyRegistry.items[0].taxCode },
      });

      fireEvent.change(document.getElementById(recipientCode) as HTMLElement, {
        target: { value: 'A1B2C3D' },
      });

      fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
        target: { value: '01234567891' },
      });
    } else if (isPrivateMerchant) {
      const personalIndex = typeOfSearch === 'personalTaxCode' ? 5 : 0;
      fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
        target: { value: 'Comune' },
      });
      fireEvent.change(document.getElementById(rea ?? '') as HTMLInputElement, {
        target: { value: mockedPdndVisuraInfomacere[personalIndex].nRea },
      });
      fireEvent.change(document.getElementById(businessNameInput) as HTMLElement, {
        target: { value: mockedPdndVisuraInfomacere[personalIndex].businessName },
      });
      fireEvent.change(document.getElementById(mailPECInput) as HTMLElement, {
        target: { value: mockedPdndVisuraInfomacere[personalIndex].digitalAddress },
      });
      fireEvent.change(document.getElementById(taxCodeInput) as HTMLElement, {
        target: { value: mockedPdndVisuraInfomacere[personalIndex].businessTaxId },
      });
      fireEvent.change(document.getElementById(registeredOfficeInput) as HTMLElement, {
        target: { value: mockedPartiesFromInfoCamere[0].address },
      });
      fireEvent.change(document.getElementById(zipCode) as HTMLElement, {
        target: { value: mockedPartiesFromInfoCamere[0].zipCode },
      });

      const autocomplete = document.getElementById(city as string) as HTMLElement;
      await userEvent.type(autocomplete, 'Mil');
      const option = await screen.findByText('Milano', {}, { timeout: 8000 });
      expect(option).toBeInTheDocument();
      fireEvent.click(option);

      expect(document.getElementById(county ?? '') as HTMLElement).toHaveValue('MI');

      fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
        target: { value: '01234567891' },
      });
      fireEvent.change(document.getElementById(rea ?? '') as HTMLInputElement, {
        target: { value: mockedPdndVisuraInfomacere[personalIndex].nRea },
      });
      fireEvent.change(document.getElementById(holder ?? '') as HTMLInputElement, {
        target: { value: 'holder' },
      });
      fireEvent.change(document.getElementById(iban ?? '') as HTMLInputElement, {
        target: { value: 'IT60X0542811101000000123456' },
      });
      fireEvent.change(document.getElementById(confirmIban ?? '') as HTMLInputElement, {
        target: { value: 'IT60X0542811101000000123456' },
      });
    } else if (
      (institutionType === 'SCP' || institutionType === 'PRV') &&
      (from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE')
    ) {
      fireEvent.change(document.getElementById(businessNameInput) as HTMLElement, {
        target: { value: mockedPartiesFromInfoCamere[0].businessName },
      });
      fireEvent.change(document.getElementById(mailPECInput) as HTMLElement, {
        target: { value: mockedPartiesFromInfoCamere[0].digitalAddress },
      });
      fireEvent.change(document.getElementById(taxCodeInput) as HTMLElement, {
        target: { value: mockedPartiesFromInfoCamere[0].businessTaxId },
      });
      fireEvent.change(document.getElementById(registeredOfficeInput) as HTMLElement, {
        target: { value: mockedPartiesFromInfoCamere[0].address },
      });
      fireEvent.change(document.getElementById(zipCode) as HTMLElement, {
        target: { value: mockedPartiesFromInfoCamere[0].zipCode },
      });

      const autocomplete = document.getElementById(city as string) as HTMLElement;
      await userEvent.type(autocomplete, 'Mod');
      const option = await screen.findByText('Modena', {}, { timeout: 8000 });
      expect(option).toBeInTheDocument();
      fireEvent.click(option);

      expect(document.getElementById(county ?? '') as HTMLElement).toHaveValue('MO');

      fireEvent.change(document.getElementById(rea ?? '') as HTMLInputElement, {
        target: {
          value: mockedPartiesFromInfoCamere[0].cciaa.concat(
            '-',
            mockedPartiesFromInfoCamere[0].nRea
          ),
        },
      });

      if (institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP) {
        fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
          target: { value: '01234567891' },
        });
      }
    }

    if (!isPrivateMerchant) {
      const isTaxCodeEquals2PIVA = document.getElementById(
        'taxCodeEquals2VatNumber'
      ) as HTMLElement;
      if (isTaxCodeEquals2PIVA) {
        fireEvent.click(isTaxCodeEquals2PIVA);
        expect((document.getElementById('vatNumber') as HTMLInputElement).value).toBe(
          (document.getElementById('taxCode') as HTMLInputElement).value
        );
      }
    }
  }

  if (isPrivateMerchant) {
    fireEvent.change(document.getElementById(vatNumber) as HTMLElement, {
      target: { value: mockedPdndVisuraInfomacere[0].vatNumber },
    });
  } else if (from !== 'IVASS' || !isForeignInsurance) {
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

  if (institutionType === 'PSP' && !isPrivateMerchant) {
    expect(dpoDataSection).toBeInTheDocument();
    expect(vatNumberGroup).toBeInTheDocument();
    fireEvent.click(vatNumberGroup);

    const dpoAddress = document.getElementById('address') as HTMLElement;
    const dpoPecAddress = document.getElementById('pec') as HTMLElement;
    const dpoEmailAddress = document.getElementById('email') as HTMLElement;

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
    !isPrivateMerchant &&
    ((institutionType === 'PA' && !isAoo) || institutionType === 'GSP' || institutionType === 'PSP')
  ) {
    fireEvent.change(document.getElementById(recipientCode) as HTMLElement, {
      target: { value: 'A1B2C3D' },
    });

    if (supportEmail && productId === PRODUCT_IDS.IO_SIGN) {
      fireEvent.change(document.getElementById(supportEmail) as HTMLInputElement, {
        target: { value: 'a@a.it' },
      });
    }
  }
};

export const checkCorrectBodyBillingData = (
  institutionType: string,
  productId: string,
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isPrivateMerchant = institutionType === 'PRV' && productId === PRODUCT_IDS.IDPAY_MERCHANT;

  expect((document.getElementById('businessName') as HTMLInputElement).value).toBe(
    institutionType === 'SA'
      ? mockedANACParties[0].description
      : institutionType === 'AS'
        ? haveTaxCode
          ? isForeignInsurance
            ? mockedInsuranceResource.items[0].description
            : mockedInsuranceResource.items[2].description
          : mockedInsuranceResource.items[4].description
        : institutionType === 'SCP' || (institutionType === 'PRV' && !isPrivateMerchant)
          ? mockedPartiesFromInfoCamere[0].businessName
          : isPrivateMerchant
            ? 'Rossi Costruzioni S.r.l.'
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
        : institutionType === 'SCP' || (institutionType === 'PRV' && !isPrivateMerchant)
          ? mockedPartiesFromInfoCamere[0].digitalAddress
          : isPrivateMerchant
            ? 'rossi.costruzioni@pec.it'
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
          : institutionType === 'SCP' || (institutionType === 'PRV' && !isPrivateMerchant)
            ? mockedPartiesFromInfoCamere[0].businessTaxId
            : isPrivateMerchant
              ? '12345678901'
              : expectedTaxCode
    );
  }

  if (isForeignInsurance) {
    expect((document.getElementById('city') as HTMLInputElement).value).toBe('Valencia');
    expect((document.getElementById('country-select') as HTMLInputElement).value).toBe('Spagna');
  } else {
    expect((document.getElementById('zipCode') as HTMLInputElement).value).toBe(
      institutionType === 'SCP' || (institutionType === 'PRV' && !isPrivateMerchant)
        ? mockedPartiesFromInfoCamere[0].zipCode
        : isPrivateMerchant
          ? '09010'
          : expectedZipCode
    );

    if (!isPrivateMerchant) {
      expect((document.getElementById('vatNumber') as HTMLInputElement).value).toBe(
        expectedVatNumber
      );
    }

    expect((document.getElementById('city-select') as HTMLInputElement).value).toBe(
      institutionType === 'SCP' || (institutionType === 'PRV' && !isPrivateMerchant)
        ? mockedPartiesFromInfoCamere[0].city
        : isPrivateMerchant
          ? 'Milano'
          : expectedCity
    );

    expect((document.getElementById('county') as HTMLInputElement).value).toBe(
      institutionType === 'SCP' || (institutionType === 'PRV' && !isPrivateMerchant)
        ? mockedPartiesFromInfoCamere[0].county
        : isPrivateMerchant
          ? 'MO'
          : expectedCounty
    );
  }

  if (
    !isPrivateMerchant &&
    (institutionType === 'PA' || institutionType === 'GSP' || institutionType === 'PSP')
  ) {
    expect((document.getElementById('recipientCode') as HTMLInputElement).value).toBe(
      expectedRecipientCode
    );
  }

  if (isPrivateMerchant) {
    expect((document.getElementById('businessRegisterPlace') as HTMLInputElement).value).toBe(
      '01234567891'
    );
  }

  if (
    institutionType === 'SA' ||
    (institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP)
  ) {
    fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
      target: { value: '01234567891' },
    });

    expect((document.getElementById('rea') as HTMLInputElement).value).toBe('MO-123456');

    if (
      institutionType === 'SA' ||
      (institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP)
    ) {
      fireEvent.change(document.getElementById('shareCapital') as HTMLElement, {
        target: { value: '€ 332.323' },
      });
    }
  }

  expect((document.getElementById('registeredOffice') as HTMLInputElement).value).toBe(
    institutionType === 'SCP' || institutionType === 'PRV'
      ? mockedPartiesFromInfoCamere[0].address
      : expectedRegisteredOfficeInput
  );
};

export const searchUserFormFromRemoveBtn = (removeButton: HTMLElement): any => {
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
