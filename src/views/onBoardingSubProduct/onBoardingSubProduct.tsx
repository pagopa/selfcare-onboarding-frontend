import React, { useEffect, useState, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Stack, Typography, Grid, useTheme } from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { ReactComponent as ErrorIcon } from '../assets/payment_completed_error.svg';
import { withLogin } from '../../components/withLogin';
import {
  Product,
  RequestOutcome,
  RequestOutcomeOptions,
  StepperStep,
  UserOnCreate,
} from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { OnboardingStep0 } from '../../components/OnboardingStep0';
import { OnboardingStep1 } from '../../components/OnboardingStep1';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { MessageNoAction } from '../../components/MessageNoAction';
import { ReactComponent as CheckIllustration } from '../assets/check-illustration.svg';
import { ENV } from '../../utils/env';
import { OnboardingStep1_5 } from '../../components/OnboardingStep1_5';
import { HeaderContext, UserContext } from '../../lib/context';
import NoProductPage from './../NoProductPage';

export const unregisterUnloadEvent = (
  setOnLogout: React.Dispatch<React.SetStateAction<(() => void) | null | undefined>>
) => {
  window.removeEventListener('beforeunload', keepOnPage);
  setOnLogout(undefined);
};

const registerUnloadEvent = (
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
function OnBoardingSubProduct() {
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  const [productId, setProductId] = useState<Partial<FormData>>();
  const [subProductId, setSubProductId] = useState<Partial<FormData>>();
  const [institutionId, setInstitutionId] = useState<string>('');
  const [outcome, setOutcome] = useState<RequestOutcome>();

  const history = useHistory();

  const [openExitModal, setOpenExitModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();
  const [openExitUrl, setOpenExitUrl] = useState(ENV.URL_FE.LOGOUT);
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const requestIdRef = useRef<string>();
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

  const forwardWithProductId = (newFormData: Partial<FormData>) => {
    setProductId({ ...productId, ...newFormData });
    forward();
  };

  const forwardWithSubProductId = (newFormData: Partial<FormData>) => {
    setSubProductId({ ...subProductId, ...newFormData });
    forward();
  };

  const forwardWithProductIdAndInstitutionId = (
    newFormData: Partial<FormData>,
    institutionId: string
  ) => {
    setInstitutionId(institutionId);
    forwardWithProductId(newFormData);
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
        subproduct_id: subProductId,
      });
    } else if (outcome === 'error') {
      trackEvent('ONBOARDING_SEND_FAILURE', {
        party_id: institutionId,
        request_id: requestIdRef.current,
        product_id: productId,
        subproduct_id: subProductId,
      });
    }
  };

  const steps: Array<StepperStep> = [
    {
      label: t('onboarding.steps.privacyLabel'),
      Component: () => OnboardingStep0({ product: selectedProduct, forward }),
    },

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
  ];

  const Step = steps[activeStep].Component;

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      ImgComponent: CheckIllustration,
      title: '',
      description: [
        <>
          <Typography variant={'h4'} sx={{ color: theme.palette.text.primary, marginBottom: 1 }}>
            La tua richiesta è stata inviata
            <br />
            con successo
          </Typography>
          <Stack key="0" spacing={4}>
            <Typography variant="body1">
              Riceverai una PEC all’indirizzo istituzionale dell’Ente.
              <br />
              Al suo interno troverai le istruzioni per completare l&apos;adesione.
            </Typography>
            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            >
              Chiudi
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
              <Typography variant="h4">Richiesta di adesione premium in errore</Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center" mb={3} mt={1}>
            <Grid item xs={5}>
              <Typography>
                A causa di un errore del sistema non è possibile completare la procedura.
                <br />
                Ti chiediamo di riprovare più tardi.
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
                  Torna alla home
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
        title="Vuoi davvero uscire?"
        message="Se esci, la richiesta di adesione andrà persa."
        onConfirmLabel="Esci"
        onCloseLabel="Annulla"
      />
      {loading && <LoadingOverlay loadingText="Caricamento" />}
    </Container>
  ) : (
    <MessageNoAction {...outcomeContent[outcome]} />
  );
}

export default withLogin(OnBoardingSubProduct);
