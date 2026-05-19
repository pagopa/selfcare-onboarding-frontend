import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import i18n from 'i18next';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { MockInstance } from 'vitest';
import { InstitutionType } from '../../../types';
import {
  mockedAoos,
  mockedGeoTaxonomy,
  mockedPdndVisuraInfomacere,
  mockedPspOnboardingData,
  mockedUos,
} from '../../lib/__mocks__/mockApiRequests';
import { HeaderContext, UserContext } from '../../lib/context';
import { nationalValue } from '../../model/GeographicTaxonomies';
import { store } from '../../redux/store';
import { canInvoice, PRODUCT_IDS } from '../constants';
import { ENV } from '../env';
import {
  isCedProduct,
  isContractingAuthority,
  isGlobalServiceProvider,
  isGpuInstitution,
  isIdpayMerchantProduct,
  isInteropProduct,
  isIoProduct,
  isIoSignProduct,
  isPagoPaProduct,
  isPaymentServiceProvider,
  isPrivateInstitution,
  isPrivateMerchantInstitution,
  isPrivateOrPersonInstitution,
  isPublicAdministration,
  isPublicServiceCompany,
  isTechPartner,
} from '../institutionTypeUtils';
import {
  type BillingResolverParams,
  resolveBusinessName,
  resolveDigitalAddress,
  resolveLegalForm,
  resolveRecipientCode,
  resolveRegisteredOffice,
  resolveTaxCode,
  resolveTaxCodeInvoicing,
  resolveVatNumber,
  resolveZipCode,
} from './billingDataResolvers-test';
import type { Search, Source } from './helpersFunction-test';
import {
  type BillingFieldIds,
  type BillingFormContext,
  clickTaxCodeEqualsVatNumberIfApplicable,
  fillCedPrivateScenario,
  fillInfocamereScenario,
  fillNoIpaScenario,
  fillPagoPaPrivateScenario,
  fillPrivateMerchantScenario,
  fillPspSpecificSection,
  fillRecipientCodeSection,
  fillVatNumberField,
  verifyPspFieldsAbsent,
} from './helpersFunction-test';
import {
  type BillingBodyCheckParams,
  expectedBillingBusinessName,
  expectedBillingCity,
  expectedBillingCounty,
  expectedBillingDigitalAddress,
  expectedBillingRegisteredOffice,
  expectedBillingTaxCode,
  expectedBillingZipCode,
  resolveCompanyInformations,
  resolveInstitutionLocationData,
  resolveOrigin,
  resolveOriginId,
  resolveVerifyTaxCode,
} from './verifySubmitHelpers-test';
export type { Search, Source };

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
  onlyAdmin: boolean,
  productId?: string
) => {
  await fillUserForm(
    prefix,
    'FRRMRA80A01F205X',
    'b@c.BB',
    addUserFlow,
    onlyAdmin,
    undefined,
    undefined,
    productId
  );
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
  expectedDuplicateEmailMessages: number | undefined,
  productId?: string,
  addUserFlow?: boolean
) => {
  const shouldSkipDuplicateCheck = isIdpayMerchantProduct(productId) || addUserFlow;

  if (existentTaxCode) {
    await fillTextFieldAndCheckButton(prefix, 'name', 'NAME');
    await fillTextFieldAndCheckButton(prefix, 'surname', 'SURNAME');
    await fillTextFieldAndCheckButton(prefix, 'taxCode', existentTaxCode);

    if (!shouldSkipDuplicateCheck) {
      const duplicateTaxCodeErrors = screen.queryAllByText(
        'Il codice fiscale inserito è già presente'
      );
      expect(duplicateTaxCodeErrors.length).toBe(expectedDuplicateTaxCodeMessages);
    } else {
      const duplicateTaxCodeErrors = screen.queryAllByText(
        'Il codice fiscale inserito è già presente'
      );
      expect(duplicateTaxCodeErrors.length).toBe(0);
    }
  }
  await fillTextFieldAndCheckButton(prefix, 'taxCode', '');

  if (existentEmail) {
    await fillTextFieldAndCheckButton(prefix, 'email', existentEmail);

    if (!shouldSkipDuplicateCheck) {
      const duplicateEmailErrors = screen.queryAllByText(
        "L'indirizzo email inserito è già presente"
      );
      expect(duplicateEmailErrors.length).toBe(expectedDuplicateEmailMessages);
    } else {
      // Per IDPAY_MERCHANT, verifica che NON ci siano errori di duplicato
      const duplicateEmailErrors = screen.queryAllByText(
        "L'indirizzo email inserito è già presente"
      );
      expect(duplicateEmailErrors.length).toBe(0);
    }
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
  surname?: string,
  productId?: string
) => {
  if (prefix === 'delegate-initial' && !addUserFlow && !onlyAdmin) {
    await checkAlreadyExistentValues(
      'delegate-initial',
      'SRNNMA80A01A794F',
      1,
      'b@b.BB',
      1,
      productId,
      addUserFlow
    );
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
  await fillTextFieldAndCheckButton(prefix, 'email', 'user@pec.it');
  expect(document.getElementById(`${prefix}-email-helper-text`)).toBeInTheDocument();
  await fillTextFieldAndCheckButton(prefix, 'email', '');
  await fillTextFieldAndCheckButton(prefix, 'email', email);
};

export const executeStepAddManager = async (
  addUserFlow: boolean,
  isPremium?: boolean,
  expectedSuccessfulSubmit?: boolean,
  fetchWithLogsSpy?: MockInstance,
  productId?: string
) => {
  console.log('Testing step add manager..');

  await waitFor(() => screen.getByText('Indica il Legale Rappresentante'));

  screen.getByText('Più informazioni sui ruoli');

  const continueButton = screen.getByLabelText('Continua');
  expect(continueButton).toBeDisabled();

  if (isCedProduct(productId)) {
    await checkLoggedUserAsAdminCheckbox(continueButton, null, 'manager', true);

    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);
  } else {
    await checkCertifiedUserValidation('manager-initial', addUserFlow, false, productId);

    await fillUserForm(
      'manager-initial',
      'SRNNMA80A01A794F',
      'b@b.BB',
      addUserFlow,
      false,
      undefined,
      undefined,
      productId
    );

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
  }
};

const clickAdminCheckBoxAndTestValues = (
  confirmButton: HTMLElement,
  addDelegateButton: HTMLElement | null,
  prefix: string,
  expectedName: string = '',
  expectedSurname: string = '',
  expectedTaxCode: string = ''
) => {
  fireEvent.click(document.querySelector("input[type='checkbox']") as HTMLElement);
  expect((document.getElementById(`${prefix}-initial-name`) as HTMLInputElement).value).toBe(
    expectedName
  );
  expect((document.getElementById(`${prefix}-initial-surname`) as HTMLInputElement).value).toBe(
    expectedSurname
  );
  expect((document.getElementById(`${prefix}-initial-taxCode`) as HTMLInputElement).value).toBe(
    expectedTaxCode
  );
  expect((document.getElementById(`${prefix}-initial-email`) as HTMLInputElement).value).toBe('');
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
  addDelegateButton: HTMLElement | null,
  prefix: string,
  keepChecked: boolean = false
) => {
  clickAdminCheckBoxAndTestValues(
    confirmButton,
    addDelegateButton,
    prefix,
    'loggedName',
    'loggedSurname',
    'LGGLGD80A01B354S'
  );

  await fillTextFieldAndCheckButton(`${prefix}-initial`, 'email', 'a@a.aa');
  if (addDelegateButton) {
    expect(addDelegateButton).toBeEnabled();
  }

  if (!keepChecked) {
    clickAdminCheckBoxAndTestValues(confirmButton, addDelegateButton, prefix);
  }
};

export const executeStepAddAdmin = async (
  expectedSuccessfulSubmit: boolean,
  isTechPartner: boolean = false,
  isAggregator: boolean = false,
  addUserFlow: boolean,
  onlyAdmin: boolean,
  isAddApplicantEmail: boolean,
  productId?: string
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

  // Keep checkbox checked when isAddApplicantEmail=false (logged user must be in users to skip ApplicantEmail step)
  const shouldKeepChecked = !isAddApplicantEmail;
  await checkLoggedUserAsAdminCheckbox(
    continueButton,
    addDelegateButton,
    'delegate',
    shouldKeepChecked
  );

  // Fill other delegate data when NOT keeping checkbox checked
  if (!shouldKeepChecked) {
    await checkCertifiedUserValidation('delegate-initial', addUserFlow, onlyAdmin, productId);

    await fillUserForm(
      'delegate-initial',
      'RSSLCU80A01F205N',
      'a@a.AA',
      addUserFlow,
      onlyAdmin,
      'LUCA',
      'ROSSI',
      productId
    );
  }

  expect(continueButton).toBeEnabled();
  if (!addUserFlow) {
    expect(addDelegateButton).toBeEnabled();
  }

  fireEvent.click(continueButton);

  if (!isAddApplicantEmail) {
    if (!isTechPartner && !isAggregator) {
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
  }
};

export const executeStepAddApplicantEmailForm = async () => {
  await waitFor(() => screen.getByText('Indica la tua email'));

  const name = screen.getByTestId('name-applicant-test') as HTMLInputElement;
  const surname = screen.getByTestId('surname-applicant-test') as HTMLInputElement;
  const email = screen.getByTestId('email-applicant-test') as HTMLInputElement;

  await waitFor(() => {
    expect(name.value).toBe('loggedName');
    expect(surname.value).toBe('loggedSurname');
  });

  fireEvent.change(email, { target: { value: 'INVALIDEMAIL' } });

  expect(document.getElementById('email-applicant-helper-text')).toBeInTheDocument();
  fireEvent.change(email, { target: { value: 'user@pec.it' } });

  expect(document.getElementById('email-applicant-helper-text')).toBeInTheDocument();
  fireEvent.change(email, { target: { value: 'a@a.aa' } });

  const continueButton = screen.getByLabelText('Continua');
  fireEvent.click(continueButton);

  await waitFor(() => screen.getByText('Confermi la richiesta di invio?'));
  const confirmButton = screen.getByRole('button', { name: 'Conferma' });
  await waitFor(() => fireEvent.click(confirmButton));

  await waitFor(() => fireEvent.click(confirmButton));
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
) => {
  const isPrivateMerchant =
    isPrivateOrPersonInstitution(institutionType as InstitutionType) &&
    isIdpayMerchantProduct(productId);

  const p: BillingResolverParams = {
    errorOnSubmit,
    isPrivateMerchant,
    typeOfSearch,
    from,
    haveTaxCode: haveTaxCode ?? true,
    isForeignInsurance: isForeignInsurance ?? false,
    institutionType,
    productId,
    SfeAvailable,
  };

  return {
    businessName: resolveBusinessName(p),
    registeredOffice: resolveRegisteredOffice(p),
    digitalAddress: resolveDigitalAddress(p),
    zipCode: resolveZipCode(p),
    taxCode: resolveTaxCode(p),
    vatNumber: resolveVatNumber(p),
    taxCodeInvoicing: resolveTaxCodeInvoicing(p),
    recipientCode: resolveRecipientCode(p),
    legalForm: resolveLegalForm(p),
  };
};

// eslint-disable-next-line complexity
export const verifySubmit = async (
  productId: string = PRODUCT_IDS.IO,
  institutionType: string,
  fetchWithLogsSpy: MockInstance,
  from?: Source,
  uo: boolean = false,
  errorOnSubmit: boolean = false,
  typeOfSearch: Search = 'businessName',
  isForeignInsurance?: boolean | undefined,
  haveTaxCode: boolean = true,
  isAggregator?: boolean,
  isAddApplicantEmail?: boolean
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isPrivateMerchant = isPrivateMerchantInstitution(
    institutionType as InstitutionType,
    productId
  );
  const SfeAvailable =
    (uo || isPublicAdministration(institutionType as InstitutionType)) &&
    canInvoice(institutionType, productId) &&
    !isIoProduct(productId);

  const resolvedFrom = from ?? 'IPA';
  const p: BillingResolverParams = {
    errorOnSubmit,
    isPrivateMerchant,
    typeOfSearch,
    from: resolvedFrom,
    haveTaxCode,
    isForeignInsurance: isForeignInsurance ?? false,
    institutionType,
    productId,
  };

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
        origin: resolveOrigin(from, institutionType, productId),
        originId: resolveOriginId(
          resolvedFrom,
          institutionType,
          productId,
          typeOfSearch,
          isPrivateMerchant,
          errorOnSubmit,
          haveTaxCode,
          isForeignInsurance ?? false
        ),
        istatCode: from !== 'IPA' ? mockedGeoTaxonomy[1].istat_code : undefined,
        taxCode: resolveVerifyTaxCode(p),
        additionalInformations:
          isPagoPaProduct(productId) &&
          isGlobalServiceProvider(institutionType as InstitutionType) &&
          from !== 'IPA'
            ? {
                agentOfPublicService: false,
                agentOfPublicServiceNote: '',
                belongRegulatedMarket: false,
                establishedByRegulatoryProvision: false,
                establishedByRegulatoryProvisionNote: '',
                ipa: false,
                ipaCode: '',
                otherNote: 'optionalPartyInformations-note',
                regulatedMarketNote: '',
              }
            : undefined,
        payment: isPrivateMerchant
          ? { holder: 'holder', iban: 'IT60X0542811101000000123456' }
          : undefined,
        gpuData:
          isGpuInstitution(institutionType as InstitutionType) && isPagoPaProduct(productId)
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
        companyInformations: resolveCompanyInformations({
          from: resolvedFrom,
          institutionType,
          productId,
          isPrivateMerchant,
          typeOfSearch,
        }),
        pspData: isPaymentServiceProvider(institutionType as InstitutionType)
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
          isCedProduct(productId)
            ? {
                email: 'a@a.aa',
                name: 'loggedName',
                role: 'MANAGER',
                surname: 'loggedSurname',
                taxCode: 'LGGLGD80A01B354S',
                uid: '0',
              }
            : {
                email: 'b@b.bb',
                name: 'NAME',
                role: 'MANAGER',
                surname: 'SURNAME',
                taxCode: 'SRNNMA80A01A794F',
              },
          // Use logged user data when checkbox stays checked (isAddApplicantEmail=false)
          !isAddApplicantEmail
            ? {
                email: 'a@a.aa',
                name: 'loggedName',
                role: 'DELEGATE',
                surname: 'loggedSurname',
                taxCode: 'LGGLGD80A01B354S',
                uid: '0',
              }
            : {
                email: 'a@a.aa',
                name: 'LUCA',
                role: 'DELEGATE',
                surname: 'ROSSI',
                taxCode: 'RSSLCU80A01F205N',
              },
        ].filter((u) =>
          isTechPartner(institutionType as InstitutionType) ? u.role !== 'MANAGER' : u
        ),
        pricingPlan: 'FA',
        geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
          ? [{ code: nationalValue, desc: 'ITALIA' }]
          : [],
        institutionLocationData: resolveInstitutionLocationData({
          from: resolvedFrom,
          institutionType,
          productId,
          isForeignInsurance,
        }),
        assistanceContacts:
          isIoSignProduct(productId) &&
          typeOfSearch !== 'aooCode' &&
          !isTechPartner(institutionType as InstitutionType) &&
          !isGpuInstitution(institutionType as InstitutionType) &&
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
        userRequester: isAddApplicantEmail
          ? { name: 'loggedName', surname: 'loggedSurname', email: 'a@a.aa' }
          : undefined,
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
  taxCodeInvoicing: undefined,
  vatNumber: undefined,
  recipientCode: undefined,
});

const billingData2billingDataRequestPspDashboard = () => ({
  businessName: 'Banca Popolare di Milano',
  registeredOffice: 'Piazza Meda 4',
  digitalAddress: 'info@bpm.it',
  zipCode: '20121',
  taxCode: '98765432101',
  vatNumber: undefined,
  taxCodeInvoicing: undefined,
  recipientCode: 'Z9X8Y1',
  legalForm: undefined,
});
export const verifySubmitPostLegalsIoPremium = async (fetchWithLogsSpy: MockInstance) => {
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
            country: 'IT',
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

export const verifySubmitPostLegalsPspDashBoard = async (fetchWithLogsSpy: MockInstance) => {
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
          country: 'IT',
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

export const fillInstitutionTypeCheckbox = (element: string, productId?: string) => {
  const lowerElement = element.toLowerCase();
  const labelKey =
    productId === PRODUCT_IDS.CED && lowerElement === 'prv' ? 'prv_ced' : lowerElement;
  const label = screen.getByText(
    i18n.t(`stepInstitutionType.institutionTypes.${labelKey}.title`)
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
) => {
  const isPrivateMerchant = isPrivateMerchantInstitution(
    institutionType as InstitutionType,
    productId
  );

  const ids: BillingFieldIds = {
    businessName: businessNameInput,
    registeredOffice: registeredOfficeInput,
    mailPEC: mailPECInput,
    zipCode,
    taxCode: taxCodeInput,
    vatNumber,
    recipientCode,
    holder,
    iban,
    confirmIban,
    supportEmail,
    rea,
    city,
    county,
    country,
  };

  const ctx: BillingFormContext = {
    productId,
    from,
    institutionType,
    isAoo,
    isForeignInsurance,
    haveTaxCode,
    typeOfSearch,
  };

  const isFromInfocamere = from === 'INFOCAMERE' || from === 'PDND_INFOCAMERE';
  const isFromIpaOrInfocamere = from === 'IPA' || isFromInfocamere;

  // --- Fill fields based on source/product scenario ---
  if (!isFromIpaOrInfocamere && !isPrivateMerchant) {
    await fillNoIpaScenario(ids, ctx);
  } else if (
    isPrivateInstitution(institutionType as InstitutionType) &&
    isPagoPaProduct(productId)
  ) {
    await fillPagoPaPrivateScenario(ids, ctx);
  } else if (isPrivateMerchant) {
    await fillPrivateMerchantScenario(ids, ctx);
  } else if (isCedProduct(productId) && isPrivateInstitution(institutionType as InstitutionType)) {
    await fillCedPrivateScenario(ids, ctx);
  } else if (
    (isPublicServiceCompany(institutionType as InstitutionType) ||
      isPrivateInstitution(institutionType as InstitutionType)) &&
    isFromInfocamere
  ) {
    await fillInfocamereScenario(ids, ctx);
  }

  // --- Fill/verify shared fields ---
  clickTaxCodeEqualsVatNumberIfApplicable(isPrivateMerchant, isFromIpaOrInfocamere, productId);
  fillVatNumberField(vatNumber, isPrivateMerchant, from, isForeignInsurance);

  if (isPaymentServiceProvider(institutionType as InstitutionType) && !isPrivateMerchant) {
    await fillPspSpecificSection();
  } else {
    verifyPspFieldsAbsent();
  }

  fillRecipientCodeSection(
    recipientCode,
    supportEmail,
    productId,
    isPrivateMerchant,
    institutionType,
    isAoo
  );
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
) => {
  const isPrivateMerchant = isPrivateMerchantInstitution(
    institutionType as InstitutionType,
    productId
  );
  const p: BillingBodyCheckParams = {
    institutionType,
    isPrivateMerchant,
    haveTaxCode,
    isForeignInsurance,
  };

  expect((document.getElementById('businessName') as HTMLInputElement).value).toBe(
    expectedBillingBusinessName(p, expectedBusinessName)
  );
  expect((document.getElementById('digitalAddress') as HTMLInputElement).value).toBe(
    expectedBillingDigitalAddress(p, expectedMailPEC)
  );

  if (haveTaxCode) {
    expect((document.getElementById('taxCode') as HTMLInputElement).value).toBe(
      expectedBillingTaxCode(p, expectedTaxCode)
    );
  }

  if (isForeignInsurance) {
    expect((document.getElementById('city') as HTMLInputElement).value).toBe('Valencia');
    expect((document.getElementById('country-select') as HTMLInputElement).value).toBe('Spagna');
  } else {
    expect((document.getElementById('zipCode') as HTMLInputElement).value).toBe(
      expectedBillingZipCode(p, expectedZipCode)
    );
    if (!isPrivateMerchant) {
      expect((document.getElementById('vatNumber') as HTMLInputElement).value).toBe(
        expectedVatNumber
      );
    }
    expect((document.getElementById('city-select') as HTMLInputElement).value).toBe(
      expectedBillingCity(p, expectedCity)
    );
    expect((document.getElementById('county') as HTMLInputElement).value).toBe(
      expectedBillingCounty(p, expectedCounty)
    );
  }

  if (
    !isPrivateMerchant &&
    (isPublicAdministration(institutionType as InstitutionType) ||
      isGlobalServiceProvider(institutionType as InstitutionType) ||
      isPaymentServiceProvider(institutionType as InstitutionType))
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
    isContractingAuthority(institutionType as InstitutionType) ||
    (isPrivateInstitution(institutionType as InstitutionType) && isInteropProduct(productId))
  ) {
    fireEvent.change(document.getElementById('businessRegisterPlace') as HTMLElement, {
      target: { value: '01234567891' },
    });
    expect((document.getElementById('rea') as HTMLInputElement).value).toBe('MO-123456');
    fireEvent.change(document.getElementById('shareCapital') as HTMLElement, {
      target: { value: '€ 332.323' },
    });
  }

  expect((document.getElementById('registeredOffice') as HTMLInputElement).value).toBe(
    expectedBillingRegisteredOffice(p, expectedRegisteredOfficeInput)
  );
};

export const searchUserFormFromRemoveBtn = (removeButton: HTMLElement): any => {
  if (!removeButton) {
    return null;
  } else {
    const parent = removeButton.parentElement as HTMLElement;
    if (parent.getAttribute('role') === 'group') {
      return parent;
    } else {
      return searchUserFormFromRemoveBtn(parent);
    }
  }
};
