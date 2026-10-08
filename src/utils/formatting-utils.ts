import { OnboardingControllers } from '../hooks/useOnboardingControllers';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { requiredError } from './constants';
import { fieldColor } from './style-utils';

export const formatCity = (city: string): string =>
  city
    .charAt(0)
    .toUpperCase()
    .concat(city.substring(1).toLowerCase().replace('- comune', '').trim());

export const fileFromReader = async (
  reader: ReadableStreamDefaultReader<Uint8Array> | undefined
): Promise<string> => {
  const stream = new ReadableStream({
    start(controller) {
      return pump();
      function pump(): Promise<any> | undefined {
        return reader?.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          return pump();
        });
      }
    },
  });
  const response = new Response(stream);

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const baseNumericFieldProps = (
  field: keyof OnboardingFormData,
  label: string,
  fontWeight: string | number = 'fontWeightMedium',
  fontSize: number = 18,
  controllers: OnboardingControllers,
  formik: any
) => {
  const isError = !!formik.errors[field] && formik.errors[field] !== requiredError;
  return {
    id: field,
    type: 'tel',
    value: formik.values[field],
    label,
    error: isError,
    helperText: isError ? formik.errors[field] : undefined,
    required: true,
    variant: 'outlined' as const,
    onChange: formik.handleChange,
    sx: { width: '100%' },
    InputProps: {
      style: {
        fontSize,
        fontWeight,
        lineHeight: '24px',
        color: fieldColor(controllers.isDisabled),
        textAlign: 'start' as const,
        paddingLeft: '16px',
        borderRadius: '4px',
      },
    },
    InputLabelProps: {
      sx: {
        /* allow long labels to wrap instead of being clipped at zoom 400% (WCAG 1.4.10) */
        whiteSpace: 'normal',
        overflow: 'visible',
      },
    },
  };
};
