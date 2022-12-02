/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */

import { Box, styled } from '@mui/system';
import { Grid, TextField, Typography, useTheme, Paper } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import {
  InstitutionType,
  Party,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../types';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { useHistoryState } from '../useHistoryState';
import { MessageNoAction } from '../MessageNoAction';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import PersonalAndBillingDataSection from '../onboardingFormData/PersonalAndBillingDataSection';

const CustomTextField = styled(TextField)({
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

export type StepBillingDataHistoryState = {
  externalInstitutionId: string;
  isTaxCodeEquals2PIVA: boolean;
};

type Props = StepperStepComponentProps & {
  initialFormData: OnboardingFormData;
  institutionType: InstitutionType;
  subtitle: string;
  externalInstitutionId: string;
  origin?: string;
  productId?: string;
  selectedParty?: Party;
  selectedProduct?: Product | null;
  outcome?: RequestOutcomeMessage | null;
};

export default function StepOnboardingFormData({
  initialFormData,
  back,
  forward,
  subtitle,
  institutionType,
  externalInstitutionId,
  origin,
  outcome,
  productId,
}: Props) {
  const requiredError = 'Required';

  const isPSP = institutionType === 'PSP';

  const { t } = useTranslation();
  const theme = useTheme();

  const [stepHistoryState, setStepHistoryState, _setStepHistoryStateHistory] =
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
    setStepHistoryState(stepHistoryState);
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
  const validate = (values: Partial<OnboardingFormData>) =>
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

  const formik = useFormik<OnboardingFormData>({
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
    field: keyof OnboardingFormData,
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

  return outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <Box display="flex" justifyContent="center">
      <Grid container item xs={8}>
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
            {institutionType === 'PSP' && productId === 'prod-pagopa'
              ? t('stepBillingData.pspAndProdPagoPATitle')
              : t('stepBillingData.title')}
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
          <PersonalAndBillingDataSection
            origin={origin}
            institutionType={institutionType}
            baseTextFieldProps={baseTextFieldProps}
            stepHistoryState={stepHistoryState}
            setStepHistoryState={setStepHistoryState}
            formik={formik}
          />
          {isPSP && (
            <>
              {/* DATI DEL DPO */}
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
