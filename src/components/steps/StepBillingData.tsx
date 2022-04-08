import { Box, styled } from '@mui/system';
import { Grid, TextField, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';
import { useEffect } from 'react';
import { BillingData, OrganizationType, StepperStepComponentProps } from '../../../types';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { useHistoryState } from '../useHistoryState';

const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

const mailPECRegexp = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');

type StepBillingDataHistoryState = {
  institutionId: string;
  isTaxCodeEquals2PIVA: boolean;
};

type Props = StepperStepComponentProps & {
  initialFormData: BillingData;
  organizationType: OrganizationType;
  subtitle: string;
  institutionId: string;
};

export default function StepBillingData({
  initialFormData,
  back,
  forward,
  subtitle,
  organizationType,
  institutionId,
}: Props) {
  const requiredError = 'Required';
  const ipa = organizationType === 'PA';

  const theme = useTheme();

  const [stepHistoryState, setStepHistoryState, setStepHistoryStateHistory] =
    useHistoryState<StepBillingDataHistoryState>('stepBillingData', {
      institutionId,
      isTaxCodeEquals2PIVA: true,
    });

  useEffect(() => {
    if (institutionId !== stepHistoryState.institutionId) {
      setStepHistoryState({ institutionId, isTaxCodeEquals2PIVA: true });
    }
  }, []);

  useEffect(() => {
    void formik.validateForm();
  }, [stepHistoryState.isTaxCodeEquals2PIVA]);

  const saveHistoryState = () => {
    setStepHistoryStateHistory(stepHistoryState);
  };

  const onForwardAction = () => {
    saveHistoryState();
    forward({
      ...formik.values,
      vatNumber: stepHistoryState.isTaxCodeEquals2PIVA
        ? formik.values.taxCode
        : formik.values.vatNumber,
    });
  };

  const onBackAction = () => {
    saveHistoryState();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  const validate = (values: Partial<BillingData>) =>
    Object.fromEntries(
      Object.entries({
        businessName: !values.businessName ? requiredError : undefined,
        registeredOffice: !values.registeredOffice ? requiredError : undefined,
        taxCode: !values.taxCode ? requiredError : undefined,
        vatNumber:
          stepHistoryState.isTaxCodeEquals2PIVA && !values.vatNumber ? requiredError : undefined,
        mailPEC: !values.mailPEC
          ? requiredError
          : !mailPECRegexp.test(values.mailPEC)
          ? t('stepBillingData.invalidEmail')
          : undefined,
        recipientCode: !values.recipientCode ? requiredError : undefined,
      }).filter(([_key, value]) => value)
    );
  const { t } = useTranslation();

  const formik = useFormik<BillingData>({
    initialValues: initialFormData,
    validateOnMount: true,
    validate,
    onSubmit: (values) => {
      forward(values);
    },
  });

  const baseTextFieldProps = (
    field: keyof BillingData,
    label: string,
    fontWeight: number = 400,
    fontSize: number = 16
  ) => {
    const isError = !!formik.errors[field] && formik.errors[field] !== requiredError;
    return {
      id: field,
      type: 'text',
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
    <Grid container item xs={8}>
      <Grid item xs={12}>
        <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
          {t('stepBillingData.title')}
        </Typography>
      </Grid>

      <Grid container item justifyContent="center" mt={2} mb={4}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" component="h2" align="center">
            {subtitle}
          </Typography>
        </Grid>
      </Grid>
      <Box
        sx={{
          boxShadow:
            '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
          borderRadius: '16px',
          p: 1,
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid item container spacing={4} p={4}>
            <Grid item xs={12}>
              <CustomTextField
                {...baseTextFieldProps('businessName', t('stepBillingData.businessName'), 400, 18)}
                disabled={ipa}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                {...baseTextFieldProps(
                  'registeredOffice',
                  t('stepBillingData.registeredOffice'),
                  400,
                  18
                )}
                disabled={ipa}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                {...baseTextFieldProps('mailPEC', t('stepBillingData.mailPEC'), 400, 18)}
                disabled={ipa}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                {...baseTextFieldProps('taxCode', t('stepBillingData.taxCode'), 400, 18)}
                disabled={ipa}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <Checkbox
                  disabled={ipa}
                  checked={stepHistoryState.isTaxCodeEquals2PIVA}
                  onChange={() =>
                    setStepHistoryState({
                      ...stepHistoryState,
                      isTaxCodeEquals2PIVA: !stepHistoryState.isTaxCodeEquals2PIVA,
                    })
                  }
                />
                {t('stepBillingData.taxCodeEquals2PIVAdescription')}
              </Typography>
            </Grid>
            {stepHistoryState.isTaxCodeEquals2PIVA && (
              // formik.initialValues.taxCode !== formik.initialValues.vatNumber &&
              <Grid item xs={12}>
                <CustomTextField
                  {...baseTextFieldProps('vatNumber', t('stepBillingData.vatNumber'), 400, 18)}
                  disabled={ipa}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <CustomTextField
                {...baseTextFieldProps(
                  'recipientCode',
                  t('stepBillingData.recipientCode'),
                  400,
                  18
                )}
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
            {organizationType === 'GSP' && (
              <Grid item xs={12}>
                <Typography>
                  <Checkbox
                    value={formik.values.publicServices}
                    onChange={(_, checked: boolean) =>
                      formik.setFieldValue('publicServices', checked, true)
                    }
                  />
                  {t('stepBillingData.gspDescription')}
                </Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </Box>
      <Grid item xs={12} my={4}>
        <OnboardingStepActions
          back={{ action: onBackAction, label: t('stepBillingData.backLabel'), disabled: false }}
          forward={{
            action: onForwardAction,
            label: t('stepBillingData.confirmLabel'),
            disabled: !formik.isValid,
          }}
        />
      </Grid>
    </Grid>
  );
}
