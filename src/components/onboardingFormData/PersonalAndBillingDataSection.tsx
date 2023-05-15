import { Box, styled } from '@mui/system';
import { useEffect, useState } from 'react';
import { Grid, TextField, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';
import { theme } from '@pagopa/mui-italia';
import { InstitutionType, StepperStepComponentProps } from '../../../types';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { StepBillingDataHistoryState } from '../steps/StepOnboardingFormData';
import NumberDecimalFormat from './NumberDecimalFormat';

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
  premiumFlow: boolean;
  isInformationCompany: boolean;
};

export default function PersonalAndBillingDataSection({
  institutionType,
  baseTextFieldProps,
  origin,
  stepHistoryState,
  setStepHistoryState,
  formik,
  premiumFlow,
  isInformationCompany,
}: Props) {
  const { t } = useTranslation();

  const isFromIPA = origin === 'IPA';
  const isPSP = institutionType === 'PSP';
  const isPA = institutionType === 'PA';
  const isDisabled = premiumFlow || (isFromIPA && !isPA && !isPSP) || isPA;
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
  const [shrinkValue, setShrinkValue] = useState<boolean>(false);
  useEffect(() => {
    const shareCapitalIsNan = isNaN(formik.values.shareCapital);
    if (shareCapitalIsNan) {
      formik.setFieldValue('shareCapital', undefined);
    }
    if (formik.values.shareCapital) {
      setShrinkValue(true);
    } else {
      setShrinkValue(false);
    }
  }, [formik.values.shareCapital]);

  return (
    <>
      {/* DATI DI FATTURAZIONE E ANAGRAFICI */}
      <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 4, width: '704px' }}>
        <Grid item container spacing={3}>
          {/* Ragione sociale */}
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'businessName',
                t('onboardingFormData.billingDataSection.businessName'),
                400,
                18
              )}
              disabled={isDisabled}
            />
          </Grid>
          {/* Sede legale */}
          <Grid item xs={8}>
            <CustomTextField
              {...baseTextFieldProps(
                'registeredOffice',
                t('onboardingFormData.billingDataSection.registeredOffice'),
                400,
                18
              )}
              disabled={isDisabled}
            />
          </Grid>
          {/* CAP */}
          <Grid item xs={4} paddingLeft={1}>
            <CustomNumberField
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              {...baseNumericFieldProps(
                'zipCode',
                t('onboardingFormData.billingDataSection.zipCode'),
                400,
                18
              )}
              disabled={isDisabled}
            />
          </Grid>
          {/* Indirizzo PEC */}
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'digitalAddress',
                t('onboardingFormData.billingDataSection.digitalAddress'),
                400,
                18
              )}
              disabled={isDisabled}
            />
          </Grid>
          {/* Codice fiscale */}
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'taxCode',
                t('onboardingFormData.billingDataSection.taxCode'),
                400,
                18
              )}
              disabled={isDisabled}
            />
          </Grid>
          {/* Checkbox codice fiscale = P.IVA */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <Checkbox
                id="onboardingFormData"
                checked={stepHistoryState.isTaxCodeEquals2PIVA}
                disabled={premiumFlow}
                inputProps={{
                  'aria-label': t(
                    'onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription'
                  ),
                }}
                onChange={() => {
                  void formik.setFieldValue('vatNumber', '');
                  setStepHistoryState({
                    ...stepHistoryState,
                    isTaxCodeEquals2PIVA: !stepHistoryState.isTaxCodeEquals2PIVA,
                  });
                }}
              />
              <Typography component={'span'}>
                {t('onboardingFormData.billingDataSection.taxCodeEquals2PIVAdescription')}
              </Typography>
            </Box>
          </Grid>
          {/* Partita IVA */}
          <Grid item xs={12}>
            <Typography component={'span'}>
              <CustomTextField
                {...baseTextFieldProps(
                  'vatNumber',
                  t('onboardingFormData.billingDataSection.vatNumber'),
                  400,
                  18
                )}
                value={
                  stepHistoryState.isTaxCodeEquals2PIVA
                    ? formik.values.taxCode
                    : formik.values.vatNumber
                }
                disabled={stepHistoryState.isTaxCodeEquals2PIVA || premiumFlow}
              />
              {isPSP && (
                <Box display="flex" alignItems="center" mt="2px">
                  {/* Checkbox la aprtita IVA è di gruppo */}
                  <Checkbox
                    inputProps={{
                      'aria-label': t('onboardingFormData.billingDataSection.vatNumberGroup'),
                    }}
                    checked={formik.values.vatNumberGroup}
                    onChange={(_, checked: boolean) =>
                      formik.setFieldValue('vatNumberGroup', checked, true)
                    }
                    value={formik.values.vatNumberGroup}
                  />
                  <Typography component={'span'}>
                    {t('onboardingFormData.billingDataSection.vatNumberGroup')}
                  </Typography>
                </Box>
              )}
              {/* Codice destinatario */}
              <Grid item xs={12} mt={3}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'recipientCode',
                    t('onboardingFormData.billingDataSection.sdiCode'),
                    400,
                    18
                  )}
                />
                {/* descrizione destinatario */}
                <Typography
                  component={'span'}
                  sx={{
                    fontSize: '12px!important',
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t('onboardingFormData.billingDataSection.recipientCodeDescription')}
                </Typography>
              </Grid>
            </Typography>
          </Grid>
          {/* institutionType !== 'PA' && institutionType !== 'PSP' && productId === 'prod-io'; */}
          {isInformationCompany && (
            <>
              <Grid item xs={12}>
                {/* Luogo di iscrizione al Registro delle Imprese facoltativo per institution Type !== 'PA' e 'PSP */}
                <CustomTextField
                  {...baseTextFieldProps(
                    'businessRegisterPlace',
                    t(
                      'onboardingFormData.billingDataSection.informationCompanies.commercialRegisterNumber'
                    ),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                {/* REA facoltativo per institution Type !== 'PA' e 'PSP */}
                <CustomTextField
                  placeholder={'RM-123456'}
                  {...baseTextFieldProps(
                    'rea',
                    t('onboardingFormData.billingDataSection.informationCompanies.rea'),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                {/* capitale sociale facoltativo per institution Type !== 'PA' e 'PSP */}
                <CustomTextField
                  name={'shareCapital'}
                  {...baseTextFieldProps(
                    'shareCapital',
                    t('onboardingFormData.billingDataSection.informationCompanies.shareCapital'),
                    400,
                    18
                  )}
                  onClick={() => setShrinkValue(true)}
                  onBlur={() => {
                    if (!formik.values.shareCapital) {
                      setShrinkValue(false);
                    }
                  }}
                  InputLabelProps={{ shrink: shrinkValue }}
                  InputProps={{
                    inputComponent: NumberDecimalFormat,
                  }}
                />
              </Grid>
            </>
          )}
          {isPSP && (
            <>
              <Grid item xs={12}>
                {/* n. Iscrizione al Registro delle Imprese */}
                <CustomTextField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  {...baseTextFieldProps(
                    'commercialRegisterNumber',
                    t(
                      'onboardingFormData.billingDataSection.pspDataSection.commercialRegisterNumber'
                    ),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                {/* Iscrizione all’Albo */}
                <CustomTextField
                  {...baseTextFieldProps(
                    'registrationInRegister',
                    t(
                      'onboardingFormData.billingDataSection.pspDataSection.registrationInRegister'
                    ),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                {/* Numero dell’Albo */}
                <CustomTextField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  {...baseTextFieldProps(
                    'registerNumber',
                    t('onboardingFormData.billingDataSection.pspDataSection.registerNumber'),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                {/* ABI code */}
                <CustomTextField
                  {...baseTextFieldProps(
                    'abiCode',
                    t('onboardingFormData.billingDataSection.pspDataSection.abiCode'),
                    400,
                    18
                  )}
                />
              </Grid>
            </>
          )}
          {/* indirizzo mail di supporto */}
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'supportEmail',
                t('onboardingFormData.billingDataSection.assistanceContact.supportEmail'),
                400,
                18
              )}
            />
            {/* descrizione indirizzo mail di supporto */}
            <Typography
              component={'span'}
              sx={{
                fontSize: '12px!important',
                fontWeight: 600,
                color: theme.palette.text.secondary,
              }}
            >
              {t('onboardingFormData.billingDataSection.assistanceContact.supportEmailDescriprion')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
