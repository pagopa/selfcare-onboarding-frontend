/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */

import { Grid, TextField, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { emailRegexp } from '@pagopa/selfcare-common-frontend/utils/constants';
import { theme } from '@pagopa/mui-italia';
import {
  InstitutionType,
  Party,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { getFetchOutcome } from '../../lib/error-utils';
import { AooData } from '../../model/AooData';
import { GeographicTaxonomy, nationalValue } from '../../model/GeographicTaxonomies';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { UoData } from '../../model/UoModel';
import { ENV } from '../../utils/env';
import { MessageNoAction } from '../MessageNoAction';
import { OnboardingStepActions } from '../OnboardingStepActions';
import DpoSection from '../onboardingFormData/DpoSection';
import PersonalAndBillingDataSection from '../onboardingFormData/PersonalAndBillingDataSection';
import GeoTaxSessionModal from '../onboardingFormData/taxonomy/GeoTaxSessionModal';
import GeoTaxonomySection from '../onboardingFormData/taxonomy/GeoTaxonomySection';
import { useHistoryState } from '../useHistoryState';

const fiscalAndVatCodeRegexp = new RegExp(
  /(^[A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1}$|^[0-9]{11}$)/
);
const fiveCharactersAlphanumeric = new RegExp('^([a-zA-Z0-9_-]){5}$');

const fiveCharactersAllowed = new RegExp('^\\d{5}$');
const reaValidation = new RegExp('^[A-Za-z]{2}');

const commercialRegisterNumberRegexp = new RegExp('^\\d{11}$');
const numericField = new RegExp('^[0-9]*$');
const currencyField = new RegExp('^(0|[1-9][0-9]*(?:(,[0-9]*)*|[0-9]*))((\\.|,)[0-9]+)*$');

export type StepBillingDataHistoryState = {
  externalInstitutionId: string;
  isTaxCodeEquals2PIVA: boolean;
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
  subProductId?: string;
  selectedParty?: Party;
  selectedProduct?: Product | null;
  outcome?: RequestOutcomeMessage | null;
  aooSelected?: AooData;
  uoSelected?: UoData;
  isCityEditable?: boolean;
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
  subProductId,
  aooSelected,
  uoSelected,
  selectedParty,
  isCityEditable,
}: Props) {
  const { t } = useTranslation();
  const { setRequiredLogin } = useContext(UserContext);

  const [openModifyModal, setOpenModifyModal] = useState<boolean>(false);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [isVatRegistrated, setIsVatRegistrated] = useState<boolean>(false);
  const [previousGeotaxononomies, setPreviousGeotaxononomies] = useState<Array<GeographicTaxonomy>>(
    []
  );
  const [retrievedIstat, setRetrievedIstat] = useState<string>();

  const [stepHistoryState, setStepHistoryState, setStepHistoryStateHistory] =
    useHistoryState<StepBillingDataHistoryState>('onboardingFormData', {
      externalInstitutionId,
      isTaxCodeEquals2PIVA:
        !!initialFormData.vatNumber && initialFormData.taxCode === initialFormData.vatNumber,
    });

  const requiredError = 'Required';

  const institutionAvoidGeotax = ['PT', 'SA', 'AS'].includes(institutionType);

  const premiumFlow = !!subProductId;
  const isPSP = institutionType === 'PSP';
  const isContractingAuthority = institutionType === 'SA';
  const isInsuranceCompany = institutionType === 'AS';
  const isTechPartner = institutionType === 'PT';
  const isInformationCompany =
    institutionType !== 'PA' &&
    institutionType !== 'PSP' &&
    institutionType !== 'PT' &&
    (productId === 'prod-io' || productId === 'prod-io-sign');
  const isProdIoSign = productId === 'prod-io-sign';
  const isProdFideiussioni = productId?.startsWith('prod-fd') ?? false;
  const aooCode = aooSelected?.codiceUniAoo;
  const uoCode = uoSelected?.codiceUniUo;

  const filterByCategory =
    productId === 'prod-pn'
      ? 'L6,L4,L45'
      : institutionType === 'GSP'
      ? 'L37,SAG'
      : 'C17,C16,L10,L19,L13,L2,C10,L20,L21,L22,L15,L1,C13,C5,L40,L11,L39,L46,L8,L34,L7,L35,L45,L47,L6,L12,L24,L28,L42,L36,L44,C8,C3,C7,C14,L16,C11,L33,C12,L43,C2,L38,C1,L5,L4,L31,L18,L17,S01,SA';

  const handleSearchByTaxCode = async (query: string) => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
      {
        method: 'GET',
        params: {
          origin: 'IPA',
          categories: filterByCategory,
        },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setRetrievedIstat((searchResponse as AxiosResponse).data.istatCode);
    }
  };

  const getPreviousGeotaxononomies = async () => {
    const onboardingData = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_PREVIOUS_GEOTAXONOMIES',
      },
      {
        method: 'GET',
        params: {
          taxCode: externalInstitutionId,
          ...(aooSelected ? { subunitCode: aooCode } : uoSelected && { subunitCode: uoCode }),
        },
      },
      () => setRequiredLogin(true)
    );

    const restOutcomeData = getFetchOutcome(onboardingData);
    if (restOutcomeData === 'success') {
      const result = (onboardingData as AxiosResponse).data;
      if (result) {
        setPreviousGeotaxononomies(result);
      }
    }
  };

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
    void getPreviousGeotaxononomies();
  }, []);

  useEffect(() => {
    if (premiumFlow && institutionType === 'PA') {
      void handleSearchByTaxCode(initialFormData.taxCode);
    }
  }, [premiumFlow]);

  useEffect(() => {
    void formik.validateForm();
  }, [stepHistoryState.isTaxCodeEquals2PIVA, isVatRegistrated]);

  const saveHistoryState = () => {
    setStepHistoryState(stepHistoryState);
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

  const [_geotaxonomiesHistory, setGeotaxonomiesHistory, setGeotaxonomiesHistoryState] =
    useHistoryState<Array<GeographicTaxonomy>>('geotaxonomies', []);

  const onBeforeForwardAction = () => {
    if (
      ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY &&
      previousGeotaxononomies &&
      previousGeotaxononomies.length > 0 &&
      !institutionAvoidGeotax
    ) {
      const changedNational2Local =
        previousGeotaxononomies.some((rv) => rv?.code === nationalValue) &&
        !formik.values.geographicTaxonomies.some((gv) => gv?.code === nationalValue);
      const changedToLocal2National =
        !previousGeotaxononomies.some((rv) => rv?.code === nationalValue) &&
        formik.values.geographicTaxonomies.some((gv) => gv?.code === nationalValue);

      if (changedNational2Local || changedToLocal2National) {
        setOpenModifyModal(true);
      } else {
        const deltaLength =
          previousGeotaxononomies.length - formik.values.geographicTaxonomies.length;
        // eslint-disable-next-line functional/no-let
        let array1 = previousGeotaxononomies;
        // eslint-disable-next-line functional/no-let
        let array2 = formik.values.geographicTaxonomies;
        if (deltaLength < 0) {
          array2 = previousGeotaxononomies;
          array1 = formik.values.geographicTaxonomies;
        }
        const arrayDifferences = array1.filter((elementarray1) =>
          array2.some((elementArray2) => elementarray1?.code === elementArray2?.code) ? false : true
        );
        if (deltaLength === 0) {
          if (arrayDifferences.length > 0) {
            // modify element
            setOpenModifyModal(true);
          } else {
            onForwardAction();
          }
        } else if (arrayDifferences.length === Math.abs(deltaLength)) {
          if (deltaLength > 0) {
            // remove element
            setOpenModifyModal(true);
          } else {
            // add element
            setOpenAddModal(true);
          }
        } else if (deltaLength > 0) {
          // modify element
          setOpenModifyModal(true);
        } else if (deltaLength < 0) {
          setOpenModifyModal(true);
        } else {
          onForwardAction();
        }
      }
    } else {
      onForwardAction();
    }
  };

  const handleClose = () => {
    if (openModifyModal) {
      setOpenModifyModal(false);
    } else {
      setOpenAddModal(false);
    }
  };

  const onBackAction = () => {
    saveHistoryState();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
    setGeotaxonomiesHistory([]);
    setGeotaxonomiesHistoryState([]);
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
            : isVatRegistrated
            ? t('onboardingFormData.billingDataSection.vatNumberAlreadyRegistered')
            : undefined,
        city: !premiumFlow && !values.city ? requiredError : undefined,
        county: !premiumFlow && !values.county ? requiredError : undefined,
        ivassCode:
          isInsuranceCompany && !values.ivassCode
            ? requiredError
            : isInsuranceCompany &&
              values.ivassCode &&
              !fiveCharactersAlphanumeric.test(values.ivassCode)
            ? t('onboardingFormData.billingDataSection.invalidIvassCode')
            : undefined,
        digitalAddress: !values.digitalAddress
          ? requiredError
          : !emailRegexp.test(values.digitalAddress)
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
        businessRegisterPlace:
          isContractingAuthority && !values.businessRegisterPlace ? requiredError : undefined,
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
            : isPSP && values.dopEmailAddress && !emailRegexp.test(values.dopEmailAddress)
            ? t('onboardingFormData.billingDataSection.invalidEmail')
            : undefined,
        dpoPecAddress:
          isPSP && !values.dpoPecAddress
            ? requiredError
            : isPSP && values.dpoPecAddress && !emailRegexp.test(values.dpoPecAddress)
            ? t('onboardingFormData.billingDataSection.invalidEmail')
            : undefined,
        recipientCode:
          !isContractingAuthority && !isTechPartner && !isInsuranceCompany && !values.recipientCode
            ? requiredError
            : undefined,
        geographicTaxonomies:
          ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY &&
          !institutionAvoidGeotax &&
          (!values.geographicTaxonomies ||
            values.geographicTaxonomies.length === 0 ||
            values.geographicTaxonomies.some(
              (geoValue) => geoValue?.code === '' || geoValue === null
            ))
            ? requiredError
            : undefined,
        rea:
          isInformationCompany && !values.rea
            ? requiredError
            : !reaValidation.test(values.rea as string)
            ? t('onboardingFormData.billingDataSection.invalidReaField')
            : undefined,
        shareCapital:
          isContractingAuthority && !values.shareCapital
            ? requiredError
            : values.shareCapital && !currencyField.test(values.shareCapital)
            ? t('onboardingFormData.billingDataSection.invalidShareCapitalField')
            : undefined,
        supportEmail:
          !institutionAvoidGeotax && !values.supportEmail && !premiumFlow && isProdIoSign
            ? requiredError
            : !emailRegexp.test(values.supportEmail as string) && values.supportEmail
            ? t('onboardingFormData.billingDataSection.invalidMailSupport')
            : undefined,
      }).filter(([_key, value]) => value)
    );

  const formik = useFormik<OnboardingFormData>({
    initialValues: {
      ...initialFormData,
    },
    validateOnMount: true,
    validate,
    onSubmit: (values) => {
      forward(values);
    },
  });

  const verifyVatNumber = async () => {
    const onboardingStatus = await fetchWithLogs(
      {
        endpoint: 'VERIFY_ONBOARDING',
      },
      {
        method: 'HEAD',
        params: {
          taxCode: institutionType === 'PA' ? externalInstitutionId : formik.values?.taxCode,
          productId,
          verifyType: 'EXTERNAL',
          vatNumber: stepHistoryState.isTaxCodeEquals2PIVA
            ? formik.values.taxCode
            : formik.values.vatNumber,
        },
      },
      () => setRequiredLogin(true)
    );

    const restOutcome = getFetchOutcome(onboardingStatus);

    if (restOutcome === 'success') {
      setIsVatRegistrated(true);
    } else {
      setIsVatRegistrated(false);
    }
  };

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
    } else if (stepHistoryState.isTaxCodeEquals2PIVA && formik.values?.taxCode?.length === 0) {
      void formik.setFieldValue('vatNumber', '');
      setStepHistoryState({
        ...stepHistoryState,
        isTaxCodeEquals2PIVA: false,
      });
    }
  }, [formik.values.taxCode, formik.values.vatNumber]);

  useEffect(() => {
    if (
      (isProdFideiussioni && formik.values.vatNumber.length === 11) ||
      (isProdFideiussioni &&
        stepHistoryState.isTaxCodeEquals2PIVA &&
        formik.values.taxCode.length === 11)
    ) {
      void verifyVatNumber();
    }
  }, [formik.values.vatNumber, stepHistoryState.isTaxCodeEquals2PIVA]);

  const baseTextFieldProps = (
    field: keyof OnboardingFormData,
    label: string,
    fontWeight: number = origin === 'IPA' || premiumFlow ? 400 : 600,
    color: string = origin === 'IPA' || premiumFlow
      ? theme.palette.text.secondary
      : theme.palette.text.primary
  ) => {
    const isError = !!formik.errors[field] && formik.errors[field] !== requiredError;
    return {
      id: field,
      type: 'text',
      value: formik.values[field] || '',
      label,
      error: isError,
      helperText: isError ? formik.errors[field] : undefined,
      required: true,
      variant: 'outlined' as const,
      onChange: formik.handleChange,
      sx: { width: '100%' },
      InputProps: {
        style: {
          fontSize: '18px',
          fontWeight,
          lineHeight: '24px',
          color,
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
      <Grid container item xs={8} display="flex" justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
            {institutionType === 'PSP' && productId === 'prod-pagopa'
              ? t('onboardingFormData.pspAndProdPagoPATitle')
              : institutionType === 'PT'
              ? t('onboardingFormData.billingDataPt.title')
              : t('onboardingFormData.title')}
          </Typography>
        </Grid>
        <Grid container item justifyContent="center" mt={2} mb={4}>
          <Grid item xs={premiumFlow ? 7 : 10}>
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
          premiumFlow={premiumFlow}
          isInformationCompany={isInformationCompany}
          aooSelected={aooSelected}
          uoSelected={uoSelected}
          institutionAvoidGeotax={institutionAvoidGeotax}
          selectedParty={selectedParty}
          retrievedIstat={retrievedIstat}
          isCityEditable={isCityEditable}
        />
        {/* DATI RELATIVI ALLA TASSONOMIA */}
        {ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY && !institutionAvoidGeotax ? (
          <Grid item xs={12} display="flex" justifyContent={'center'}>
            <GeoTaxonomySection
              retrievedTaxonomies={previousGeotaxononomies}
              setGeographicTaxonomies={(geographicTaxonomies) =>
                formik.setFieldValue('geographicTaxonomies', geographicTaxonomies)
              }
              formik={formik}
            />
          </Grid>
        ) : (
          <></>
        )}
        {isPSP && <DpoSection baseTextFieldProps={baseTextFieldProps} />}
        <Grid item xs={12} my={2}>
          <OnboardingStepActions
            back={{
              action: onBackAction,
              label: t('onboardingFormData.backLabel'),
              disabled: false,
            }}
            forward={{
              action: onBeforeForwardAction,
              label: t('onboardingFormData.confirmLabel'),
              disabled: !formik.isValid,
            }}
          />
        </Grid>
      </Grid>

      <GeoTaxSessionModal
        openModifyModal={openModifyModal}
        openAddModal={openAddModal}
        onForwardAction={onForwardAction}
        handleClose={handleClose}
      />
    </Box>
  );
}
