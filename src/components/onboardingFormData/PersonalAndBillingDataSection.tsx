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
  premiumFlow: boolean;
  productId?: string;
};

export default function PersonalAndBillingDataSection({
  institutionType,
  baseTextFieldProps,
  origin,
  stepHistoryState,
  setStepHistoryState,
  formik,
  premiumFlow,
  productId,
}: Props) {
  const { t } = useTranslation();

  const isFromIPA = origin === 'IPA';
  const isPSP = institutionType === 'PSP';
  const isInformationCompany =
    institutionType !== 'PA' && institutionType !== 'PSP' && productId === 'prod-io';
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
  return (
    <>
      {/* DATI DI FATTURAZIONE E ANAGRAFICI */}
      <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 4 }}>
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
            </Typography>
          </Grid>
          {isInformationCompany && (
            <>
              <Grid item xs={8}>
                {/* n. Iscrizione al Registro delle Imprese facoltativo per institution Type !== 'PA' e 'PSP */}
                <CustomTextField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  {...baseTextFieldProps(
                    'commercialRegisterNumberInformationCompanies',
                    t(
                      'onboardingFormData.billingDataSection.informationCompanies.commercialRegisterNumber'
                    ),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                {/* REA facoltativo per institution Type !== 'PA' e 'PSP */}
                <CustomTextField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  {...baseTextFieldProps(
                    'reaInformationCompanies',
                    t('onboardingFormData.billingDataSection.informationCompanies.rea'),
                    400,
                    18
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                {/* capitale sociale facoltativo per institution Type !== 'PA' e 'PSP */}
                <CustomTextField
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  defaultValue={'\u20AC'}
                  {...baseTextFieldProps(
                    'shareCapitalInformationCompanies',
                    t('onboardingFormData.billingDataSection.informationCompanies.shareCapital'),
                    400,
                    18
                  )}
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
          <Grid item xs={12}>
            {/* Codice destinatario */}
            <CustomTextField
              {...baseTextFieldProps(
                'recipientCode',
                t('onboardingFormData.billingDataSection.recipientCode'),
                400,
                18
              )}
            />
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
        </Grid>
      </Paper>
    </>
  );
}
