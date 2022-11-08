/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */

import { Box, styled } from '@mui/system';
import { Grid, TextField, Typography, useTheme, Paper } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';
import { useEffect } from 'react';
import {
  BillingData,
  InstitutionType,
  Party,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../types';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { useHistoryState } from '../useHistoryState';
import { MessageNoAction } from '../MessageNoAction';

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

const mailPECRegexp = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
const fiscalAndVatCodeRegexp = new RegExp(
  /(^[A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1}$|^[0-9]{11}$)/
);

const fiveCharactersAllowed = new RegExp('^\\d{5}$');
const commercialRegisterNumberRegexp = new RegExp('^\\d{11}$');
const numericField = new RegExp('^[0-9]');

type StepBillingDataHistoryState = {
  externalInstitutionId: string;
  isTaxCodeEquals2PIVA: boolean;
};

type Props = StepperStepComponentProps & {
  initialFormData: BillingData;
  institutionType: InstitutionType;
  subtitle: string;
  externalInstitutionId: string;
  origin: string;
  productId?: string;
  selectedParty?: Party;
  selectedProduct?: Product | null;
  outcome?: RequestOutcomeMessage | null;
};

export default function StepBillingData({
  initialFormData,
  back,
  forward,
  subtitle,
  institutionType,
  externalInstitutionId,
  origin,
  outcome,
}: Props) {
  const requiredError = 'Required';
  const ipa = origin === 'IPA';
  const isDisabled = ipa && institutionType !== 'PSP';
  const isPSP = institutionType === 'PSP';

  const { t } = useTranslation();
  const theme = useTheme();

  const [stepHistoryState, setStepHistoryState, setStepHistoryStateHistory] =
    useHistoryState<StepBillingDataHistoryState>('stepBillingData', {
      externalInstitutionId,
      isTaxCodeEquals2PIVA:
        !!initialFormData.vatNumber && initialFormData.taxCode === initialFormData.vatNumber,
    });

  useEffect(() => {
    if (externalInstitutionId !== stepHistoryState.externalInstitutionId) {
      setStepHistoryState({
        externalInstitutionId,
        isTaxCodeEquals2PIVA:
          !!initialFormData.vatNumber && initialFormData.taxCode === initialFormData.vatNumber,
      });
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

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const validate = (values: Partial<BillingData>) =>
    Object.fromEntries(
      Object.entries({
        businessName: !values.businessName ? requiredError : undefined,
        registeredOffice: !values.registeredOffice ? requiredError : undefined,
        zipCode: !values.zipCode
          ? requiredError
          : !fiveCharactersAllowed.test(values.zipCode)
          ? t('stepBillingData.invalidZipCode')
          : undefined,
        taxCode: !values.taxCode
          ? requiredError
          : values.taxCode && !fiscalAndVatCodeRegexp.test(values.taxCode)
          ? t('stepBillingData.invalidFiscalCode')
          : undefined,
        vatNumber:
          !values.vatNumber && !stepHistoryState.isTaxCodeEquals2PIVA
            ? requiredError
            : values.vatNumber &&
              !fiscalAndVatCodeRegexp.test(values.vatNumber) &&
              !stepHistoryState.isTaxCodeEquals2PIVA
            ? t('stepBillingData.invalidVatNumber')
            : values.taxCode &&
              stepHistoryState.isTaxCodeEquals2PIVA &&
              !fiscalAndVatCodeRegexp.test(values.taxCode)
            ? t('stepBillingData.invalidVatNumber')
            : undefined,
        digitalAddress: !values.digitalAddress
          ? requiredError
          : !mailPECRegexp.test(values.digitalAddress)
          ? t('stepBillingData.invalidEmail')
          : undefined,

        commercialRegisterNumber:
          isPSP && !values.commercialRegisterNumber
            ? requiredError
            : values.commercialRegisterNumber &&
              !commercialRegisterNumberRegexp.test(values.commercialRegisterNumber) &&
              isPSP
            ? t('stepBillingData.invalidCommercialRegisterNumber')
            : undefined,
        registrationInRegister: isPSP && !values.registrationInRegister ? requiredError : undefined,
        dpoAddress: isPSP && !values.dpoAddress ? requiredError : undefined,
        registerNumber:
          isPSP && !values.registerNumber
            ? requiredError
            : isPSP && values.registerNumber && !numericField.test(values.registerNumber)
            ? t('stepBillingData.invalidregisterNumber')
            : undefined,
        abiCode:
          isPSP && !values.abiCode
            ? requiredError
            : isPSP && values.abiCode && !fiveCharactersAllowed.test(values.abiCode)
            ? t('stepBillingData.invalidabiCode')
            : undefined,
        dopEmailAddress:
          isPSP && !values.dopEmailAddress
            ? requiredError
            : isPSP && values.dopEmailAddress && !mailPECRegexp.test(values.dopEmailAddress)
            ? t('stepBillingData.invalidEmail')
            : undefined,
        dpoPecAddress:
          isPSP && !values.dpoPecAddress
            ? requiredError
            : isPSP && values.dpoPecAddress && !mailPECRegexp.test(values.dpoPecAddress)
            ? t('stepBillingData.invalidEmail')
            : undefined,
        recipientCode: !values.recipientCode ? requiredError : undefined,
      }).filter(([_key, value]) => value)
    );

  const formik = useFormik<BillingData>({
    initialValues: {
      ...initialFormData,
      publicServices:
        initialFormData.publicServices !== undefined
          ? initialFormData.publicServices
          : institutionType === 'GSP'
          ? false
          : undefined,
    },
    validateOnMount: true,
    validate,
    onSubmit: (values) => {
      forward(values);
    },
  });

  useEffect(() => {
    if (
      !stepHistoryState.isTaxCodeEquals2PIVA &&
      formik.values.taxCode === formik.values.vatNumber &&
      formik.values.taxCode.length > 0
    ) {
      setStepHistoryState({
        ...stepHistoryState,
        isTaxCodeEquals2PIVA: true,
      });
    } else if (stepHistoryState.isTaxCodeEquals2PIVA && formik.values.taxCode.length === 0) {
      void formik.setFieldValue('vatNumber', '');
      setStepHistoryState({
        ...stepHistoryState,
        isTaxCodeEquals2PIVA: false,
      });
    }
  }, [formik.values.taxCode, formik.values.vatNumber]);

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

  const baseNumericFieldProps = (
    field: keyof BillingData,
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
  return outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <Box display="flex" justifyContent="center">
      <Grid container item xs={8}>
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
            {t('stepBillingData.title')}
          </Typography>
        </Grid>

        <Grid container item justifyContent="center" mt={2} mb={4}>
          <Grid item xs={12}>
            <Typography variant="body1" align="center">
              {subtitle}
            </Typography>
          </Grid>
        </Grid>

        <form onSubmit={formik.handleSubmit}>
          <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 1 }}>
            <Grid item container spacing={3} px={3} pt={3} pb={2}>
              <Grid item xs={12}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'businessName',
                    t('stepBillingData.businessName'),
                    400,
                    18
                  )}
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
              {institutionType === 'GSP' && (
                <Grid item xs={12}>
                  <Typography>
                    <Checkbox
                      id="billingdata"
                      checked={formik.values.publicServices}
                      value={formik.values.publicServices}
                      onChange={(_, checked: boolean) =>
                        formik.setFieldValue('publicServices', checked, true)
                      }
                    />
                    {t('stepBillingData.gspDescription')}
                  </Typography>
                </Grid>
              )}
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
                  {...baseTextFieldProps(
                    'recipientCode',
                    t('stepBillingData.recipientCode'),
                    400,
                    18
                  )}
                  // value={''}
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
          {isPSP && (
            <>
              <Grid container item justifyContent="center" mt={6} mb={4}>
                <Grid item xs={12}>
                  <Typography
                    align="center"
                    sx={{ fontWeight: 'fontWeightMedium', fontSize: '24px' }}
                  >
                    {t('stepBillingData.dpoTitle')}
                  </Typography>
                </Grid>
              </Grid>
              <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 1 }}>
                <Grid item container spacing={3} p={3}>
                  <Grid item xs={12}>
                    <CustomTextField
                      {...baseTextFieldProps(
                        'dpoAddress',
                        t('stepBillingData.dpoAddress'),
                        400,
                        18
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      {...baseTextFieldProps(
                        'dpoPecAddress',
                        t('stepBillingData.dpoPecAddress'),
                        400,
                        18
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      {...baseTextFieldProps(
                        'dopEmailAddress',
                        t('stepBillingData.dopEmailAddress'),
                        400,
                        18
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </form>

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
