import { FormikErrors, FormikProps } from 'formik';
import { Mock, vi } from 'vitest';
import { OnboardingFormData } from '../../model/OnboardingFormData';

// Only the slice of the Formik bag read by the onboarding form sections.
export type FormikMock = {
  values: Partial<OnboardingFormData>;
  initialValues: Partial<OnboardingFormData>;
  errors: FormikErrors<OnboardingFormData>;
  setFieldValue: Mock;
  handleChange: Mock;
};

export const createFormikMock = (
  values: Partial<OnboardingFormData> = {},
  overrides: Partial<Omit<FormikMock, 'values'>> = {}
): FormikMock => ({
  values,
  initialValues: {},
  errors: {},
  setFieldValue: vi.fn(),
  handleChange: vi.fn(),
  ...overrides,
});

// The mock is passed through as is (tests assert that services receive this same object), so it is
// widened to the full Formik bag instead of being copied into a complete FormikProps.
export const asFormikProps = (mock: FormikMock) =>
  mock as unknown as FormikProps<OnboardingFormData>;
