import { Box, styled } from '@mui/system';
import { Grid, TextField, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';
import { useEffect } from 'react';
import { BillingData, InstitutionType, StepperStepComponentProps } from '../../../types';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { useHistoryState } from '../useHistoryState';

const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

const mailPECRegexp = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
const fiscalAndVatCodeRegexp = new RegExp(
  /(^[A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1}$|^[0-9]{11}$)/
);

type StepBillingDataHistoryState = {
  externalInstitutionId: string;
  isTaxCodeNotEquals2PIVA: boolean;
};

type Props = StepperStepComponentProps & {
  initialFormData: BillingData;
  institutionType: InstitutionType;
  subtitle: string;
  externalInstitutionId: string;
  origin: string;
};

export default function StepBillingData({
  initialFormData,
  back,
  forward,
  subtitle,
  institutionType,
  externalInstitutionId,
  origin,
}: Props) {
  const requiredError = 'Required';
  const ipa = origin === 'IPA';

  const { t } = useTranslation();
  const theme = useTheme();

  const [stepHistoryState, setStepHistoryState, setStepHistoryStateHistory] =
    useHistoryState<StepBillingDataHistoryState>('stepBillingData', {
      externalInstitutionId,
      isTaxCodeNotEquals2PIVA: true,
    });

  useEffect(() => {
    if (externalInstitutionId !== stepHistoryState.externalInstitutionId) {
      setStepHistoryState({ externalInstitutionId, isTaxCodeNotEquals2PIVA: false });
    }
  }, []);

  useEffect(() => {
    void formik.validateForm();
  }, [stepHistoryState.isTaxCodeNotEquals2PIVA]);

  const saveHistoryState = () => {
    setStepHistoryStateHistory(stepHistoryState);
  };

  const onForwardAction = () => {
    saveHistoryState();
    forward({
      ...formik.values,
      vatNumber: stepHistoryState.isTaxCodeNotEquals2PIVA
        ? formik.values.taxCode
        : formik.values.vatNumber,
    });
  };

  const onBackAction = () => {
    saveHistoryState();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const validate = (values: Partial<BillingData>) =>
    Object.fromEntries(
      Object.entries({
        businessName: !values.businessName ? requiredError : undefined,
        registeredOffice: !values.registeredOffice ? requiredError : undefined,
        taxCode: !values.taxCode
          ? requiredError
          : values.taxCode && !fiscalAndVatCodeRegexp.test(values.taxCode)
          ? t('stepBillingData.invalidFiscalCode')
          : undefined,
        vatNumber:
          !values.vatNumber && stepHistoryState.isTaxCodeNotEquals2PIVA
            ? requiredError
            : stepHistoryState.isTaxCodeNotEquals2PIVA &&
              values.vatNumber &&
              !fiscalAndVatCodeRegexp.test(values.vatNumber)
            ? t('stepBillingData.invalidVatNumber')
            : undefined,
        mailPEC: !values.digitalAddress
          ? requiredError
          : !mailPECRegexp.test(values.digitalAddress)
          ? t('stepBillingData.invalidEmail')
          : undefined,
        recipientCode: !values.recipientCode ? requiredError : undefined,
      }).filter(([_key, value]) => value)
    );

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
    <Box display="flex" justifyContent="center">
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
                  {...baseTextFieldProps(
                    'businessName',
                    t('stepBillingData.businessName'),
                    400,
                    18
                  )}
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
                  {...baseTextFieldProps(
                    'digitalAddress',
                    t('stepBillingData.digitalAddress'),
                    400,
                    18
                  )}
                  disabled={ipa}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'taxCode',
                    stepHistoryState.isTaxCodeNotEquals2PIVA
                      ? t('stepBillingData.taxCode')
                      : t('stepBillingData.taxCodeAndVatNumber'),
                    400,
                    18
                  )}
                  disabled={ipa}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  <Checkbox
                    checked={stepHistoryState.isTaxCodeNotEquals2PIVA}
                    onChange={() =>
                      setStepHistoryState({
                        ...stepHistoryState,
                        isTaxCodeNotEquals2PIVA: !stepHistoryState.isTaxCodeNotEquals2PIVA,
                      })
                    }
                  />
                  {t('stepBillingData.taxCodeNotEquals2PIVAdescription')}
                </Typography>
              </Grid>
              {stepHistoryState.isTaxCodeNotEquals2PIVA && (
                <Grid item xs={12}>
                  <CustomTextField
                    {...baseTextFieldProps('vatNumber', t('stepBillingData.vatNumber'), 400, 18)}
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
              {institutionType === 'GSP' && (
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
    </Box>
  );
}
