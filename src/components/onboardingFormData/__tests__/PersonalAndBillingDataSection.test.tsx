import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { InstitutionType } from '../../../../types';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { getLocationFromIstatCode } from '../../../services/geoTaxonomyServices';
import { getUoInfoFromRecipientCode } from '../../../services/institutionServices';
import { PRODUCT_IDS } from '../../../utils/constants';
import { renderComponentWithProviders } from '../../../utils/test/test-utils';
import PersonalAndBillingDataSection from '../PersonalAndBillingDataSection';

vi.mock('../../../services/geoTaxonomyServices', () => ({
  getCountriesFromGeotaxonomies: vi.fn(),
  getLocationFromIstatCode: vi.fn(),
  getNationalCountries: vi.fn(),
}));

vi.mock('../../../services/institutionServices', () => ({
  getUoInfoFromRecipientCode: vi.fn(),
}));

vi.mock('../../../services/billingDataServices', () => ({
  verifyTaxCodeInvoicing: vi.fn(),
}));

const buildFormik = (values: Record<string, unknown> = {}): any => ({
  values: {
    businessName: '',
    zipCode: '12345',
    taxCode: '',
    vatNumber: '',
    recipientCode: '',
    hasVatnumber: true,
    ...values,
  },
  initialValues: { recipientCode: '' },
  errors: {},
  setFieldValue: vi.fn(),
  handleChange: vi.fn(),
});

const mockBaseTextFieldProps = (
  field: keyof OnboardingFormData,
  label: string,
  fontWeight: number = 400,
  fontSize: number | string = 16
) => ({
  id: field,
  type: 'text',
  label,
  error: false,
  required: true,
  variant: 'outlined',
  sx: { width: '100%' },
  InputProps: { style: { fontSize, fontWeight } },
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
  formik = buildFormik(),
  institutionType = 'PA',
  productId = PRODUCT_IDS.SEND,
  controllers = {},
  onboardingFormData,
  retrievedIstat,
  recipientCodeStatus,
  isTaxCodeEquals2PIVA = false,
  institutionAvoidGeotax = false,
}: {
  formik?: any;
  institutionType?: InstitutionType;
  productId?: string;
  controllers?: Record<string, unknown>;
  onboardingFormData?: any;
  retrievedIstat?: string;
  recipientCodeStatus?: string;
  isTaxCodeEquals2PIVA?: boolean;
  institutionAvoidGeotax?: boolean;
} = {}) => {
  renderComponentWithProviders(
    <PersonalAndBillingDataSection
      institutionType={institutionType}
      baseTextFieldProps={mockBaseTextFieldProps}
      stepHistoryState={{ externalInstitutionId: '', isTaxCodeEquals2PIVA }}
      setStepHistoryState={vi.fn()}
      formik={formik}
      onboardingFormData={onboardingFormData}
      institutionAvoidGeotax={institutionAvoidGeotax}
      retrievedIstat={retrievedIstat}
      controllers={{ ...defaultControllers, ...controllers } as any}
      setInvalidTaxCodeInvoicing={vi.fn()}
      recipientCodeStatus={recipientCodeStatus}
    />,
    productId
  );
  return formik;
};

beforeEach(() => {
  vi.clearAllMocks();
});

test('Test: renders all the sections of a PA party', () => {
  renderComponent();

  // PartyGeneralData
  expect(screen.getByText('Ragione sociale')).toBeInTheDocument();
  expect(screen.getByText('Indirizzo PEC')).toBeInTheDocument();
  // VatNumberData
  expect(document.getElementById('party_without_vatnumber')).toBeInTheDocument();
  expect(screen.getByText('Partita IVA')).toBeInTheDocument();
  // InvoiceData
  expect(screen.getByText('Codice univoco o SDI')).toBeInTheDocument();
  // CommercialRegisterData and SupportEmailData are not shown for PA + SEND
  expect(screen.queryByText(/Luogo di iscrizione al Registro delle Imprese/)).not.toBeInTheDocument();
  expect(screen.queryByText('Indirizzo email visibile ai cittadini')).not.toBeInTheDocument();
});

test('Test: renders the commercial register section and the support email for SA + prod-io-sign', () => {
  renderComponent({ institutionType: 'SA', productId: PRODUCT_IDS.IO_SIGN });

  expect(
    screen.getByText('Luogo di iscrizione al Registro delle Imprese (obbligatorio)')
  ).toBeInTheDocument();
  expect(screen.getByText('REA')).toBeInTheDocument();
  expect(screen.getByText('Capitale sociale')).toBeInTheDocument();
  expect(screen.getByText('Indirizzo email visibile ai cittadini')).toBeInTheDocument();
});

test('Test: GSP + prod-io-sign information company renders the optional commercial register section', () => {
  renderComponent({ institutionType: 'GSP', productId: PRODUCT_IDS.IO_SIGN });

  expect(
    screen.getByText('Luogo di iscrizione al Registro delle Imprese (facoltativo)')
  ).toBeInTheDocument();
  expect(screen.getByText('REA')).toBeInTheDocument();
  expect(screen.getByText('Capitale sociale (facoltativo)')).toBeInTheDocument();
});

test('Test: institutionAvoidGeotax hides the support email', () => {
  renderComponent({ productId: PRODUCT_IDS.IO_SIGN, institutionAvoidGeotax: true });

  expect(screen.queryByText('Indirizzo email visibile ai cittadini')).not.toBeInTheDocument();
});

test('Test: renders the PSP sections', () => {
  renderComponent({ institutionType: 'PSP', productId: PRODUCT_IDS.PAGOPA });

  expect(screen.getByText('n. Iscrizione al Registro delle Imprese')).toBeInTheDocument();
  expect(screen.getByText('Codice ABI')).toBeInTheDocument();
  expect(screen.getByText('La Partita IVA è di gruppo')).toBeInTheDocument();
});

test('Test: renders the central party for AOO and clears the recipient code', () => {
  const formik = renderComponent({
    controllers: { isAooUo: true },
    onboardingFormData: { aooUniqueCode: 'A1B2C3', businessName: 'Ente centrale srl' },
  });

  expect(screen.getByText('Ente centrale')).toBeInTheDocument();
  expect(screen.getByText('Denominazione AOO')).toBeInTheDocument();
  expect(formik.setFieldValue).toHaveBeenCalledWith('recipientCode', undefined);
});

test('Test: a NaN share capital is reset', () => {
  const formik = renderComponent({ formik: buildFormik({ shareCapital: NaN }) });

  expect(formik.setFieldValue).toHaveBeenCalledWith('shareCapital', undefined);
});

test('Test: tax code equals vat number copies the tax code into the vat number', () => {
  const formik = renderComponent({
    formik: buildFormik({ taxCode: '12345678901' }),
    isTaxCodeEquals2PIVA: true,
  });

  expect(formik.setFieldValue).toHaveBeenCalledWith('vatNumber', '12345678901');
});

test('Test: tax code not equal to vat number clears the vat number', () => {
  const formik = renderComponent({ formik: buildFormik({ taxCode: '12345678901' }) });

  expect(formik.setFieldValue).toHaveBeenCalledWith('vatNumber', '');
});

test('Test: foreign insurance resets the address fields', () => {
  const formik = renderComponent({
    institutionType: 'AS',
    controllers: { isForeignInsurance: true },
    onboardingFormData: { taxCode: '12345678901' },
  });

  expect(formik.setFieldValue).toHaveBeenCalledWith('isForeignInsurance', true);
  ['zipCode', 'city', 'county', 'country'].forEach((field) =>
    expect(formik.setFieldValue).toHaveBeenCalledWith(field, undefined)
  );
});

test('Test: non foreign insurance sets hasVatnumber', () => {
  const formik = renderComponent();

  expect(formik.setFieldValue).toHaveBeenCalledWith('isForeignInsurance', false);
  expect(formik.setFieldValue).toHaveBeenCalledWith('hasVatnumber', true);
});

test('Test: party from IPA retrieves the location from the onboarding istat code', () => {
  renderComponent({
    controllers: { isFromIPA: true },
    onboardingFormData: { istatCode: '058091' },
    retrievedIstat: '999999',
  });

  expect(getLocationFromIstatCode).toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Function),
    '058091'
  );
});

test('Test: AOO/UO falls back to the retrieved istat code', () => {
  renderComponent({ controllers: { isAooUo: true }, retrievedIstat: '999999' });

  expect(getLocationFromIstatCode).toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Function),
    '999999'
  );
});

test('Test: party neither from IPA nor AOO/UO does not retrieve the location', () => {
  renderComponent();

  expect(getLocationFromIstatCode).not.toHaveBeenCalled();
});

test('Test: premium does not retrieve the location', () => {
  renderComponent({ controllers: { isPremium: true, isFromIPA: true } });

  expect(getLocationFromIstatCode).not.toHaveBeenCalled();
});

test('Test: accepted recipient code with at least 6 chars retrieves the UO info and shows the tax code SFE', () => {
  renderComponent({
    formik: buildFormik({ recipientCode: 'ABC123' }),
    recipientCodeStatus: 'ACCEPTED',
  });

  expect(getUoInfoFromRecipientCode).toHaveBeenCalledWith(
    'ABC123',
    expect.any(Function),
    expect.anything()
  );
  expect(screen.getByText('Codice Fiscale SFE')).toBeInTheDocument();
});

test('Test: recipient code not accepted resets the tax code SFE', () => {
  const formik = renderComponent({
    formik: buildFormik({ recipientCode: 'ABC123' }),
    recipientCodeStatus: 'DENIED_NO_BILLING',
  });

  expect(getUoInfoFromRecipientCode).not.toHaveBeenCalled();
  expect(formik.setFieldValue).toHaveBeenCalledWith('taxCodeInovoicing', undefined);
  expect(screen.queryByText('Codice Fiscale SFE')).not.toBeInTheDocument();
});

test('Test: premium copies the PSP data into the form', () => {
  const formik = renderComponent({
    formik: buildFormik({
      businessRegisterNumber: '123',
      legalRegisterName: 'N/A',
      legalRegisterNumber: '99',
      vatNumberGroup: true,
      abiCode: '12345',
    }),
    institutionType: 'PSP',
    productId: PRODUCT_IDS.PAGOPA,
    controllers: { isPremium: true },
  });

  expect(formik.setFieldValue).toHaveBeenCalledWith('commercialRegisterNumber', '123');
  expect(formik.setFieldValue).toHaveBeenCalledWith('registrationInRegister', '');
  expect(formik.setFieldValue).toHaveBeenCalledWith('registerNumber', '99');
  expect(formik.setFieldValue).toHaveBeenCalledWith('abiCode', '12345');
  expect(formik.setFieldValue).toHaveBeenCalledWith('vatNumberGroup', true);
});

test('Test: premium keeps the location already in the form', () => {
  const formik = renderComponent({
    formik: buildFormik({ country: 'IT', county: 'RM', city: 'Roma' }),
    controllers: { isPremium: true },
  });

  expect(formik.setFieldValue).toHaveBeenCalledWith('country', 'IT');
  expect(formik.setFieldValue).toHaveBeenCalledWith('county', 'RM');
  expect(formik.setFieldValue).toHaveBeenCalledWith('city', 'Roma');
});

test('Test: premium prod-io-sign keeps the support email', () => {
  const formik = renderComponent({
    formik: buildFormik({ supportEmail: 'help@test.it' }),
    productId: PRODUCT_IDS.IO_SIGN,
    controllers: { isPremium: true },
  });

  expect(formik.setFieldValue).toHaveBeenCalledWith('supportEmail', 'help@test.it');
});
