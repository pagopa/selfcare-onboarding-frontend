import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { InstitutionType } from '../../../../../types';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import SupportEmailData from '../SupportEmailData';

const formik: any = {
  values: {},
  errors: {},
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
  productId = PRODUCT_IDS.IO_SIGN,
  controllers = {},
  assistanceContacts,
  institutionAvoidGeotax = false,
}: {
  institutionType?: InstitutionType;
  productId?: string;
  controllers?: Record<string, unknown>;
  assistanceContacts?: { supportEmail?: string };
  institutionAvoidGeotax?: boolean;
} = {}) =>
  renderComponentWithProviders(
    <SupportEmailData
      institutionType={institutionType}
      baseTextFieldProps={mockBaseTextFieldProps}
      controllers={{ ...defaultControllers, ...controllers } as any}
      assistanceContacts={assistanceContacts}
      institutionAvoidGeotax={institutionAvoidGeotax}
    />,
    productId
  );

beforeEach(() => {
  vi.clearAllMocks();
  formik.values = {};
});

test('Test: prod-io-sign renders the required support email and its description', () => {
  renderComponent();

  expect(screen.getByText('Indirizzo email visibile ai cittadini')).toBeInTheDocument();
  expect(
    screen.getByText('È il contatto che i cittadini visualizzano per richiedere assistenza all’ente')
  ).toBeInTheDocument();
});

test('Test: prod-ced + PRV renders the optional support email', () => {
  renderComponent({ institutionType: 'PRV', productId: PRODUCT_IDS.CED });

  expect(
    screen.getByText('Indirizzo email visibile ai cittadini (facoltativo)')
  ).toBeInTheDocument();
  expect(
    screen.getByText('È il contatto che i cittadini visualizzano per richiedere assistenza all’ente')
  ).toBeInTheDocument();
});

test('Test: prod-ced + non private institution does not render the support email', () => {
  renderComponent({ institutionType: 'PA', productId: PRODUCT_IDS.CED });

  expect(screen.queryByText(/Indirizzo email visibile ai cittadini/)).not.toBeInTheDocument();
});

test('Test: other products do not render the support email', () => {
  renderComponent({ productId: PRODUCT_IDS.SEND });

  expect(screen.queryByText(/Indirizzo email visibile ai cittadini/)).not.toBeInTheDocument();
  expect(document.getElementById('supportEmail')).not.toBeInTheDocument();
});

test('Test: institutions avoiding geotaxonomy do not render the support email', () => {
  renderComponent({ institutionType: 'PT', institutionAvoidGeotax: true });

  expect(screen.queryByText(/Indirizzo email visibile ai cittadini/)).not.toBeInTheDocument();
  expect(
    screen.queryByText(
      'È il contatto che i cittadini visualizzano per richiedere assistenza all’ente'
    )
  ).not.toBeInTheDocument();
});

test('Test: support email is enabled when it is not disabled by the controllers', () => {
  renderComponent({ assistanceContacts: { supportEmail: 'help@test.it' } });

  expect(document.getElementById('supportEmail')).toBeEnabled();
});

test('Test: support email is disabled when controllers.isDisabled and assistance contacts have an email', () => {
  renderComponent({
    controllers: { isDisabled: true },
    assistanceContacts: { supportEmail: 'help@test.it' },
  });

  expect(document.getElementById('supportEmail')).toBeDisabled();
});

test('Test: support email is enabled when controllers.isDisabled but there is no assistance contact email', () => {
  renderComponent({ controllers: { isDisabled: true }, assistanceContacts: undefined });

  expect(document.getElementById('supportEmail')).toBeEnabled();
});
