import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { InstitutionType } from '../../../../../types';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { verifyTaxCodeInvoicing } from '../../../../services/billingDataServices';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import InvoiceData from '../InvoiceData';

vi.mock('../../../../services/billingDataServices', () => ({
  verifyTaxCodeInvoicing: vi.fn(),
}));

const formik: any = {
  values: {
    recipientCode: '',
    originId: 'IVASS1',
  },
  initialValues: {
    recipientCode: '',
  },
  errors: {},
  setFieldValue: vi.fn(),
  handleChange: vi.fn(),
};

let lastTypedValue = '';
formik.handleChange = vi.fn((e: any) => {
  lastTypedValue = e.target.value;
});

const mockBaseTextFieldProps = (
  field: keyof OnboardingFormData,
  label: string,
  fontWeight: number = 400,
  fontSize: number | string = 16
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
};

const renderComponent = ({
  institutionType = 'PA',
  productId = PRODUCT_IDS.SEND,
  subProductId,
  controllers = {},
  onboardingFormData,
  taxCodeInvoicingVisible = false,
  disableTaxCodeInvoicing = false,
}: {
  institutionType?: InstitutionType;
  productId?: string;
  subProductId?: string;
  controllers?: Record<string, unknown>;
  onboardingFormData?: any;
  taxCodeInvoicingVisible?: boolean;
  disableTaxCodeInvoicing?: boolean;
} = {}) => {
  const setInvalidTaxCodeInvoicing = vi.fn();
  renderComponentWithProviders(
    <InvoiceData
      controllers={{ ...defaultControllers, ...controllers } as any}
      subProductId={subProductId}
      institutionType={institutionType}
      onboardingFormData={onboardingFormData}
      taxCodeInvoicingVisible={taxCodeInvoicingVisible}
      disableTaxCodeInvoicing={disableTaxCodeInvoicing}
      formik={formik}
      baseTextFieldProps={mockBaseTextFieldProps}
      setInvalidTaxCodeInvoicing={setInvalidTaxCodeInvoicing}
    />,
    productId
  );
  return { setInvalidTaxCodeInvoicing };
};

beforeEach(() => {
  vi.clearAllMocks();
  formik.values = { recipientCode: '', originId: 'IVASS1' };
  formik.initialValues = { recipientCode: '' };
  formik.errors = {};
});

test('Test: invoiceable PA renders the SDI code with the PA description', () => {
  renderComponent();

  expect(screen.getByText('Codice univoco o SDI')).toBeInTheDocument();
  expect(
    screen.getByText(
      'È il codice univoco necessario per ricevere le fatture elettroniche. Può essere del tuo ente o della sua Unità Organizzativa di riferimento.'
    )
  ).toBeInTheDocument();
});

test('Test: invoiceable AOO/UO renders the SDI code with the PA description', () => {
  renderComponent({ institutionType: 'GSP', controllers: { isAooUo: true } });

  expect(screen.getByText('Codice univoco o SDI')).toBeInTheDocument();
});

test('Test: invoiceable non PA renders the SDI code with the recipient code description', () => {
  renderComponent({ institutionType: 'GSP' });

  expect(screen.getByText('Codice SDI')).toBeInTheDocument();
  expect(screen.queryByText('Codice univoco o SDI')).not.toBeInTheDocument();
  expect(
    screen.getByText('È il codice necessario per ricevere le fatture elettroniche')
  ).toBeInTheDocument();
});

test('Test: not invoiceable party does not render the SDI code nor the tax code SFE', () => {
  renderComponent({
    controllers: { isInvoiceable: false },
    taxCodeInvoicingVisible: true,
  });

  expect(document.getElementById('recipientCode')).not.toBeInTheDocument();
  expect(screen.queryByText('Codice Fiscale SFE')).not.toBeInTheDocument();
});

test('Test: prod-io does not render the SDI code', () => {
  renderComponent({ productId: PRODUCT_IDS.IO });

  expect(document.getElementById('recipientCode')).not.toBeInTheDocument();
});

test('Test: prod-io with prod-io-premium sub product renders the SDI code', () => {
  renderComponent({ productId: PRODUCT_IDS.IO, subProductId: PRODUCT_IDS.IO_PREMIUM });

  expect(document.getElementById('recipientCode')).toBeInTheDocument();
});

test('Test: SDI code input is cleaned to uppercase alphanumeric chars', () => {
  renderComponent();
  const recipientCode = document.getElementById('recipientCode') as HTMLInputElement;

  fireEvent.input(recipientCode, { target: { value: 'ab-c1!2' } });

  expect(lastTypedValue).toBe('ABC12');
});

test('Test: SDI code is enabled for non premium products', () => {
  renderComponent();

  expect(document.getElementById('recipientCode')).toBeEnabled();
});

test('Test: SDI code is disabled for premium products with a valid recipient code already set', () => {
  formik.values.recipientCode = 'ABC123';
  formik.initialValues.recipientCode = 'ABC123';
  renderComponent({ controllers: { isPremium: true } });

  expect(document.getElementById('recipientCode')).toBeDisabled();
});

test('Test: SDI code is enabled for premium products if the recipient code has an error', () => {
  formik.values.recipientCode = 'ABC123';
  formik.initialValues.recipientCode = 'ABC123';
  formik.errors = { recipientCode: 'Il codice inserito non è associato al tuo ente' };
  renderComponent({ controllers: { isPremium: true } });

  expect(document.getElementById('recipientCode')).toBeEnabled();
  expect(screen.getByText('Il codice inserito non è associato al tuo ente')).toBeInTheDocument();
});

test('Test: SDI code does not show the "Required" error', () => {
  formik.errors = { recipientCode: 'Required' };
  renderComponent();

  expect(screen.queryByText('Required')).not.toBeInTheDocument();
});

test('Test: tax code SFE is rendered for PA when taxCodeInvoicingVisible is true', () => {
  renderComponent({ taxCodeInvoicingVisible: true });

  expect(screen.getByText('Codice Fiscale SFE')).toBeInTheDocument();
  expect(document.getElementById('taxCodeInvoicing')).toBeEnabled();
});

test('Test: tax code SFE is rendered for UO when taxCodeInvoicingVisible is true', () => {
  renderComponent({
    institutionType: 'GSP',
    onboardingFormData: { uoUniqueCode: 'UO1234' },
    taxCodeInvoicingVisible: true,
  });

  expect(screen.getByText('Codice Fiscale SFE')).toBeInTheDocument();
});

test('Test: tax code SFE is not rendered when taxCodeInvoicingVisible is false', () => {
  renderComponent();

  expect(screen.queryByText('Codice Fiscale SFE')).not.toBeInTheDocument();
});

test('Test: tax code SFE is not rendered for non PA and non UO parties', () => {
  renderComponent({ institutionType: 'GSP', taxCodeInvoicingVisible: true });

  expect(screen.queryByText('Codice Fiscale SFE')).not.toBeInTheDocument();
});

test('Test: tax code SFE is disabled when disableTaxCodeInvoicing is true', () => {
  renderComponent({ taxCodeInvoicingVisible: true, disableTaxCodeInvoicing: true });

  expect(document.getElementById('taxCodeInvoicing')).toBeDisabled();
});

test('Test: tax code SFE with 11 chars triggers the verification', () => {
  const { setInvalidTaxCodeInvoicing } = renderComponent({ taxCodeInvoicingVisible: true });

  fireEvent.change(document.getElementById('taxCodeInvoicing') as HTMLInputElement, {
    target: { value: '12345678901' },
  });

  expect(formik.setFieldValue).toHaveBeenCalledWith('taxCodeInvoicing', '12345678901');
  expect(verifyTaxCodeInvoicing).toHaveBeenCalledWith(
    '12345678901',
    formik,
    setInvalidTaxCodeInvoicing
  );
  expect(setInvalidTaxCodeInvoicing).not.toHaveBeenCalled();
});

test('Test: tax code SFE with less than 11 chars resets the invalid flag without verification', () => {
  const { setInvalidTaxCodeInvoicing } = renderComponent({ taxCodeInvoicingVisible: true });

  fireEvent.change(document.getElementById('taxCodeInvoicing') as HTMLInputElement, {
    target: { value: '1234' },
  });

  expect(formik.setFieldValue).toHaveBeenCalledWith('taxCodeInvoicing', '1234');
  expect(verifyTaxCodeInvoicing).not.toHaveBeenCalled();
  expect(setInvalidTaxCodeInvoicing).toHaveBeenCalledWith(false);
});

test('Test: insurance company renders the disabled IVASS code', () => {
  renderComponent({ institutionType: 'AS' });

  expect(screen.getByText('Codice IVASS')).toBeInTheDocument();
  expect(document.getElementById('originId')).toBeDisabled();
});

test('Test: non insurance company does not render the IVASS code', () => {
  renderComponent();

  expect(screen.queryByText('Codice IVASS')).not.toBeInTheDocument();
});
