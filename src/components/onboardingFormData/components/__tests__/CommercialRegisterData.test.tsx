import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { InstitutionType } from '../../../../../types';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import CommercialRegisterData from '../CommercialRegisterData';

const formik: any = {
  values: {},
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
  pspData,
  shrinkRea = false,
  isInfoCompany = false,
}: {
  institutionType?: InstitutionType;
  productId?: string;
  controllers?: Record<string, unknown>;
  pspData?: any;
  shrinkRea?: boolean;
  isInfoCompany?: boolean;
} = {}) => {
  const setShrinkRea = vi.fn();
  renderComponentWithProviders(
    <CommercialRegisterData
      isInfoCompany={isInfoCompany}
      institutionType={institutionType}
      baseTextFieldProps={mockBaseTextFieldProps}
      formik={formik}
      setShrinkRea={setShrinkRea}
      shrinkRea={shrinkRea}
      controllers={{ ...defaultControllers, ...controllers } as any}
      pspData={pspData}
    />,
    productId
  );
  return { setShrinkRea };
};

beforeEach(() => {
  vi.clearAllMocks();
  formik.values = {};
  formik.errors = {};
});

test('Test: PA + prod-pn renders neither the commercial register nor the PSP fields', () => {
  renderComponent();

  expect(screen.queryByText(/Luogo di iscrizione al Registro delle Imprese/)).not.toBeInTheDocument();
  expect(screen.queryByText(/REA/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Capitale sociale/)).not.toBeInTheDocument();
  expect(document.getElementById('commercialRegisterNumber')).not.toBeInTheDocument();
});

test('Test: SA renders the commercial register section with all required labels', () => {
  renderComponent({ institutionType: 'SA' });

  expect(
    screen.getByText('Luogo di iscrizione al Registro delle Imprese (obbligatorio)')
  ).toBeInTheDocument();
  expect(screen.getByText('REA')).toBeInTheDocument();
  expect(screen.getByText('Capitale sociale')).toBeInTheDocument();
});

test('Test: PRV + prod-interop renders the required register place and the required share capital', () => {
  renderComponent({ institutionType: 'PRV', productId: PRODUCT_IDS.INTEROP });

  expect(
    screen.getByText('Luogo di iscrizione al Registro delle Imprese (obbligatorio)')
  ).toBeInTheDocument();
  expect(screen.getByText('REA')).toBeInTheDocument();
  expect(screen.getByText('Capitale sociale')).toBeInTheDocument();
});

test('Test: PRV + prod-idpay-merchant renders the required register place, an optional share capital and its helper', () => {
  renderComponent({ institutionType: 'PRV', productId: PRODUCT_IDS.IDPAY_MERCHANT });

  expect(
    screen.getByText('Luogo di iscrizione al Registro delle Imprese (obbligatorio)')
  ).toBeInTheDocument();
  expect(screen.getByText('Capitale sociale (facoltativo)')).toBeInTheDocument();
  expect(screen.getByText('Da compilare solo per le società di capitali')).toBeInTheDocument();
});

test('Test: PRV + prod-pagopa renders the optional register place, REA and share capital', () => {
  renderComponent({ institutionType: 'PRV', productId: PRODUCT_IDS.PAGOPA });

  expect(
    screen.getByText('Luogo di iscrizione al Registro delle Imprese (facoltativo)')
  ).toBeInTheDocument();
  expect(screen.getByText('REA (facoltativo)')).toBeInTheDocument();
  expect(screen.getByText('Capitale sociale (facoltativo)')).toBeInTheDocument();
  expect(screen.queryByText('Da compilare solo per le società di capitali')).not.toBeInTheDocument();
});

test('Test: PRV + prod-ced renders the optional register place and the required REA', () => {
  renderComponent({ institutionType: 'PRV', productId: PRODUCT_IDS.CED });

  expect(
    screen.getByText('Luogo di iscrizione al Registro delle Imprese (facoltativo)')
  ).toBeInTheDocument();
  expect(screen.getByText('REA')).toBeInTheDocument();
});

test('Test: REA field renders the RM-123456 placeholder', () => {
  renderComponent({ institutionType: 'SA' });

  expect(document.getElementById('rea')).toHaveAttribute('placeholder', 'RM-123456');
});

test('Test: share capital click shrinks the REA label', () => {
  const { setShrinkRea } = renderComponent({ institutionType: 'SA' });

  fireEvent.click(document.getElementById('shareCapital') as HTMLInputElement);

  expect(setShrinkRea).toHaveBeenCalledWith(true);
});

test('Test: share capital blur without a value unshrinks the label', () => {
  const { setShrinkRea } = renderComponent({ institutionType: 'SA' });

  fireEvent.blur(document.getElementById('shareCapital') as HTMLInputElement);

  expect(setShrinkRea).toHaveBeenCalledWith(false);
});

test('Test: share capital blur with a value keeps the label shrunk', () => {
  formik.values.shareCapital = 10000;
  const { setShrinkRea } = renderComponent({ institutionType: 'SA', shrinkRea: true });

  fireEvent.blur(document.getElementById('shareCapital') as HTMLInputElement);

  expect(setShrinkRea).not.toHaveBeenCalled();
});

test('Test: PSP renders the PSP register fields and not the commercial register section', () => {
  renderComponent({ institutionType: 'PSP', productId: PRODUCT_IDS.PAGOPA });

  expect(screen.getByText('n. Iscrizione al Registro delle Imprese')).toBeInTheDocument();
  expect(screen.getByText('Iscrizione all’Albo')).toBeInTheDocument();
  expect(screen.getByText('Numero dell’Albo')).toBeInTheDocument();
  expect(screen.getByText('Codice ABI')).toBeInTheDocument();

  expect(screen.queryByText(/Luogo di iscrizione al Registro delle Imprese/)).not.toBeInTheDocument();
  expect(screen.queryByText(/REA/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Capitale sociale/)).not.toBeInTheDocument();
});

test('Test: non PSP does not render the PSP register fields', () => {
  renderComponent({ institutionType: 'SA' });

  expect(screen.queryByText('Iscrizione all’Albo')).not.toBeInTheDocument();
  expect(screen.queryByText('Numero dell’Albo')).not.toBeInTheDocument();
  expect(screen.queryByText('Codice ABI')).not.toBeInTheDocument();
});

test('Test: PSP fields are enabled when there is no PSP data', () => {
  renderComponent({ institutionType: 'PSP', controllers: { isDisabled: true } });

  expect(document.getElementById('commercialRegisterNumber')).toBeEnabled();
  expect(document.getElementById('registrationInRegister')).toBeEnabled();
  expect(document.getElementById('registerNumber')).toBeEnabled();
  expect(document.getElementById('abiCode')).toBeEnabled();
});

test('Test: PSP fields are disabled when the data come from the registry', () => {
  formik.values = { abiCode: '12345', legalRegisterNumber: '99' };
  renderComponent({
    institutionType: 'PSP',
    controllers: { isDisabled: true },
    pspData: {
      businessRegisterNumber: '123',
      legalRegisterName: 'Albo',
      legalRegisterNumber: '99',
      abiCode: '12345',
    },
  });

  expect(document.getElementById('commercialRegisterNumber')).toBeDisabled();
  expect(document.getElementById('registrationInRegister')).toBeDisabled();
  expect(document.getElementById('registerNumber')).toBeDisabled();
  expect(document.getElementById('abiCode')).toBeDisabled();
});

test('Test: PSP fields stay enabled when the registry data have a validation error', () => {
  formik.values = { abiCode: '12345', legalRegisterNumber: '99' };
  formik.errors = {
    commercialRegisterNumber: 'Invalid',
    legalRegisterNumber: 'Invalid',
    abiCode: 'Invalid',
  };
  renderComponent({
    institutionType: 'PSP',
    controllers: { isDisabled: true },
    pspData: {
      businessRegisterNumber: '123',
      legalRegisterName: 'Albo',
      legalRegisterNumber: '99',
      abiCode: '12345',
    },
  });

  expect(document.getElementById('commercialRegisterNumber')).toBeEnabled();
  expect(document.getElementById('registerNumber')).toBeEnabled();
  expect(document.getElementById('abiCode')).toBeEnabled();
});

test('Test: information company renders the optional commercial register section', () => {
  renderComponent({ institutionType: 'GSP', productId: PRODUCT_IDS.IO_SIGN, isInfoCompany: true });

  expect(
    screen.getByText('Luogo di iscrizione al Registro delle Imprese (facoltativo)')
  ).toBeInTheDocument();
  expect(screen.getByText('REA')).toBeInTheDocument();
  expect(screen.getByText('Capitale sociale (facoltativo)')).toBeInTheDocument();
});
