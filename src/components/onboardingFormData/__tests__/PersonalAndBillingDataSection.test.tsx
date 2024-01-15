import { screen } from '@testing-library/react';
import { useFormik } from 'formik';
import React from 'react';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { renderComponentWithProviders } from '../../../utils/test-utils';
import PersonalAndBillingDataSection from '../PersonalAndBillingDataSection';

jest.mock('formik', () => ({
  useFormik: jest.fn(),
}));

const mockFormik = {
  initialValues: {
    businessName: '',
    registeredOffice: '',
    zipCode: '',
    digitalAddress: '',
    taxCode: '',
    vatNumber: '',
    recipientCode: '',
    geographicTaxonomies: [],
  },
  validateOnMount: true,
  validate: jest.fn(),
  onSubmit: jest.fn(),
};

(useFormik as jest.Mock).mockReturnValue(mockFormik);

const formik = {
  values: {
    zipCode: '12345', // Mock zipCode value
  },
  errors: {
    zipCode: 'Invalid zip code', // Mock error message for zipCode
  },
  setFieldValue: jest.fn(), // Mock setFieldValue function
  setErrors: jest.fn(), // Mock setErrors function
  setTouched: jest.fn(), // Mock setTouched function
  handleChange: jest.fn(), // Mock handleChange function
};

const mockBaseTextFieldProps = (
  field: keyof OnboardingFormData,
  label: string,
  fontWeight: number = 400,
  fontSize: number = 16
) => {
  const isError = formik.errors && formik.errors[field] && formik.errors[field] !== 'Required';

  return {
    id: field,
    type: 'text',
    value: formik.values[field] || '',
    label,
    error: isError || false, // Handle undefined or null errors
    helperText: isError ? formik.errors[field] : undefined,
    required: true,
    variant: 'outlined',
    onChange: formik.handleChange,
    sx: { width: '100%' },
    InputProps: {
      style: {
        fontSize,
        fontWeight,
        lineHeight: '24px',
        color: '#5C6F82',
        textAlign: 'start',
        paddingLeft: '16px',
        borderRadius: '4px',
      },
    },
  };
};

test('should render PersonalAndBillingDataSection with institutionType PT. Codice Sdi input field and geo tax section should not visible in page', async () => {
  renderComponentWithProviders(
    <PersonalAndBillingDataSection
      institutionType={'PT'}
      baseTextFieldProps={mockBaseTextFieldProps}
      stepHistoryState={{
        externalInstitutionId: '',
        isTaxCodeEquals2PIVA: false,
      }}
      setStepHistoryState={jest.fn()}
      formik={formik}
      premiumFlow={false}
      isInformationCompany={false}
      institutionAvoidGeotax={true}
    />
  );
  const codiceSDI = screen.queryByText('Codice Sdi');
  const geoTaxSupportMail = screen.queryByText('Indirizzo email visibile ai cittadini');

  expect(codiceSDI).not.toBeInTheDocument();
  expect(geoTaxSupportMail).not.toBeInTheDocument();
});

test('should render PersonalAndBillingDataSection with institutionType PA. Codice Sdi input field and geo tax section should be visible in page', async () => {
  renderComponentWithProviders(
    <PersonalAndBillingDataSection
      institutionType={'PA'}
      baseTextFieldProps={mockBaseTextFieldProps}
      stepHistoryState={{
        externalInstitutionId: '',
        isTaxCodeEquals2PIVA: false,
      }}
      setStepHistoryState={jest.fn()}
      formik={formik}
      premiumFlow={false}
      isInformationCompany={false}
      institutionAvoidGeotax={false}
      isRecipientCodeVisible={true}
    />
  );

  const codiceSDI = await screen.findByText(
    'È il codice necessario per ricevere le fatture elettroniche'
  );
  const geoTaxSupportMail = await screen.findByText('Indirizzo email visibile ai cittadini');

  expect(codiceSDI).toBeInTheDocument();
  expect(geoTaxSupportMail).toBeInTheDocument();
});
