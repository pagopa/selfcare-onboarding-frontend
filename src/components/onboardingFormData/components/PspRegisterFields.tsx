import { Grid } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { FormikProps } from 'formik';
import { t } from 'i18next';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { CustomTextField } from '../../../utils/style-utils';
import { BaseTextFieldPropsFn } from '../../steps/StepOnboardingFormData';
import { PspFieldsDisabled } from './commercialRegisterDataLayout';

type PspRegisterField = keyof PspFieldsDisabled;

type PspRegisterFieldConfig = {
  field: PspRegisterField;
  labelKey: string;
  xs: 6 | 12;
  numeric: boolean;
};

const PSP_REGISTER_FIELDS: ReadonlyArray<PspRegisterFieldConfig> = [
  {
    field: 'commercialRegisterNumber',
    labelKey: 'onboardingFormData.billingDataSection.pspDataSection.commercialRegisterNumber',
    xs: 12,
    numeric: true,
  },
  {
    field: 'registrationInRegister',
    labelKey: 'onboardingFormData.billingDataSection.pspDataSection.registrationInRegister',
    xs: 12,
    numeric: false,
  },
  {
    field: 'registerNumber',
    labelKey: 'onboardingFormData.billingDataSection.pspDataSection.registerNumber',
    xs: 6,
    numeric: true,
  },
  {
    field: 'abiCode',
    labelKey: 'onboardingFormData.billingDataSection.pspDataSection.abiCode',
    xs: 6,
    numeric: false,
  },
];

const NUMERIC_INPUT_PROPS = { inputMode: 'numeric', pattern: '[0-9]*' } as const;

type Props = {
  baseTextFieldProps: BaseTextFieldPropsFn;
  formik: FormikProps<OnboardingFormData>;
  disabledFields: PspFieldsDisabled;
};

const PspRegisterFields = ({ baseTextFieldProps, formik, disabledFields }: Props) => {
  const abiCodeOverrides = {
    value: formik.values.abiCode,
    InputLabelProps: { shrink: (formik.values.abiCode?.length ?? 0) > 0 },
  };

  return (
    <>
      {PSP_REGISTER_FIELDS.map(({ field, labelKey, xs, numeric }) => (
        <Grid item xs={xs} key={field}>
          <CustomTextField
            inputProps={numeric ? NUMERIC_INPUT_PROPS : undefined}
            {...baseTextFieldProps(field, t(labelKey), 600, theme.palette.text.primary)}
            {...(field === 'abiCode' ? abiCodeOverrides : {})}
            disabled={disabledFields[field]}
          />
        </Grid>
      ))}
    </>
  );
};

export default PspRegisterFields;
