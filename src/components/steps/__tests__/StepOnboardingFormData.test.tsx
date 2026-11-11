import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, test, vi } from 'vitest';
import { HeaderContext, UserContext } from '../../../lib/context';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { store } from '../../../redux/store';
import { PRODUCT_IDS } from '../../../utils/constants';
import StepOnboardingFormData, { StepBillingDataHistoryState } from '../StepOnboardingFormData';

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
  historyState?: StepBillingDataHistoryState
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
              productId={PRODUCT_IDS.PAGOPA}
              institutionType="PA"
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
