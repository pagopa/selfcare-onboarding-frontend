/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */

import { Box } from '@mui/system';
import { Grid, Typography, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { styled } from '@mui/system';
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
import DpoSection from '../onboardingFormData/DpoSection';
import TaxonomySection from '../onboardingFormData/taxonomy/TaxonomySection';
import { GeographicTaxonomy } from '../../model/GeographicTaxonomies';

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
  geographicTaxonomies: Array<GeographicTaxonomy>;
};

export const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

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
  const [geographicTaxonomies, setGeographicTaxonomies] = useState<Array<GeographicTaxonomy>>([]);

  console.log('geographicTaxonomies in step', geographicTaxonomies);
  const isPSP = institutionType === 'PSP';

  // CASE 1: New API retrieve some geographicsArea for the party
  // const mockRetrievedGeographicTaxonomies = [
  //   { code: '2322435', desc: 'Comune di Cagliari' },
  //   { code: '2322435', desc: 'Comune di Alghero' },
  // ];

  // CASE 2: New API NOT found some geographicsArea for the party
  const mockRetrievedGeographicTaxonomies: Array<GeographicTaxonomy> = [];

  // CASE 3: New API found National area selected
  // const mockRetrievedGeographicTaxonomies = [{ code: '100', desc: 'ITALIA' }];

  const { t } = useTranslation();

  const [stepHistoryState, setStepHistoryState, _setStepHistoryStateHistory] =
    useHistoryState<StepBillingDataHistoryState>('onboardingFormData', {
      externalInstitutionId,
      isTaxCodeEquals2PIVA:
        !!initialFormData.vatNumber && initialFormData.taxCode === initialFormData.vatNumber,
      geographicTaxonomies,
    });

  useEffect(() => {
    if (externalInstitutionId !== stepHistoryState.externalInstitutionId) {
      setStepHistoryState({
        externalInstitutionId,
        isTaxCodeEquals2PIVA:
          !!initialFormData.vatNumber && initialFormData.taxCode === initialFormData.vatNumber,
        geographicTaxonomies,
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
      geographicTaxonomies,
    });
    console.log('typed values:', formik.values);
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
          ? t('onboardingFormData.billingDataSection.invalidZipCode')
          : undefined,
        taxCode: !values.taxCode
          ? requiredError
          : values.taxCode && !fiscalAndVatCodeRegexp.test(values.taxCode)
          ? t('onboardingFormData.billingDataSection.invalidFiscalCode')
          : undefined,
        vatNumber:
          !values.vatNumber && !stepHistoryState.isTaxCodeEquals2PIVA
            ? requiredError
            : values.vatNumber &&
              !fiscalAndVatCodeRegexp.test(values.vatNumber) &&
              !stepHistoryState.isTaxCodeEquals2PIVA
            ? t('onboardingFormData.billingDataSection.invalidVatNumber')
            : values.taxCode &&
              stepHistoryState.isTaxCodeEquals2PIVA &&
              !fiscalAndVatCodeRegexp.test(values.taxCode)
            ? t('onboardingFormData.billingDataSection.invalidVatNumber')
            : undefined,
        digitalAddress: !values.digitalAddress
          ? requiredError
          : !mailPECRegexp.test(values.digitalAddress)
          ? t('onboardingFormData.billingDataSection.invalidEmail')
          : undefined,

        commercialRegisterNumber:
          isPSP && !values.commercialRegisterNumber
            ? requiredError
            : values.commercialRegisterNumber &&
              !commercialRegisterNumberRegexp.test(values.commercialRegisterNumber) &&
              isPSP
            ? t(
                'onboardingFormData.billingDataSection.pspDataSection.invalidCommercialRegisterNumber'
              )
            : undefined,
        registrationInRegister: isPSP && !values.registrationInRegister ? requiredError : undefined,
        dpoAddress: isPSP && !values.dpoAddress ? requiredError : undefined,
        registerNumber:
          isPSP && !values.registerNumber
            ? requiredError
            : isPSP && values.registerNumber && !numericField.test(values.registerNumber)
            ? t('onboardingFormData.billingDataSection.pspDataSection.invalidregisterNumber')
            : undefined,
        abiCode:
          isPSP && !values.abiCode
            ? requiredError
            : isPSP && values.abiCode && !fiveCharactersAllowed.test(values.abiCode)
            ? t('onboardingFormData.billingDataSection.pspDataSection.invalidabiCode')
            : undefined,
        dopEmailAddress:
          isPSP && !values.dopEmailAddress
            ? requiredError
            : isPSP && values.dopEmailAddress && !mailPECRegexp.test(values.dopEmailAddress)
            ? t('onboardingFormData.billingDataSection.invalidEmail')
            : undefined,
        dpoPecAddress:
          isPSP && !values.dpoPecAddress
            ? requiredError
            : isPSP && values.dpoPecAddress && !mailPECRegexp.test(values.dpoPecAddress)
            ? t('onboardingFormData.billingDataSection.invalidEmail')
            : undefined,
        recipientCode: !values.recipientCode ? requiredError : undefined,
        national: !values.geographicTaxonomies ? requiredError : undefined,
        local: !values.geographicTaxonomies ? requiredError : undefined,
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
              ? t('onboardingFormData.pspAndProdPagoPATitle')
              : t('onboardingFormData.title')}
          </Typography>
        </Grid>

        <Grid container item justifyContent="center" mt={2} mb={4}>
          <Grid item xs={12}>
            <Typography variant="body1" align="center">
              {subtitle}
            </Typography>
          </Grid>
        </Grid>

        <PersonalAndBillingDataSection
          origin={origin}
          institutionType={institutionType}
          baseTextFieldProps={baseTextFieldProps}
          stepHistoryState={stepHistoryState}
          setStepHistoryState={setStepHistoryState}
          formik={formik}
        />
        {/* DATI RELATIVI ALLA TASSONOMIA */}
        <Grid item xs={12}>
          <TaxonomySection
            retrievedTaxonomies={mockRetrievedGeographicTaxonomies}
            setGeographicTaxonomies={setGeographicTaxonomies}
            formik={formik}
          />
        </Grid>

        {isPSP && <DpoSection baseTextFieldProps={baseTextFieldProps} />}

        <Grid item xs={12} my={4}>
          <OnboardingStepActions
            back={{
              action: onBackAction,
              label: t('onboardingFormData.backLabel'),
              disabled: false,
            }}
            forward={{
              action: onForwardAction,
              label: t('onboardingFormData.confirmLabel'),
              disabled: !formik.isValid,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
