import { Box, styled } from '@mui/system';
import { Grid, TextField, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';
import { theme } from '@pagopa/mui-italia';
import { InstitutionType, StepperStepComponentProps } from '../../../types';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { StepBillingDataHistoryState } from '../steps/StepOnboardingFormData';

const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

const CustomNumberField = styled(TextField)({
  'input::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

type Props = StepperStepComponentProps & {
  institutionType: InstitutionType;
  baseTextFieldProps: any;
  origin?: string;
  stepHistoryState: StepBillingDataHistoryState;
  setStepHistoryState: React.Dispatch<React.SetStateAction<StepBillingDataHistoryState>>;
  formik: any;
};

export default function PersonalAndBillingDataSection({
  institutionType,
  baseTextFieldProps,
  origin,
  stepHistoryState,
  setStepHistoryState,
  formik,
}: Props) {
  const ipa = origin === 'IPA';
  const isPSP = institutionType === 'PSP';
  const isDisabled = ipa && !isPSP;
  const { t } = useTranslation();
  const requiredError = 'Required';

  const baseNumericFieldProps = (
    field: keyof OnboardingFormData,
    label: string,
    fontWeight: number = 400,
    fontSize: number = 16
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
          color: '#5C6F82',
          textAlign: 'start' as const,
          paddingLeft: '16px',
          borderRadius: '4px',
        },
      },
    };
  };
  return (
    <>
      {/* DATI DI FATTURAZIONE E ANAGRAFICI */}
      <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 1 }}>
        <Grid item container spacing={3} px={3} pt={3} pb={2}>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps('businessName', t('stepBillingData.businessName'), 400, 18)}
              disabled={isDisabled}
            />
          </Grid>
          <Grid item xs={8}>
            <CustomTextField
              {...baseTextFieldProps(
                'registeredOffice',
                t('stepBillingData.registeredOffice'),
                400,
                18
              )}
              disabled={isDisabled}
            />
          </Grid>
          <Grid item xs={4} paddingLeft={1}>
            <CustomNumberField
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              {...baseNumericFieldProps('zipCode', t('stepBillingData.zipCode'), 400, 18)}
              disabled={isDisabled}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'digitalAddress',
                t('stepBillingData.digitalAddress'),
                400,
                18
              )}
              disabled={isDisabled}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps('taxCode', t('stepBillingData.taxCode'), 400, 18)}
              disabled={isDisabled}
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={stepHistoryState.isTaxCodeEquals2PIVA}
                inputProps={{
                  'aria-label': t('stepBillingData.taxCodeEquals2PIVAdescription'),
                }}
                onChange={() => {
                  void formik.setFieldValue('vatNumber', '');
                  setStepHistoryState({
                    ...stepHistoryState,
                    isTaxCodeEquals2PIVA: !stepHistoryState.isTaxCodeEquals2PIVA,
                  });
                }}
              />
              <Typography>{t('stepBillingData.taxCodeEquals2PIVAdescription')}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <CustomTextField
                {...baseTextFieldProps('vatNumber', t('stepBillingData.vatNumber'), 400, 18)}
                value={
                  stepHistoryState.isTaxCodeEquals2PIVA
                    ? formik.values.taxCode
                    : formik.values.vatNumber
                }
                disabled={stepHistoryState.isTaxCodeEquals2PIVA}
              />
              {isPSP && (
                <Box display="flex" alignItems="center" mt="2px">
                  <Checkbox
                    inputProps={{
                      'aria-label': t('stepBillingData.vatNumberGroup'),
                    }}
                    checked={formik.values.vatNumberGroup}
                    onChange={(_, checked: boolean) =>
                      formik.setFieldValue('vatNumberGroup', checked, true)
                    }
                    value={formik.values.vatNumberGroup}
                  />
                  <Typography>{t('stepBillingData.vatNumberGroup')}</Typography>
                </Box>
              )}
            </Typography>
          </Grid>
          {isPSP && (
            <>
              <Grid item xs={12}>
                <CustomTextField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  {...baseTextFieldProps(
                    'commercialRegisterNumber',
                    t('stepBillingData.commercialRegisterNumber'),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'registrationInRegister',
                    t('stepBillingData.registrationInRegister'),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  {...baseTextFieldProps(
                    'registerNumber',
                    t('stepBillingData.registerNumber'),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomTextField
                  {...baseTextFieldProps('abiCode', t('stepBillingData.abiCode'), 400, 18)}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps('recipientCode', t('stepBillingData.recipientCode'), 400, 18)}
            />
            <Typography
              sx={{
                fontSize: '12px!important',
                fontWeight: 600,
                color: theme.palette.text.secondary,
              }}
            >
              {t('stepBillingData.recipientCodeDescription')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
