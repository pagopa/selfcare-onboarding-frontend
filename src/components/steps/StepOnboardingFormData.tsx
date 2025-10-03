import { Alert, Box, Grid, Link, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { AxiosError, AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import {
  DataProtectionOfficerDto,
  InstitutionType,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { getFetchOutcome } from '../../lib/error-utils';
import { AooData } from '../../model/AooData';
import { GeographicTaxonomy, GeographicTaxonomyResource } from '../../model/GeographicTaxonomies';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { UoData } from '../../model/UoModel';
import { MessageNoAction } from '../MessageNoAction';
import { OnboardingStepActions } from '../OnboardingStepActions';
import DpoSection from '../onboardingFormData/DpoSection';
import PersonalAndBillingDataSection from '../onboardingFormData/PersonalAndBillingDataSection';
import UpdateGeotaxonomy from '../onboardingFormData/taxonomy/UpdateGeotaxonomy';
import GeoTaxonomySection from '../onboardingFormData/taxonomy/GeoTaxonomySection';
import { useHistoryState } from '../useHistoryState';
import { VatNumberErrorModal } from '../onboardingFormData/VatNumberErrorModal';
import { canInvoice, PRODUCT_IDS, requiredError } from '../../utils/constants';
import Heading from '../onboardingFormData/Heading';
import { validateFields } from '../../utils/validateFields';
import { handleGeotaxonomies } from '../../utils/handleGeotaxonomies';
import { ENV } from '../../utils/env';
import { InstitutionLocationData } from '../../model/InstitutionLocationData';
import { formatCity } from '../../utils/formatting-utils';
import IbanSection from '../onboardingFormData/IbanSection';

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
  originId?: string;
  productId?: string;
  subProductId?: string;
  onboardingFormData?: OnboardingFormData;
  selectedProduct?: Product | null;
  outcome?: RequestOutcomeMessage | null;
  aooSelected?: AooData;
  uoSelected?: UoData;
  isCityEditable?: boolean;
  selectFilterCategories?: () => any;
};

// eslint-disable-next-line complexity
export default function StepOnboardingFormData({
  initialFormData,
  back,
  forward,
  subtitle,
  institutionType,
  externalInstitutionId,
  origin,
  originId,
  outcome,
  productId,
  subProductId,
  aooSelected,
  uoSelected,
  onboardingFormData,
  isCityEditable,
  selectFilterCategories,
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
  const [recipientCodeStatus, setRecipientCodeStatus] = useState<string>();
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
  const [filterCategories, setFilterCategories] = useState<string>();
  const institutionAvoidGeotax = ['PT', 'SA', 'AS'].includes(institutionType);

  const isPremium = !!subProductId;
  const isPaymentServiceProvider = institutionType === 'PSP';
  const isPdndPrivate = institutionType === 'PRV' && productId === PRODUCT_IDS.INTEROP;
  const isPrivateMerchant = institutionType === 'PRV' && productId === PRODUCT_IDS.IDPAY_MERCHANT;
  const isInformationCompany =
    origin !== 'IPA' &&
    institutionType !== 'PRV' &&
    (institutionType === 'GSP' || institutionType === 'SCP') &&
    (productId === PRODUCT_IDS.IO ||
      productId === PRODUCT_IDS.IO_SIGN ||
      productId === PRODUCT_IDS.PAGOPA ||
      productId === PRODUCT_IDS.INTEROP);
  const isProdFideiussioni = productId?.startsWith(PRODUCT_IDS.FD) ?? false;
  const isInvoiceable = canInvoice(institutionType, productId);
  const isForeignInsurance = onboardingFormData?.registerType?.includes('Elenco II');
  const isDisabled =
    isPremium ||
    (origin === 'IPA' && institutionType !== 'PA' && !isPaymentServiceProvider) ||
    institutionType === 'PA';
  const [originId4Premium, setOriginId4Premium] = useState<string>();
  const [dpoData, setDpoData] = useState<DataProtectionOfficerDto>();
  const [countries, setCountries] = useState<Array<InstitutionLocationData>>();

  const handleSearchByTaxCode = async (query: string) => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
      {
        method: 'GET',
        params: {
          origin: 'IPA',
          categories: filterCategories,
        },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setRetrievedIstat((searchResponse as AxiosResponse).data.istatCode);
      setOriginId4Premium((searchResponse as AxiosResponse).data.originId);
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
    if (!isPremium) {
      void getPreviousGeotaxononomies();
    } else {
      setPreviousGeotaxononomies(initialFormData.geographicTaxonomies);
    }
  }, []);

  useEffect(() => {
    if (dpoData) {
      void formik.setFieldValue('address', dpoData.address === 'N/A' ? '' : dpoData.address);
      void formik.setFieldValue('email', dpoData.email);
      void formik.setFieldValue('pec', dpoData.pec);
    }
  }, [dpoData]);

  useEffect(() => {
    if (isPremium) {
      setDpoData({
        address: formik.values.address,
        email: formik.values.email,
        pec: formik.values.pec,
      });
    }
  }, [isPremium]);

  const handlePremiumBillingData = async () => {
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
      try {
        await handleSearchByTaxCode(initialFormData.taxCode);
        if (
          originId4Premium &&
          formik.values.recipientCode &&
          formik.values.recipientCode.length >= 6
        ) {
          await verifyRecipientCodeIsValid(formik.values.recipientCode, originId4Premium);
        }
      } catch (error) {
        console.error('Error during premium billing data processing:', error);
      }
    }
  };

  useEffect(() => {
    if (selectFilterCategories) {
      setFilterCategories(selectFilterCategories());
    }
  }, []);

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
      originId,
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
        isInvoiceable,
        uoSelected,
        isInformationCompany,
        institutionAvoidGeotax,
        isPremium,
        invalidTaxCodeInvoicing,
        isPdndPrivate,
        isPrivateMerchant,
        recipientCodeStatus,
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
    invalidTaxCodeInvoicing,
    recipientCodeStatus,
    isPremium,
  ]);

  useEffect(() => {
    if (isPremium) {
      void handlePremiumBillingData();
    }
  }, [originId4Premium, formik.values.recipientCode]);

  useEffect(() => {
    if (formik.values.hasVatnumber) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formik.setFieldValue('vatNumber', formik.initialValues.vatNumber);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formik.setFieldValue('vatNumber', undefined);
    }
  }, [formik.values.hasVatnumber]);

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

  const getCountriesFromGeotaxonomies = async (
    query: string,
    setCountries: Dispatch<SetStateAction<Array<InstitutionLocationData> | undefined>>
  ) => {
    const searchGeotaxonomy = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_GEOTAXONOMY',
      },
      {
        method: 'GET',
        params: { description: query },
      },
      () => setRequiredLogin(true)
    );
    const outcome = getFetchOutcome(searchGeotaxonomy);

    if (outcome === 'success') {
      const geographicTaxonomies = (searchGeotaxonomy as AxiosResponse).data;

      const mappedResponse = geographicTaxonomies.map((gt: GeographicTaxonomyResource) => ({
        code: gt.code,
        country: gt.country_abbreviation,
        county: gt.province_abbreviation,
        city: gt.desc,
        istat_code: gt.istat_code,
      })) as Array<InstitutionLocationData>;

      const onlyCountries = mappedResponse
        .filter((r) => r.city.includes('- COMUNE'))
        .map((r) => ({
          ...r,
          city: formatCity(r.city),
        }));

      setCountries(onlyCountries);
    }
  };

  const verifyRecipientCodeIsValid = async (recipientCode: string, originId?: string) => {
    const getRecipientCodeValidation = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_RECIPIENT_CODE_VALIDATION',
      },
      {
        method: 'GET',
        params: {
          recipientCode,
          originId,
        },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(getRecipientCodeValidation);

    if (outcome === 'success') {
      const result = (getRecipientCodeValidation as AxiosResponse).data;
      if (uoSelected && result && result === 'DENIED_NO_BILLING') {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        formik.setFieldValue('recipientCode', undefined);
      }
      setRecipientCodeStatus(result);
    } else {
      setRecipientCodeStatus('DENIED_NO_ASSOCIATION');
    }
  };

  useEffect(() => {
    if (
      !stepHistoryState.isTaxCodeEquals2PIVA &&
      formik.values.taxCode === formik.values.vatNumber &&
      formik.values.taxCode &&
      formik.values.taxCode.length > 0 &&
      !isPrivateMerchant
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

  useEffect(() => {
    if (
      (institutionType === 'PA' || aooSelected || uoSelected) &&
      !isPremium &&
      formik.values.recipientCode &&
      formik.values.recipientCode.length >= 6
    ) {
      void verifyRecipientCodeIsValid(formik.values.recipientCode, onboardingFormData?.originIdEc);
    }
  }, [formik.values.recipientCode]);

  useEffect(() => {
    if (formik.values.city && origin !== 'IPA') {
      void getCountriesFromGeotaxonomies(formik.values.city, setCountries);
    }
  }, []);

  useEffect(() => {
    if (countries && countries.length > 0 && origin !== 'IPA' && !formik.values.istatCode) {
      void formik.setFieldValue('istatCode', countries[0].istat_code);
    }
  }, [countries]);

  const baseTextFieldProps = (
    field: keyof OnboardingFormData,
    label: string,
    color: string,
    fontWeight: string | number = isDisabled ? 'fontWeightRegular' : 'fontWeightMedium'
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
          fontSize: '16px',
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
        <Heading subtitle={subtitle} />
        {subProductId === PRODUCT_IDS.DASHBOARD_PSP && (
          <Grid item xs={12} display="flex" justifyContent="center" mb={5}>
            <Alert severity="warning" variant="standard" sx={{ width: '65%' }}>
              <Trans
                i18nKey="onboardingFormData.pspDashboardWarning"
                components={{
                  1: <Link color={'inherit'} href={ENV.URL_FE.ASSISTANCE} />,
                }}
              >
                {`Per aggiornare i dati presenti, contatta il servizio di <1>Assistenza</1>.`}
              </Trans>
            </Alert>
          </Grid>
        )}

        <PersonalAndBillingDataSection
          productId={productId}
          origin={origin}
          institutionType={institutionType}
          onboardingFormData={onboardingFormData}
          baseTextFieldProps={baseTextFieldProps}
          stepHistoryState={stepHistoryState}
          setStepHistoryState={setStepHistoryState}
          formik={formik}
          isDisabled={isDisabled}
          isPremium={isPremium}
          isInformationCompany={isInformationCompany}
          isForeignInsurance={isForeignInsurance}
          institutionAvoidGeotax={institutionAvoidGeotax}
          retrievedIstat={retrievedIstat}
          isCityEditable={isCityEditable}
          isInvoiceable={isInvoiceable}
          isPdndPrivate={isPdndPrivate}
          isPrivateMerchant={isPrivateMerchant}
          setInvalidTaxCodeInvoicing={setInvalidTaxCodeInvoicing}
          recipientCodeStatus={recipientCodeStatus}
          getCountriesFromGeotaxonomies={getCountriesFromGeotaxonomies}
          countries={countries}
          setCountries={setCountries}
        />
        {isPrivateMerchant && (
          <IbanSection baseTextFieldProps={baseTextFieldProps} formik={formik} />
        )}
        {!institutionAvoidGeotax && subProductId !== PRODUCT_IDS.DASHBOARD_PSP && (
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
        {isPaymentServiceProvider && (
          <Grid item xs={12} display="flex" justifyContent={'center'}>
            <DpoSection baseTextFieldProps={baseTextFieldProps} dpoData={formik.values} />
          </Grid>
        )}
        <Grid item xs={12} mb={2}>
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
