import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { expect, MockInstance } from 'vitest';
import { InstitutionType } from '../../../../types';
import { mockedCategories } from '../../../../lib/__mocks__/mockApiRequests';
import { HeaderContext, UserContext } from '../../../../lib/context';
import { createStore } from '../../../../redux/store';
import { canInvoice, PRODUCT_IDS } from '../../../../utils/constants';
import { ENV } from '../../../../utils/env';
import {
  isConsolidatedEconomicAccountCompany,
  isContractingAuthority,
  isGlobalServiceProvider,
  isIdpayMerchantProduct,
  isInsuranceCompany,
  isInteropProduct,
  isIoProduct,
  isPrivateInstitution,
  isPrivateMerchantInstitution,
  isPublicAdministration,
  isPublicServiceCompany,
} from '../../../../utils/institutionTypeUtils';
import {
  checkCorrectBodyBillingData,
  fillInstitutionTypeCheckbox,
  fillUserBillingDataForm,
  Search,
  Source,
} from '../../../../utils/test/test-utils';
import OnboardingProduct from '../../OnboardingProduct';

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

export const filterByCategory4Test = (institutionType?: string, productId?: string) => {
  switch (productId) {
    case PRODUCT_IDS.SEND:
      return mockedCategories.product['prod-pn']?.ipa.PA;

    case PRODUCT_IDS.IDPAY_MERCHANT:
      return mockedCategories.product['prod-idpay-merchant']?.merchantDetails;

    case PRODUCT_IDS.INTEROP:
      if (isConsolidatedEconomicAccountCompany(institutionType as InstitutionType)) {
        return mockedCategories.product['prod-interop']?.ipa.SCEC;
      } else if (isPublicAdministration(institutionType as InstitutionType)) {
        return mockedCategories.product['prod-interop']?.ipa.PA;
      } else if (isGlobalServiceProvider(institutionType as InstitutionType)) {
        return mockedCategories.product.default?.ipa.GSP;
      } else {
        return mockedCategories.product.default?.ipa.PA;
      }
    default:
      const defaultIpa = mockedCategories.product.default?.ipa;
      return isGlobalServiceProvider(institutionType as InstitutionType)
        ? defaultIpa?.GSP
        : defaultIpa?.PA;
  }
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
    if (productSelected === PRODUCT_IDS.IDPAY_MERCHANT) {
      await waitFor(() => screen.getByText('Cerca il tuo ente'), { timeout: 5000 });
    } else {
      fillInstitutionTypeCheckbox('pa');
    }
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

  const withoutIpaLink = document.getElementById('no_ipa') as HTMLElement;
  if (
    productId === PRODUCT_IDS.PAGOPA &&
    isGlobalServiceProvider(institutionType as InstitutionType)
  ) {
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

      expect(fetchWithLogsSpy).toHaveBeenCalledTimes(4);
      expect(fetchWithLogsSpy).toHaveBeenNthCalledWith(
        4,
        {
          endpoint: isContractingAuthority(institutionType as InstitutionType)
            ? 'ONBOARDING_GET_SA_PARTIES_NAME'
            : isInsuranceCompany(institutionType as InstitutionType)
              ? 'ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME'
              : 'ONBOARDING_GET_SEARCH_PARTIES',
        },
        {
          method: 'GET',
          params: {
            limit:
              isContractingAuthority(institutionType as InstitutionType) ||
              isInsuranceCompany(institutionType as InstitutionType)
                ? undefined
                : ENV.MAX_INSTITUTIONS_FETCH,
            categories:
              isContractingAuthority(institutionType as InstitutionType) ||
              isInsuranceCompany(institutionType as InstitutionType)
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
          screen.getByText(
            'L’ente indicato non può aderire perché il suo codice ATECO non rientra tra quelli ammessi.'
          )
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
          ? isContractingAuthority(institutionType as InstitutionType)
            ? 'ONBOARDING_GET_SA_PARTY_FROM_FC'
            : (isPrivateInstitution(institutionType as InstitutionType) &&
                  !isIdpayMerchantProduct(productId)) ||
                (isInteropProduct(productId) &&
                  isPublicServiceCompany(institutionType as InstitutionType))
              ? 'ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE'
              : isIdpayMerchantProduct(productId)
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
          ? isContractingAuthority(institutionType as InstitutionType)
            ? { taxId: taxCode }
            : { id: taxCode }
          : typeOfSearch === 'personalTaxCode'
            ? isContractingAuthority(institutionType as InstitutionType)
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
            ? isContractingAuthority(institutionType as InstitutionType) ||
              isInsuranceCompany(institutionType as InstitutionType)
              ? undefined
              : {
                  productId: undefined,
                  subunitCode: undefined,
                  taxCode: undefined,
                  categories:
                    isPublicServiceCompany(institutionType as InstitutionType) ||
                    isPrivateInstitution(institutionType as InstitutionType)
                      ? undefined
                      : filterByCategory4Test(institutionType, productId),
                }
            : {
                origin: 'IPA',
                categories: filterByCategory4Test(institutionType, productId),
              };

      expect(fetchWithLogsSpy).toHaveBeenNthCalledWith(
        4,
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
      break;
  }

  const confirmButton = screen.getByRole('button', { name: 'Continua' });
  expect(confirmButton).toBeEnabled();

  await waitFor(() => fireEvent.click(confirmButton));

  if (isAggregator) {
    await waitFor(() => screen.getByText(/Stai richiedendo l'adesione come ente aggregatore per /));
    const continueButtonModal = screen.getAllByText('Continua')[1];
    fireEvent.click(continueButtonModal);
  }
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