import { Box, Grid, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { AxiosError, AxiosResponse } from 'axios';
import { theme } from '@pagopa/mui-italia';
import { useFormik } from 'formik';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
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
import { GeographicTaxonomy } from '../../model/GeographicTaxonomies';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { UoData } from '../../model/UoModel';
import { ENV } from '../../utils/env';
import { MessageNoAction } from '../MessageNoAction';
import { OnboardingStepActions } from '../OnboardingStepActions';
import DpoSection from '../onboardingFormData/DpoSection';
import PersonalAndBillingDataSection from '../onboardingFormData/PersonalAndBillingDataSection';
import UpdateGeotaxonomy from '../onboardingFormData/taxonomy/UpdateGeotaxonomy';
import GeoTaxonomySection from '../onboardingFormData/taxonomy/GeoTaxonomySection';
import { useHistoryState } from '../useHistoryState';
import { VatNumberErrorModal } from '../onboardingFormData/VatNumberErrorModal';
import { filterByCategory, requiredError } from '../../utils/constants';
import Heading from '../onboardingFormData/Heading';
import { validateFields } from '../../utils/validateFields';
import { handleGeotaxonomies } from '../../utils/handleGeotaxonomies';

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
  subtitle: string | JSX.Element;
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

/* eslint-disable sonarjs/cognitive-complexity */
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

  const [openVatNumberErrorModal, setOpenVatNumberErrorModal] = useState<boolean>(false);
  const [vatVerificationGenericError, setVatVerificationGenericError] = useState<boolean>(false);
  const [isVatRegistrated, setIsVatRegistrated] = useState<boolean>(false);
  const [previousGeotaxononomies, setPreviousGeotaxononomies] = useState<Array<GeographicTaxonomy>>(
    []
  );
  const [retrievedIstat, setRetrievedIstat] = useState<string>();
  const [invalidTaxCodeInvoicing, setInvalidTaxCodeInvoicing] = useState<boolean>(false);

  const [geotaxonomy, updateGeotaxonomy] = useReducer(
    (prev: { add: boolean; edit: boolean }, next: { add: boolean; edit: boolean }) => ({
      ...prev,
      ...next,
    }),
    {
      add: false,
      edit: false,
    }
  );

  const [stepHistoryState, setStepHistoryState, setStepHistoryStateHistory] =
    useHistoryState<StepBillingDataHistoryState>('onboardingFormData', {
      externalInstitutionId,
      isTaxCodeEquals2PIVA:
        !!initialFormData.vatNumber && initialFormData.taxCode === initialFormData.vatNumber,
    });
  const requestIdRef = useRef<string>();

  const institutionAvoidGeotax = ['PT', 'SA', 'AS'].includes(institutionType);

  const isPremium = !!subProductId;
  const isPaymentServiceProvider = institutionType === 'PSP';

  const isInformationCompany =
    origin !== 'IPA' &&
    (institutionType === 'GSP' || institutionType === 'SCP') &&
    (productId === 'prod-io' || productId === 'prod-io-sign' || productId === 'prod-pagopa');
  const isProdFideiussioni = productId?.startsWith('prod-fd') ?? false;
  const canInvoice =
    institutionType !== 'SA' &&
    institutionType !== 'PT' &&
    institutionType !== 'AS' &&
    productId !== 'prod-interop';
  const isForeignInsurance = selectedParty?.registerType?.includes('Elenco II');
  const isDisabled =
    isPremium ||
    (origin === 'IPA' && institutionType !== 'PA' && !isPaymentServiceProvider) ||
    institutionType === 'PA';

  const handleSearchByTaxCode = async (query: string) => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
      {
        method: 'GET',
        params: {
          origin: 'IPA',
          categories: filterByCategory(institutionType, productId),
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
          ...(aooSelected
            ? { subunitCode: aooSelected?.codiceUniAoo }
            : uoSelected && { subunitCode: uoSelected?.codiceUniUo }),
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
    if (isPremium) {
      // eslint-disable-next-line functional/immutable-data
      requestIdRef.current = uniqueId(
        `onboarding-step-manager-${externalInstitutionId}-${productId}-${subProductId}`
      );

      trackEvent('ONBOARDING_PREMIUM_BILLING_DATA', {
        request_id: requestIdRef?.current,
        party_id: externalInstitutionId,
        product_id: productId,
        subproduct_id: subProductId,
      });

      if (institutionType === 'PA' && initialFormData.taxCode) {
        void handleSearchByTaxCode(initialFormData.taxCode);
      }
    }
  }, [isPremium]);

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
        : formik.values.hasVatnumber && !formik.values.isForeignInsurance
        ? formik.values.vatNumber
        : undefined,
      taxCode:
        formik.values.taxCode !== '' && formik.values.taxCode ? formik.values.taxCode : undefined,
    });
  };

  const onBackAction = () => {
    saveHistoryState();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
    setGeotaxonomiesHistory([]);
    setGeotaxonomiesHistoryState([]);
  };

  const [_geotaxonomiesHistory, setGeotaxonomiesHistory, setGeotaxonomiesHistoryState] =
    useHistoryState<Array<GeographicTaxonomy>>('geotaxonomies', []);

  const onBeforeForwardAction = () =>
    handleGeotaxonomies(
      previousGeotaxononomies,
      institutionAvoidGeotax,
      formik,
      updateGeotaxonomy,
      onForwardAction
    );

  const handleClose = () => updateGeotaxonomy({ add: false, edit: false });

  const validate = (values: Partial<OnboardingFormData>) =>
    Object.fromEntries(
      validateFields(
        values,
        t,
        institutionType,
        isVatRegistrated,
        vatVerificationGenericError,
        isPaymentServiceProvider,
        canInvoice,
        isInformationCompany,
        institutionAvoidGeotax,
        isPremium,
        invalidTaxCodeInvoicing,
        productId
      )
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

  useEffect(() => {
    void formik.validateForm();
  }, [
    stepHistoryState.isTaxCodeEquals2PIVA,
    isVatRegistrated,
    vatVerificationGenericError,
    formik.values,
  ]);

  useEffect(() => {
    if (!formik.values.hasVatnumber) {
      void formik.setFieldValue('vatNumber', undefined);
    }
  }, [!formik.values.hasVatnumber]);

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
      setVatVerificationGenericError(false);
      setIsVatRegistrated(true);
    } else if ((onboardingStatus as AxiosError).response?.status === 404) {
      setIsVatRegistrated(false);
      setVatVerificationGenericError(false);
    } else {
      setOpenVatNumberErrorModal(true);
      setVatVerificationGenericError(true);
    }
  };

  useEffect(() => {
    if (
      !stepHistoryState.isTaxCodeEquals2PIVA &&
      formik.values.taxCode === formik.values.vatNumber &&
      formik.values.taxCode &&
      formik.values.taxCode.length > 0
    ) {
      setStepHistoryState({
        ...stepHistoryState,
        isTaxCodeEquals2PIVA: true,
      });
    } else if (stepHistoryState.isTaxCodeEquals2PIVA && formik.values?.taxCode?.length === 0) {
      setStepHistoryState({
        ...stepHistoryState,
        isTaxCodeEquals2PIVA: false,
      });
    }
  }, [formik.values.taxCode, formik.values.vatNumber]);

  useEffect(() => {
    if (
      isProdFideiussioni &&
      ((formik.values.vatNumber && formik.values.vatNumber.length === 11) ||
        (stepHistoryState.isTaxCodeEquals2PIVA &&
          formik.values.taxCode &&
          formik.values.taxCode.length === 11))
    ) {
      void verifyVatNumber();
    }
  }, [formik.values.vatNumber, stepHistoryState.isTaxCodeEquals2PIVA]);

  const baseTextFieldProps = (
    field: keyof OnboardingFormData,
    label: string,
    fontWeight: string | number = isDisabled ? 'fontWeightRegular' : 'fontWeightMedium',
    color: string = isDisabled ? theme.palette.text.secondary : theme.palette.text.primary
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
        <Heading
          t={t}
          institutionType={institutionType}
          productId={productId}
          subtitle={subtitle}
          isPremium={isPremium}
          isPaymentServiceProvider={isPaymentServiceProvider}
        />
        <PersonalAndBillingDataSection
          productId={productId}
          origin={origin}
          institutionType={institutionType}
          baseTextFieldProps={baseTextFieldProps}
          stepHistoryState={stepHistoryState}
          setStepHistoryState={setStepHistoryState}
          formik={formik}
          isDisabled={isDisabled}
          isPremium={isPremium}
          isInformationCompany={isInformationCompany}
          isForeignInsurance={isForeignInsurance}
          aooSelected={aooSelected}
          uoSelected={uoSelected}
          institutionAvoidGeotax={institutionAvoidGeotax}
          selectedParty={selectedParty}
          retrievedIstat={retrievedIstat}
          isCityEditable={isCityEditable}
          canInvoice={canInvoice}
          setInvalidTaxCodeInvoicing={setInvalidTaxCodeInvoicing}
        />

        {ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY && !institutionAvoidGeotax && (
          <Grid item xs={12} display="flex" justifyContent={'center'}>
            <GeoTaxonomySection
              retrievedTaxonomies={previousGeotaxononomies}
              setGeographicTaxonomies={(geographicTaxonomies) =>
                formik.setFieldValue('geographicTaxonomies', geographicTaxonomies)
              }
              formik={formik}
            />
          </Grid>
        )}
        {isPaymentServiceProvider && <DpoSection baseTextFieldProps={baseTextFieldProps} />}
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
        <UpdateGeotaxonomy
          geotaxonomy={geotaxonomy}
          onForwardAction={onForwardAction}
          handleClose={handleClose}
        />
        <VatNumberErrorModal
          openVatNumberErrorModal={openVatNumberErrorModal}
          setOpenVatNumberErrorModal={setOpenVatNumberErrorModal}
        />
      </Grid>
    </Box>
  );
}
