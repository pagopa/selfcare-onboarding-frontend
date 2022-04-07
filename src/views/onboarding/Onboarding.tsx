import React, { useEffect, useState, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Stack, Typography, Grid, useTheme } from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import { uniqueId } from 'lodash';
import { ReactComponent as ErrorIcon } from '../../assets/payment_completed_error.svg';
import { withLogin } from '../../components/withLogin';
import {
  BillingData,
  OrganizationType,
  Product,
  RequestOutcome,
  RequestOutcomeOptions,
  StepperStep,
  UserOnCreate,
} from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { OnboardingStep1 } from '../../components/OnboardingStep1';
import { OnboardingStep2 } from '../../components/OnboardingStep2';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { MessageNoAction } from '../../components/MessageNoAction';
import { ReactComponent as CheckIllustration } from '../../assets/check-illustration.svg';
import { ENV } from '../../utils/env';
import { OnboardingStep1_5 } from '../../components/OnboardingStep1_5';
import { HeaderContext, UserContext } from '../../lib/context';
import NoProductPage from '../NoProductPage';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepBillingData from '../../components/steps/StepBillingData';
import { OnBoardingProductStepDelegates } from './components/OnBoardingProductStepDelegates';

export const unregisterUnloadEvent = (
  setOnLogout: React.Dispatch<React.SetStateAction<(() => void) | null | undefined>>
) => {
  window.removeEventListener('beforeunload', keepOnPage);
  setOnLogout(undefined);
};

export const registerUnloadEvent = (
  setOnLogout: React.Dispatch<React.SetStateAction<(() => void) | null | undefined>>,
  setOpenExitModal: React.Dispatch<React.SetStateAction<boolean>>
) => {
  window.addEventListener('beforeunload', keepOnPage);
  // react dispatch consider a function input as a metod to be called with the previuos state to caluclate the next state: those we are defining a function that return the next function
  setOnLogout(() => () => setOpenExitModal(true));
};

const keepOnPage = (e: BeforeUnloadEvent) => {
  const message =
    "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it.";

  e.preventDefault();
  // eslint-disable-next-line functional/immutable-data
  e.returnValue = message;
  return message;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function OnboardingComponent({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [institutionId, setInstitutionId] = useState<string>('');
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const history = useHistory();
  const [openExitModal, setOpenExitModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();
  const [openExitUrl, setOpenExitUrl] = useState(ENV.URL_FE.LOGOUT);
  const [billingData, setBillingData] = useState<BillingData>();
  const [organizationType, setOrganizationType] = useState<OrganizationType>();
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();
  const theme = useTheme();

  useEffect(() => {
    registerUnloadEvent(setOnLogout, setOpenExitModal);
    return () => unregisterUnloadEvent(setOnLogout);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    Object.assign(history.location, { state: undefined });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = uniqueId(`onboarding-${institutionId}-${productId}-`);
    void checkProductId().finally(() => {
      setLoading(false);
    });
  }, [productId]);

  const checkProductId = async () => {
    const onboardingProducts = await fetchWithLogs(
      { endpoint: 'ONBOARDING_VERIFY_PRODUCT', endpointParams: { productId } },
      { method: 'GET' },
      () => setRequiredLogin(true)
    );
    const result = getFetchOutcome(onboardingProducts);

    if (result === 'success') {
      const product = (onboardingProducts as AxiosResponse).data;
      setSelectedProduct(product);
    } else if ((onboardingProducts as AxiosError).response?.status === 404) {
      unregisterUnloadEvent(setOnLogout);
      setSelectedProduct(null);
    } else {
      console.error('Unexpected response', (onboardingProducts as AxiosError).response);
      unregisterUnloadEvent(setOnLogout);
      setSelectedProduct(null);
    }
  };

  const back = () => {
    setActiveStep(activeStep - 1);
  };

  const forward = () => {
    setActiveStep(activeStep + 1);
  };

  const forwardWithData = (newFormData: Partial<FormData>) => {
    setFormData({ ...formData, ...newFormData });
    forward();
  };

  const forwardWithDataAndInstitutionId = (
    newFormData: Partial<FormData>,
    institutionId: string
  ) => {
    setInstitutionId(institutionId);
    forwardWithData(newFormData);
    trackEvent('ONBOARDING_SELEZIONE_ENTE', {
      party_id: institutionId,
      request_id: requestIdRef.current,
      product_id: productId,
    });
  };

  const submit = async (users: Array<UserOnCreate>) => {
    setLoading(true);

    const postLegalsResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_POST_LEGALS', endpointParams: { institutionId, productId } },
      { method: 'POST', data: users },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const outcome = getFetchOutcome(postLegalsResponse);

    setOutcome(outcome);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_SEND_SUCCESS', {
        party_id: institutionId,
        request_id: requestIdRef.current,
        product_id: productId,
      });
    } else if (outcome === 'error') {
      trackEvent('ONBOARDING_SEND_FAILURE', {
        party_id: institutionId,
        request_id: requestIdRef.current,
        product_id: productId,
      });
    }
  };

  const forwardWithOnboardingData = (
    billingData?: BillingData,
    organizationType?: OrganizationType
  ) => {
    setBillingData(billingData);
    setOrganizationType(organizationType);
    forward();
  };

  const steps: Array<StepperStep> = [
    {
      label: t('onboarding.steps.selectPartyLabel'),
      Component: () =>
        OnboardingStep1({
          product: selectedProduct,
          forward: forwardWithDataAndInstitutionId,
          back,
        }),
    },
    {
      label: t('onboarding.steps.verifyPartyLabel'),
      Component: () =>
        OnboardingStep1_5({ product: selectedProduct, forward, institutionId, productId }),
    },
    {
      label: 'Get Onboarding Data',
      Component: () =>
        StepOnboardingData({
          institutionId,
          productId,
          forward: forwardWithOnboardingData,
        }),
    },
    // TODO insert StepOrganizationType
    {
      label: 'Insert Billing Data',
      Component: () =>
        StepBillingData({
          institutionId,
          initialFormData: billingData ?? {
            businessName: '',
            registeredOffice: '',
            mailPEC: '',
            taxCode: '',
            vatNumber: '',
            recipientCode: '',
            publicServices: organizationType === 'GSP' ? false : undefined,
          },
          organizationType: organizationType as OrganizationType,
          subtitle: t('onBoardingSubProduct.billingData.subTitle'),
          forward: () => {
            trackEvent('ONBOARDING_DATI_FATTURAZIONE', {
              party_id: institutionId,
              request_id: requestIdRef.current,
            });
            forward();
          },
          back: () => {
            if (window.location.search.indexOf(`institutionId=${institutionId}`) > -1) {
              setOpenExitUrl(`${ENV.URL_FE.DASHBOARD}/${institutionId}`);
              setOpenExitModal(true);
            } else {
              setActiveStep(0);
            }
          },
        }),
    },
    {
      label: t('onboarding.steps.insertlegalLabel'),
      Component: () =>
        OnboardingStep2({
          product: selectedProduct,
          forward: (newFormData: Partial<FormData>) => {
            trackEvent('ONBOARDING_LEGALE_RAPPRESENTANTE', {
              party_id: institutionId,
              request_id: requestIdRef.current,
            });
            forwardWithData(newFormData);
          },
          back,
        }),
    },
    {
      label: t('onboarding.steps.insertAdministratorLabel'),
      Component: () =>
        OnBoardingProductStepDelegates({
          product: selectedProduct,
          legal: (formData as any).users[0],
          forward: (newFormData: Partial<FormData>) => {
            setFormData({ ...formData, ...newFormData });
            trackEvent('ONBOARDING_REFERENTE_AMMINISTRATIVO', {
              party_id: institutionId,
              request_id: requestIdRef.current,
              product_id: productId,
            });
            submit((newFormData as any).users).catch(() => {
              trackEvent('ONBOARDING_REFERENTE_AMMINISTRATIVO', {
                party_id: institutionId,
                request_id: requestIdRef.current,
                product_id: productId,
              });
            });
          },
          back,
        }),
    },
  ];

  const Step = steps[activeStep].Component;

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      ImgComponent: CheckIllustration,
      title: '',
      description: [
        <>
          <Typography variant={'h4'} sx={{ color: theme.palette.text.primary, marginBottom: 1 }}>
            <Trans i18nKey="onboarding.outcomeContent.success.title">
              La tua richiesta è stata inviata
              <br />
              con successo
            </Trans>
          </Typography>
          <Stack key="0" spacing={4}>
            <Typography variant="body1">
              <Trans i18nKey="onboarding.outcomeContent.success.description">
                Riceverai una PEC all’indirizzo istituzionale dell’Ente.
                <br />
                Al suo interno troverai le istruzioni per completare l&apos;adesione.
              </Trans>
            </Typography>
            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            >
              {t('onboarding.outcomeContent.success.backActionLabel')}
            </Button>
          </Stack>
        </>,
      ],
    },
    error: {
      ImgComponent: ErrorIcon,
      title: '',
      description: [
        <Grid container direction="column" key="0">
          <Grid container item justifyContent="center">
            <Grid item xs={5}>
              <Typography variant="h4">{t('onboarding.outcomeContent.error.title')}</Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center" mb={3} mt={1}>
            <Grid item xs={5}>
              <Typography>
                <Trans i18nKey="onboarding.outcomeContent.error.description">
                  A causa di un errore del sistema non è possibile completare la procedura.
                  <br />
                  Ti chiediamo di riprovare più tardi.
                </Trans>
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center">
            <Grid item xs={4}>
              <Button
                onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
                variant={'contained'}
              >
                <Typography width="100%" sx={{ color: theme.palette.primary.contrastText }}>
                  {t('onboarding.outcomeContent.error.backActionLabel')}
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Grid>,
      ],
    },
  };

  useEffect(() => {
    if (outcome) {
      unregisterUnloadEvent(setOnLogout);
    }
  }, [outcome]);

  const handleCloseExitModal = () => {
    setOpenExitModal(false);
    setOpenExitUrl(ENV.URL_FE.LOGOUT);
  };

  return selectedProduct === null ? (
    <NoProductPage />
  ) : !outcome ? (
    <Container>
      <Step />
      <SessionModal
        handleClose={handleCloseExitModal}
        handleExit={handleCloseExitModal}
        onConfirm={() => {
          unregisterUnloadEvent(setOnLogout);
          window.location.assign(openExitUrl);
        }}
        open={openExitModal}
        title={t('onboarding.sessionModal.title')}
        message={t('onboarding.sessionModal.message')}
        onConfirmLabel={t('onboarding.sessionModal.onConfirmLabel')}
        onCloseLabel={t('onboarding.sessionModal.onCloseLabel')}
      />
      {loading && <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />}
    </Container>
  ) : (
    <MessageNoAction {...outcomeContent[outcome]} />
  );
}

export default withLogin(OnboardingComponent);
