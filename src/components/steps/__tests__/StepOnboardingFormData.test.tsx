import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, test, vi } from 'vitest';
import { HeaderContext, UserContext } from '../../../lib/context';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { store } from '../../../redux/store';
import { PRODUCT_IDS } from '../../../utils/constants';
import StepOnboardingFormData, { StepBillingDataHistoryState } from '../StepOnboardingFormData';
import { InstitutionType, PartyData } from '../../../../types';
import { mockedPspInstitutionsSearch } from '../../../lib/__mocks__/mockApiRequests';
import { selected2OnboardingData } from '../../../utils/selected2OnboardingData';

vi.mock('../../../services/geoTaxonomyServices', () => ({
  getPreviousGeotaxononomies: vi.fn(),
  getCountriesFromGeotaxonomies: vi.fn(),
  getLocationFromIstatCode: vi.fn(),
  getNationalCountries: vi.fn(),
}));

vi.mock('../../../services/institutionServices', () => ({
  getUoInfoFromRecipientCode: vi.fn(),
  handleSearchByTaxCode: vi.fn(),
}));

vi.mock('../../../services/billingDataServices', () => ({
  verifyRecipientCodeIsValid: vi.fn(),
  verifyTaxCodeInvoicing: vi.fn(),
}));

vi.mock('../../../services/validationServices', () => ({
  verifyVatNumber: vi.fn(),
}));

const externalInstitutionId = 'ext-1';
const taxCode = '12345678901';

const renderStep = (
  initialFormData: OnboardingFormData,
  historyState?: StepBillingDataHistoryState,
  { productId, institutionType }: { productId: string; institutionType: InstitutionType } = {
    productId: PRODUCT_IDS.PAGOPA,
    institutionType: 'PA',
  }
) =>
  render(
    <Provider store={store}>
      <HeaderContext.Provider
        value={{
          subHeaderVisible: false,
          setSubHeaderVisible: vi.fn(),
          onExit: undefined,
          setOnExit: vi.fn(),
          enableLogin: true,
          setEnableLogin: vi.fn(),
        }}
      >
        <UserContext.Provider
          value={{ user: null, setUser: vi.fn(), requiredLogin: false, setRequiredLogin: vi.fn() }}
        >
          <MemoryRouter
            initialEntries={[
              { pathname: '/onboarding/prod-pagopa', state: { onboardingFormData: historyState } },
            ]}
          >
            <StepOnboardingFormData
              productId={productId}
              institutionType={institutionType}
              subtitle=""
              externalInstitutionId={externalInstitutionId}
              initialFormData={initialFormData}
              onboardingFormData={initialFormData}
              forward={vi.fn()}
              back={vi.fn()}
            />
          </MemoryRouter>
        </UserContext.Provider>
      </HeaderContext.Provider>
    </Provider>
  );

const partyFromIpa: OnboardingFormData = {
  businessName: 'Comune di Test',
  registeredOffice: 'Via Roma 1',
  zipCode: '00100',
  digitalAddress: 'test@pec.it',
  taxCode,
  vatNumber: '',
  recipientCode: '',
  geographicTaxonomies: [],
  hasVatnumber: true,
};

const findVatNumber = () =>
  waitFor(() => {
    const input = document.getElementById('vatNumber');
    expect(input).toBeInTheDocument();
    return input as HTMLInputElement;
  });

beforeEach(() => {
  vi.clearAllMocks();
});

test('vatNumber stays editable when a stale taxCode=vatNumber flag is restored for a party without vatNumber', async () => {
  renderStep(partyFromIpa, { externalInstitutionId, isTaxCodeEquals2PIVA: true });

  const vatNumber = await findVatNumber();
  await waitFor(() => expect(vatNumber).toBeEnabled());
  expect(vatNumber).toHaveValue('');
});

test('vatNumber is locked to the taxCode when the flag matches the party data', async () => {
  renderStep(
    { ...partyFromIpa, vatNumber: taxCode },
    { externalInstitutionId, isTaxCodeEquals2PIVA: true }
  );

  const vatNumber = await findVatNumber();
  await waitFor(() => expect(vatNumber).toBeDisabled());
  expect(vatNumber).toHaveValue(taxCode);
});

const rtpPspFormData = (vatNumber: string) => {
  const [psp] = mockedPspInstitutionsSearch.institutions ?? [];
  const party = {
    ...psp,
    onboarding: psp.onboarding?.map((o) => ({ ...o, billing: { ...o.billing, vatNumber } })),
  } as unknown as PartyData;
  return selected2OnboardingData(party, false, 'PSP', PRODUCT_IDS.RTP);
};

const rtpPspFields: Array<[string, string]> = [
  ['businessName', 'Antico Credito Arcorese'],
  ['registeredOffice', 'Via Umberto I'],
  ['zipCode', '20862'],
  ['digitalAddress', 'antico.credito.arcorese@test.it'],
  ['taxCode', '25301208621'],
  ['recipientCode', 'A1B2V3'],
  ['commercialRegisterNumber', '12345678910'],
  ['registrationInRegister', 'Albo delle banche'],
  ['registerNumber', '24'],
  ['abiCode', '25301'],
  ['address', 'Via Umberto I, 20862 Arcore (MB)'],
  ['pec', 'dpo.anticocreditoarcorese@pec.it'],
  ['email', 'dpo@anticocreditoarcorese.it'],
];

test.each(['25301208621', '01234567890'])(
  'RTP PSP form is filled with the registered data and read-only (vat number %s)',
  async (vatNumber) => {
    renderStep(rtpPspFormData(vatNumber), undefined, {
      productId: PRODUCT_IDS.RTP,
      institutionType: 'PSP',
    });

    const vatNumberInput = await findVatNumber();
    await waitFor(() => expect(vatNumberInput).toHaveValue(vatNumber));
    expect(vatNumberInput).toBeDisabled();
    rtpPspFields.forEach(([id, value]) => {
      const input = document.getElementById(id);
      expect(input, id).toHaveValue(value);
      expect(input, id).toBeDisabled();
    });
    expect(document.getElementById('vatNumberGroup')).toBeDisabled();
    const geoRadios = document.querySelectorAll('input[name="geographicTaxonomy"]');
    expect(geoRadios).toHaveLength(2);
    geoRadios.forEach((radio) => expect(radio).toBeDisabled());
    expect(screen.getByDisplayValue('Arcore (MB)')).toBeDisabled();
  }
);
