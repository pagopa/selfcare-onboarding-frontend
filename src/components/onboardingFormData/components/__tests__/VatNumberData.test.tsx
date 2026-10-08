import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import { t } from 'i18next';
import { beforeEach, expect, test, vi } from 'vitest';
import { InstitutionType } from '../../../../../types';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import VatNumberData from '../VatNumberData';

const formik: any = {
  values: {
    hasVatnumber: true,
    taxCode: '12345678901',
    vatNumber: '',
    vatNumberGroup: false,
  },
  errors: {},
  setFieldValue: vi.fn(),
  handleChange: vi.fn(),
};

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
  controllers = {},
  onboardingFormData,
  isTaxCodeEquals2PIVA = false,
  pspData,
}: {
  institutionType?: InstitutionType;
  productId?: string;
  controllers?: Record<string, unknown>;
  onboardingFormData?: any;
  isTaxCodeEquals2PIVA?: boolean;
  pspData?: any;
} = {}) => {
  const setStepHistoryState = vi.fn();
  const stepHistoryState = { externalInstitutionId: '', isTaxCodeEquals2PIVA };
  renderComponentWithProviders(
    <VatNumberData
      controllers={{ ...defaultControllers, ...controllers } as any}
      formik={formik}
      onboardingFormData={onboardingFormData}
      institutionType={institutionType}
      stepHistoryState={stepHistoryState}
      setStepHistoryState={setStepHistoryState}
      baseTextFieldProps={mockBaseTextFieldProps}
      t={t as any}
      pspData={pspData}
    />,
    productId
  );
  return { setStepHistoryState, stepHistoryState };
};

beforeEach(() => {
  vi.clearAllMocks();
  formik.values = {
    hasVatnumber: true,
    taxCode: '12345678901',
    vatNumber: '',
    vatNumberGroup: false,
  };
});

test('Test: default party renders both checkboxes and the vat number field', () => {
  renderComponent();

  expect(document.getElementById('taxCodeEquals2VatNumber')).toBeInTheDocument();
  expect(document.getElementById('party_without_vatnumber')).toBeInTheDocument();
  expect(screen.getByText('La Partita IVA coincide con il Codice Fiscale')).toBeInTheDocument();
  expect(screen.getByText('Il mio ente non ha la partita IVA')).toBeInTheDocument();
  expect(screen.getByText('Partita IVA')).toBeInTheDocument();
  expect(document.getElementById('vatNumberGroup')).not.toBeInTheDocument();
});

test('Test: foreign insurance renders neither the checkboxes nor the vat number field', () => {
  renderComponent({ institutionType: 'AS', controllers: { isForeignInsurance: true } });

  expect(document.getElementById('taxCodeEquals2VatNumber')).not.toBeInTheDocument();
  expect(document.getElementById('party_without_vatnumber')).not.toBeInTheDocument();
  expect(screen.queryByText('Partita IVA')).not.toBeInTheDocument();
});

test('Test: party without vat number hides the tax code equals vat number checkbox and the vat number field', () => {
  formik.values.hasVatnumber = false;
  renderComponent();

  expect(document.getElementById('taxCodeEquals2VatNumber')).not.toBeInTheDocument();
  expect(document.getElementById('party_without_vatnumber')).toBeInTheDocument();
  expect(screen.queryByText('Partita IVA')).not.toBeInTheDocument();
});

test('Test: insurance company without tax code does not render the tax code equals vat number checkbox', () => {
  renderComponent({ institutionType: 'AS', onboardingFormData: { taxCode: '' } });

  expect(document.getElementById('taxCodeEquals2VatNumber')).not.toBeInTheDocument();
  expect(document.getElementById('party_without_vatnumber')).toBeInTheDocument();
});

test('Test: insurance company with tax code renders the tax code equals vat number checkbox', () => {
  renderComponent({ institutionType: 'AS', onboardingFormData: { taxCode: '12345678901' } });

  expect(document.getElementById('taxCodeEquals2VatNumber')).toBeInTheDocument();
});

test('Test: fideiussioni products do not render the party without vat number checkbox', () => {
  renderComponent({ productId: PRODUCT_IDS.FD });

  expect(document.getElementById('party_without_vatnumber')).not.toBeInTheDocument();
  expect(document.getElementById('taxCodeEquals2VatNumber')).toBeInTheDocument();
});

test('Test: fideiussioni garantito product does not render the party without vat number checkbox', () => {
  renderComponent({ productId: PRODUCT_IDS.FD_GARANTITO });

  expect(document.getElementById('party_without_vatnumber')).not.toBeInTheDocument();
});

test('Test: tax code equals vat number checkbox is disabled when tax code is not 11 chars long', () => {
  formik.values.taxCode = '123';
  renderComponent();

  expect(document.getElementById('taxCodeEquals2VatNumber')).toBeDisabled();
});

test('Test: tax code equals vat number checkbox is disabled for premium products', () => {
  renderComponent({ controllers: { isPremium: true } });

  expect(document.getElementById('taxCodeEquals2VatNumber')).toBeDisabled();
  expect(document.getElementById('vatNumber')).toBeDisabled();
});

test('Test: tax code equals vat number checkbox is enabled and updates the step history state', () => {
  const { setStepHistoryState } = renderComponent();
  const checkbox = document.getElementById('taxCodeEquals2VatNumber') as HTMLInputElement;

  expect(checkbox).toBeEnabled();
  expect(checkbox).not.toBeChecked();
  expect(document.getElementById('vatNumber')).toBeEnabled();

  fireEvent.click(checkbox);

  expect(setStepHistoryState).toHaveBeenCalledWith({
    externalInstitutionId: '',
    isTaxCodeEquals2PIVA: true,
  });
});

test('Test: when tax code equals vat number the checkbox is checked and the vat number field is disabled', () => {
  renderComponent({ isTaxCodeEquals2PIVA: true });

  expect(document.getElementById('taxCodeEquals2VatNumber')).toBeChecked();
  expect(document.getElementById('vatNumber')).toBeDisabled();
});

test('Test: party without vat number checkbox updates formik and resets tax code equals vat number', () => {
  const { setStepHistoryState } = renderComponent({ isTaxCodeEquals2PIVA: true });

  fireEvent.click(document.getElementById('party_without_vatnumber') as HTMLInputElement);

  expect(formik.setFieldValue).toHaveBeenCalledWith('hasVatnumber', false);
  expect(setStepHistoryState).toHaveBeenCalledWith({
    externalInstitutionId: '',
    isTaxCodeEquals2PIVA: false,
  });
});

test('Test: PSP renders the group vat number checkbox and updates formik', () => {
  renderComponent({ institutionType: 'PSP' });
  const checkbox = document.getElementById('vatNumberGroup') as HTMLInputElement;

  expect(screen.getByText('La Partita IVA è di gruppo')).toBeInTheDocument();
  expect(checkbox).toBeEnabled();

  fireEvent.click(checkbox);

  expect(formik.setFieldValue).toHaveBeenCalledWith('vatNumberGroup', true, true);
});

test('Test: PSP group vat number checkbox is disabled when premium with an already set group vat number', () => {
  renderComponent({
    institutionType: 'PSP',
    controllers: { isPremium: true },
    pspData: { vatNumberGroup: true },
  });

  expect(document.getElementById('vatNumberGroup')).toBeDisabled();
});

test('Test: PSP group vat number checkbox is not rendered when the party has no vat number', () => {
  formik.values.hasVatnumber = false;
  renderComponent({ institutionType: 'PSP' });

  expect(document.getElementById('vatNumberGroup')).not.toBeInTheDocument();
});

test('Test: non PSP does not render the group vat number checkbox', () => {
  renderComponent({ institutionType: 'PRV' });

  expect(document.getElementById('vatNumberGroup')).not.toBeInTheDocument();
});

test('Test: PRV + prod-idpay-merchant hides both checkboxes and disables the vat number field', () => {
  renderComponent({ institutionType: 'PRV', productId: PRODUCT_IDS.IDPAY_MERCHANT });

  expect(document.getElementById('taxCodeEquals2VatNumber')).not.toBeInTheDocument();
  expect(document.getElementById('party_without_vatnumber')).not.toBeInTheDocument();
  expect(document.getElementById('vatNumber')).toBeDisabled();
});

test('Test: PRV on a different product still shows the checkboxes and enables the vat number field', () => {
  renderComponent({ institutionType: 'PRV', productId: PRODUCT_IDS.PAGOPA });

  expect(document.getElementById('taxCodeEquals2VatNumber')).toBeInTheDocument();
  expect(document.getElementById('party_without_vatnumber')).toBeInTheDocument();
  expect(document.getElementById('vatNumber')).toBeEnabled();
});
