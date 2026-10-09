import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { InstitutionType } from '../../../../../types';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { getCountriesFromGeotaxonomies } from '../../../../services/geoTaxonomyServices';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import PartyGeneralData from '../PartyGeneralData';

vi.mock('../../../../services/geoTaxonomyServices', () => ({
  getCountriesFromGeotaxonomies: vi.fn(),
  getLocationFromIstatCode: vi.fn(),
  getNationalCountries: vi.fn(),
}));

const formik: any = {
  values: {
    businessName: '',
    zipCode: '12345',
    taxCode: '',
    city: '',
  },
  errors: {},
  setFieldValue: vi.fn(),
  handleChange: vi.fn(),
};

const mockBaseTextFieldProps = (
  field: keyof OnboardingFormData,
  label: string,
  fontWeight: number = 400,
  fontSize: number = 16
) => ({
  id: field,
  type: 'text',
  value: formik.values[field] || '',
  label,
  error: false,
  required: true,
  variant: 'outlined',
  onChange: formik.handleChange,
  sx: { width: '100%' },
  InputProps: {
    style: { fontSize, fontWeight },
  },
});

const defaultControllers = {
  isPremium: false,
  isDisabled: false,
  isInvoiceable: true,
  isForeignInsurance: false,
  isFromIPA: false,
  isAooUo: false,
  isCityEditable: true,
};

const renderComponent = ({
  institutionType = 'PA',
  productId = PRODUCT_IDS.SEND,
  controllers = {},
  onboardingFormData,
  isInfoCompany = false,
}: {
  institutionType?: InstitutionType;
  productId?: string;
  controllers?: Record<string, unknown>;
  onboardingFormData?: any;
  isInfoCompany?: boolean;
  origin?: string;
} = {}) => {
  const setInstitutionLocationData = vi.fn();
  renderComponentWithProviders(
    <PartyGeneralData
      controllers={{ ...defaultControllers, ...controllers } as any}
      origin={formik.values.origin}
      onboardingFormData={onboardingFormData}
      baseTextFieldProps={mockBaseTextFieldProps}
      institutionType={institutionType}
      isInfoCompany={isInfoCompany}
      formik={formik}
      setInstitutionLocationData={setInstitutionLocationData}
      setRequiredLogin={vi.fn()}
    />,
    productId
  );
  return { setInstitutionLocationData };
};

beforeEach(() => {
  vi.clearAllMocks();
  formik.values = { businessName: '', zipCode: '12345', taxCode: '', city: '' };
});

test('Test: default party renders business name, address, zip code, city, county, pec and tax code', () => {
  renderComponent();

  expect(screen.getByText('Ragione sociale')).toBeInTheDocument();
  expect(screen.getByText('Indirizzo e numero civico della sede legale')).toBeInTheDocument();
  expect(screen.getByText('CAP')).toBeInTheDocument();
  expect(document.getElementById('city-select')).toBeInTheDocument();
  expect(screen.getByText('Provincia')).toBeInTheDocument();
  expect(screen.queryByText('Nazione')).not.toBeInTheDocument();
  expect(screen.getByText('Indirizzo PEC')).toBeInTheDocument();
  expect(screen.getByText('Codice Fiscale')).toBeInTheDocument();

  expect(screen.queryByText('Ente centrale')).not.toBeInTheDocument();
  expect(screen.queryByText('Denominazione AOO')).not.toBeInTheDocument();
  expect(screen.queryByText('Denominazione UO')).not.toBeInTheDocument();
});

test('Test: AOO renders the central party, AOO fields and central tax code instead of business name', () => {
  renderComponent({
    controllers: { isAooUo: true, isDisabled: true },
    onboardingFormData: { aooUniqueCode: 'A1B2C3', businessName: 'Ente centrale srl' },
  });

  expect(screen.getByText('Ente centrale')).toBeInTheDocument();
  expect(screen.getByText('Ente centrale srl')).toBeInTheDocument();
  expect(screen.getByText('Denominazione AOO')).toBeInTheDocument();
  expect(screen.getByText('Codice Univoco AOO')).toBeInTheDocument();
  expect(screen.queryByText('Denominazione UO')).not.toBeInTheDocument();
  expect(screen.queryByText('Ragione sociale')).not.toBeInTheDocument();
  expect(screen.queryByText('Codice Fiscale')).not.toBeInTheDocument();
  expect(screen.getByText('Codice Fiscale ente centrale')).toBeInTheDocument();
});

test('Test: UO renders the central party, UO fields and central tax code instead of business name', () => {
  renderComponent({
    controllers: { isAooUo: true, isDisabled: true },
    onboardingFormData: { uoUniqueCode: 'UO1234', businessName: 'Ente centrale srl' },
  });

  expect(screen.getByText('Ente centrale')).toBeInTheDocument();
  expect(screen.getByText('Denominazione UO')).toBeInTheDocument();
  expect(screen.getByText('Codice Univoco UO')).toBeInTheDocument();
  expect(screen.queryByText('Denominazione AOO')).not.toBeInTheDocument();
  expect(screen.queryByText('Ragione sociale')).not.toBeInTheDocument();
  expect(screen.queryByText('Codice Fiscale')).not.toBeInTheDocument();
  expect(screen.getByText('Codice Fiscale ente centrale')).toBeInTheDocument();
});

test('Test: foreign insurance company renders free text city and country, without zip code and county', () => {
  renderComponent({
    institutionType: 'AS',
    controllers: { isForeignInsurance: true },
    onboardingFormData: { taxCode: '12345678901' },
  });

  expect(document.getElementById('city')).toBeInTheDocument();
  expect(document.getElementById('city-select')).not.toBeInTheDocument();
  expect(document.getElementById('country-select')).toBeInTheDocument();
  expect(screen.queryByText('CAP')).not.toBeInTheDocument();
  expect(screen.queryByText('Provincia')).not.toBeInTheDocument();
});

test('Test: insurance company without tax code does not render the tax code field', () => {
  renderComponent({ institutionType: 'AS', onboardingFormData: { taxCode: '' } });

  expect(screen.queryByText('Codice Fiscale')).not.toBeInTheDocument();
});

test('Test: fields are disabled when controllers.isDisabled is true, county is always disabled', () => {
  renderComponent({ controllers: { isDisabled: true } });

  expect(document.getElementById('businessName')).toBeDisabled();
  expect(document.getElementById('digitalAddress')).toBeDisabled();
  expect(document.getElementById('taxCode')).toBeDisabled();
  expect(document.getElementById('zipCode')).toBeDisabled();
  expect(document.getElementById('county')).toBeDisabled();
});

test('Test: fields are enabled when controllers.isDisabled is false, county stays disabled', () => {
  renderComponent();

  expect(document.getElementById('businessName')).toBeEnabled();
  expect(document.getElementById('digitalAddress')).toBeEnabled();
  expect(document.getElementById('taxCode')).toBeEnabled();
  expect(document.getElementById('zipCode')).toBeEnabled();
  expect(document.getElementById('county')).toBeDisabled();
});

test('Test: PRV + prod-idpay-merchant locks business name, pec and tax code', () => {
  renderComponent({ institutionType: 'PRV', productId: PRODUCT_IDS.IDPAY_MERCHANT });

  expect(document.getElementById('businessName')).toBeDisabled();
  expect(document.getElementById('digitalAddress')).toBeDisabled();
  expect(document.getElementById('taxCode')).toBeDisabled();
});

test('Test: SA locks business name, pec and tax code', () => {
  renderComponent({ institutionType: 'SA' });

  expect(document.getElementById('businessName')).toBeDisabled();
  expect(document.getElementById('digitalAddress')).toBeDisabled();
  expect(document.getElementById('taxCode')).toBeDisabled();
});

test('Test: tax code accepts only digits and at most 11 characters', () => {
  renderComponent();
  const taxCode = document.getElementById('taxCode') as HTMLInputElement;

  fireEvent.change(taxCode, { target: { value: 'AB12-34' } });
  expect(formik.setFieldValue).toHaveBeenCalledWith('taxCode', '1234');

  formik.setFieldValue.mockClear();
  fireEvent.change(taxCode, { target: { value: '123456789012' } });
  expect(formik.setFieldValue).not.toHaveBeenCalled();
});

test('Test: typing at least 3 chars in city searches the geotaxonomies', () => {
  renderComponent();
  const city = document.getElementById('city-select') as HTMLInputElement;

  fireEvent.input(city, { target: { value: 'Rom' } });

  expect(formik.setFieldValue).toHaveBeenCalledWith('city', 'Rom');
  expect(getCountriesFromGeotaxonomies).toHaveBeenCalledWith('Rom', expect.any(Function), expect.any(Function));
});

test('Test: typing less than 3 chars in city does not search the geotaxonomies', () => {
  renderComponent();
  const city = document.getElementById('city-select') as HTMLInputElement;

  fireEvent.input(city, { target: { value: 'Ro' } });

  expect(formik.setFieldValue).toHaveBeenCalledWith('city', 'Ro');
  expect(getCountriesFromGeotaxonomies).not.toHaveBeenCalled();
});

test('Test: city autocomplete is disabled when party comes from IPA, AOO/UO or premium', () => {
  renderComponent({ controllers: { isFromIPA: true } });

  expect(document.getElementById('city-select')).toBeDisabled();
});

test('Test: registered office is disabled when controllers.isDisabled is true', () => {
  renderComponent({ controllers: { isDisabled: true } });

  expect(document.getElementById('registeredOffice')).toBeDisabled();
});

test('Test: registered office is enabled when controllers.isDisabled is false', () => {
  renderComponent();

  expect(document.getElementById('registeredOffice')).toBeEnabled();
});

test('Test: registered office stays enabled for AOO/UO and for insurance companies', () => {
  renderComponent({ controllers: { isDisabled: true, isAooUo: true } });
  expect(document.getElementById('registeredOffice')).toBeEnabled();
});

test('Test: registered office stays enabled for insurance companies even when disabled', () => {
  renderComponent({ institutionType: 'AS', controllers: { isDisabled: true } });
  expect(document.getElementById('registeredOffice')).toBeEnabled();
});

test('Test: a city without country triggers the country lookup on mount', () => {
  formik.values = { ...formik.values, city: 'Roma', country: undefined };
  renderComponent();

  expect(getCountriesFromGeotaxonomies).toHaveBeenCalledWith(
    'Roma',
    expect.any(Function),
    expect.any(Function)
  );
});

test('Test: no country lookup when the country is already set', () => {
  formik.values = { ...formik.values, city: 'Roma', country: 'IT' };
  renderComponent();

  expect(getCountriesFromGeotaxonomies).not.toHaveBeenCalled();
});

test('Test: no country lookup when the city is empty', () => {
  renderComponent();

  expect(getCountriesFromGeotaxonomies).not.toHaveBeenCalled();
});

test('Test: found countries fill istatCode and country when missing', async () => {
  vi.mocked(getCountriesFromGeotaxonomies).mockImplementation(async (_city, setCountries) => {
    (setCountries as any)([{ istat_code: '058091', country: 'IT' }]);
  });
  formik.values = { ...formik.values, city: 'Roma', country: undefined, istatCode: undefined };
  renderComponent();

  await waitFor(() => {
    expect(formik.setFieldValue).toHaveBeenCalledWith('istatCode', '058091');
    expect(formik.setFieldValue).toHaveBeenCalledWith('country', 'IT');
  });
});




