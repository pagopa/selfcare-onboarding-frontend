/* eslint-disable functional/immutable-data */
import { Alert, Box, Grid, Link, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { useFormik } from 'formik';
import { uniqueId } from 'lodash';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  DataProtectionOfficerDto,
  InstitutionType,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../types';
import { useOnboardingControllers } from '../../hooks/useOnboardingControllers';
import { UserContext } from '../../lib/context';

import { AooData } from '../../model/AooData';
import { GeographicTaxonomy } from '../../model/GeographicTaxonomies';
import { InstitutionLocationData } from '../../model/InstitutionLocationData';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { UoData } from '../../model/UoModel';
import { verifyRecipientCodeIsValid } from '../../services/billingDataServices';
import {
  getCountriesFromGeotaxonomies,
  getPreviousGeotaxononomies,
} from '../../services/geoTaxonomyServices';
import { handleSearchByTaxCode } from '../../services/institutionServices';
import { verifyVatNumber } from '../../services/validationServices';
import { PRODUCT_IDS, requiredError } from '../../utils/constants';
import { ENV } from '../../utils/env';
import { handleGeotaxonomies } from '../../utils/handleGeotaxonomies';
import { validateFields } from '../../utils/validateFields';
import { MessageNoAction } from '../shared/MessageNoAction';
import { OnboardingStepActions } from '../registrationSteps/OnboardingStepActions';
import DpoSection from '../onboardingFormData/DpoSection';
import Heading from '../onboardingFormData/Heading';
import IbanSection from '../onboardingFormData/IbanSection';
import PersonalAndBillingDataSection from '../onboardingFormData/PersonalAndBillingDataSection';
import { VatNumberErrorModal } from '../onboardingFormData/VatNumberErrorModal';
import GeoTaxonomySection from '../onboardingFormData/taxonomy/GeoTaxonomySection';
import UpdateGeotaxonomy from '../onboardingFormData/taxonomy/UpdateGeotaxonomy';
import { useHistoryState } from '../../hooks/useHistoryState';

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
  const requestIdRef = useRef<string>();
  const [filterCategories, setFilterCategories] = useState<string>();
  const institutionAvoidGeotax = ['PT', 'SA', 'AS'].includes(institutionType);
  const [originId4Premium, setOriginId4Premium] = useState<string>();
  const [dpoData, setDpoData] = useState<DataProtectionOfficerDto>();
  const [countries, setCountries] = useState<Array<InstitutionLocationData>>();
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

  const controllers = useOnboardingControllers({
    subProductId,
    institutionType,
    productId,
    origin,
    onboardingFormData,
    isCityEditable,
    isVatRegistrated,
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
    const loadGeotaxonomies = async () => {
      if (!externalInstitutionId || externalInstitutionId === '') {
        console.warn('StepOnboardingFormData: externalInstitutionId not set, using fallback');
        setPreviousGeotaxononomies(initialFormData.geographicTaxonomies || []);
        return;
      }

      if (!controllers.isPremium) {
        try {
          await getPreviousGeotaxononomies(
            externalInstitutionId,
            aooSelected,
            uoSelected,
            setPreviousGeotaxononomies,
            setRequiredLogin
          );
        } catch (error) {
          console.error('Failed to load geotaxonomies:', error);
          setPreviousGeotaxononomies([]);
        }
      } else {
        setPreviousGeotaxononomies(initialFormData.geographicTaxonomies);
      }
    };

    void loadGeotaxonomies();
  }, []);

  useEffect(() => {
    if (dpoData) {
      void formik.setFieldValue('address', dpoData.address === 'N/A' ? '' : dpoData.address);
      void formik.setFieldValue('email', dpoData.email);
      void formik.setFieldValue('pec', dpoData.pec);
    }
  }, [dpoData]);

  useEffect(() => {
    if (controllers.isPremium) {
      setDpoData({
        address: formik.values.address,
        email: formik.values.email,
        pec: formik.values.pec,
      });
    }
  }, [controllers.isPremium]);

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
        await handleSearchByTaxCode(
          initialFormData.taxCode,
          filterCategories,
          setRequiredLogin,
          setRetrievedIstat,
          setOriginId4Premium
        );
        if (
          originId4Premium &&
          formik.values.recipientCode &&
          formik.values.recipientCode.length >= 6
        ) {
          await verifyRecipientCodeIsValid(
            formik.values.recipientCode,
            uoSelected,
            formik,
            setRecipientCodeStatus,
            setRequiredLogin,
            originId4Premium
          );
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
        controllers.isPaymentServiceProvider,
        controllers.isInvoiceable,
        uoSelected,
        controllers.isInformationCompany,
        institutionAvoidGeotax,
        controllers.isPremium,
        invalidTaxCodeInvoicing,
        controllers.isPdndPrivate,
        controllers.isPrivateMerchant,
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
    controllers.isPremium,
  ]);

  useEffect(() => {
    if (controllers.isPremium) {
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

  useEffect(() => {
    if (
      !stepHistoryState.isTaxCodeEquals2PIVA &&
      formik.values.taxCode === formik.values.vatNumber &&
      formik.values.taxCode &&
      formik.values.taxCode.length > 0 &&
      !controllers.isPrivateMerchant
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
      controllers.isProdFideiussioni &&
      ((formik.values.vatNumber && formik.values.vatNumber.length === 11) ||
        (stepHistoryState.isTaxCodeEquals2PIVA &&
          formik.values.taxCode &&
          formik.values.taxCode.length === 11))
    ) {
      void verifyVatNumber(
        institutionType,
        externalInstitutionId,
        formik,
        stepHistoryState,
        setVatVerificationGenericError,
        setIsVatRegistrated,
        setOpenVatNumberErrorModal,
        setRequiredLogin,
        productId
      );
    }
  }, [formik.values.vatNumber, stepHistoryState.isTaxCodeEquals2PIVA]);

  useEffect(() => {
    if (
      (institutionType === 'PA' || aooSelected || uoSelected) &&
      !controllers.isPremium &&
      formik.values.recipientCode &&
      formik.values.recipientCode.length >= 6
    ) {
      void verifyRecipientCodeIsValid(
        formik.values.recipientCode,
        uoSelected,
        formik,
        setRecipientCodeStatus,
        setRequiredLogin,
        onboardingFormData?.originIdEc
      );
    }
  }, [formik.values.recipientCode]);

  useEffect(() => {
    if (formik.values.city && !formik.values.country && origin !== 'IPA') {
      const loadCountryForCity = async () => {
        try {
          await getCountriesFromGeotaxonomies(
            formik.values.city ?? '',
            setCountries,
            setRequiredLogin
          );
        } catch (error) {
          console.error('Failed to load country for city:', error);
        }
      };
      void loadCountryForCity();
    }
  }, [formik.values.city]);

  useEffect(() => {
    if (countries && countries.length > 0 && origin !== 'IPA') {
      if (!formik.values.istatCode) {
        void formik.setFieldValue('istatCode', countries[0].istat_code);
      }
      if (!formik.values.country) {
        void formik.setFieldValue('country', countries[0].country);
      }
    }
  }, [countries]);

  const baseTextFieldProps = (
    field: keyof OnboardingFormData,
    label: string,
    color: string,
    fontWeight: string | number = controllers.isDisabled ? 'fontWeightRegular' : 'fontWeightMedium'
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
          institutionType={institutionType}
          onboardingFormData={onboardingFormData}
          baseTextFieldProps={baseTextFieldProps}
          stepHistoryState={stepHistoryState}
          setStepHistoryState={setStepHistoryState}
          formik={formik}
          institutionAvoidGeotax={institutionAvoidGeotax}
          retrievedIstat={retrievedIstat}
          controllers={controllers}
          setInvalidTaxCodeInvoicing={setInvalidTaxCodeInvoicing}
          recipientCodeStatus={recipientCodeStatus}
          countries={countries}
          setCountries={setCountries}
        />
        {controllers.isPrivateMerchant && (
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
        {controllers.isPaymentServiceProvider && (
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
