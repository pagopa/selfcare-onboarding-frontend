import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Stack, Typography, Grid } from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import { withLogin } from '../components/withLogin';
import {
  Product,
  RequestOutcome,
  RequestOutcomeOptions,
  StepperStep,
  UserOnCreate,
} from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { OnboardingStep0 } from '../components/OnboardingStep0';
import { OnboardingStep1 } from '../components/OnboardingStep1';
import { OnboardingStep2 } from '../components/OnboardingStep2';
import { OnboardingStep3 } from '../components/OnboardingStep3';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { MessageNoAction } from '../components/MessageNoAction';
import { ReactComponent as CheckIllustration } from '../assets/check-illustration.svg';
import { ReactComponent as ErrorIllustration } from '../assets/error-illustration.svg';
import { ENV } from '../utils/env';
import { OnboardingStep1_5 } from '../components/OnboardingStep1_5';
import { HeaderContext, UserContext } from '../lib/context';
import SessionModal from './../components/SessionModal';
import NoProductPage from './NoProductPage';

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

function OnboardingComponent({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [institutionId, setInstitutionId] = useState<string>('');
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const history = useHistory();
  const [openExitModal, setOpenExitModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();
  const [openExitUrl, setOpenExitUrl] = useState(ENV.URL_FE.LOGOUT);
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  useEffect(() => {
    registerUnloadEvent(setOnLogout, setOpenExitModal);
    return () => unregisterUnloadEvent(setOnLogout);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    Object.assign(history.location, { state: undefined });
  }, []);

  useEffect(() => {
    void checkProductId().finally(() => {
      setLoading(false);
    });

    // eslint-disable-next-line functional/immutable-data
  }, [productId]);

  const checkProductId = async () => {
    const onboardingProducts = await fetchWithLogs(
      { endpoint: 'ONBOARDING_VERIFY_PRODUCT', endpointParams: { productId } },
      { method: 'HEAD' }
    );
    const result = getFetchOutcome(onboardingProducts);
    if (result === 'success') {
      const product = (onboardingProducts as AxiosResponse).data;
      setSelectedProduct(product);
    } else if ((onboardingProducts as AxiosError).response?.status === 404) {
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
  };

  const steps: Array<StepperStep> = [
    {
      label: 'Accetta privacy',
      Component: () => OnboardingStep0({ forward }),
    },

    {
      label: "Seleziona l'ente",
      Component: () => OnboardingStep1({ forward: forwardWithDataAndInstitutionId, back }),
    },
    {
      label: 'Verifica ente',
      Component: () => OnboardingStep1_5({ forward, institutionId, productId }),
    },
    {
      label: 'Inserisci i dati del rappresentante legale',
      Component: () =>
        OnboardingStep2({
          forward: forwardWithData,
          back: () => {
            if (window.location.search.indexOf(`institutionId=${institutionId}`) > -1) {
              setOpenExitUrl(`${ENV.URL_FE.DASHBOARD}/${institutionId}`);
              setOpenExitModal(true);
            } else {
              setActiveStep(activeStep - 2);
            }
          },
        }),
    },
    {
      label: 'Inserisci i dati degli amministratori',
      Component: () =>
        OnboardingStep3({
          legal: (formData as any).users[0],
          forward: (newFormData: Partial<FormData>) => {
            setFormData({ ...formData, ...newFormData });
            void submit((newFormData as any).users);
          },
          back,
        }),
    },
  ];

  const Step = steps[activeStep].Component;

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      ImgComponent: CheckIllustration,
      title: 'La tua richiesta è stata inviata con successo',
      description: [
        <Stack key="0" spacing={10}>
          <Typography>
            Riceverai una PEC all’indirizzo istituzionale dell’Ente.
            <br />
            Al suo interno troverai le istruzioni per completare l&apos;adesione.
          </Typography>
          <Button
            variant="contained"
            sx={{ width: '200px', alignSelf: 'center' }}
            onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
          >
            Torna alla home
          </Button>
          {/* <Typography>
            Non hai ricevuto nessuna mail? Attendi qualche minuto e controlla anche nello spam. Se
            non arriva, <InlineSupportLink />
          </Typography> */}
        </Stack>,
      ],
    },
    error: {
      ImgComponent: ErrorIllustration,
      title: '',
      description: [
        <Grid container direction="column" key="0">
          <Grid container item justifyContent="center">
            <Grid item xs={5}>
              <Typography variant="h2">Spiacenti, qualcosa è andato storto.</Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center" mb={7} mt={1}>
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
                Torna alla home
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
        title={'Vuoi davvero uscire?'}
        message={'Se esci, la richiesta di adesione andrà persa.'}
        onConfirmLabel="Esci"
        onCloseLabel="Annulla"
      />
      {loading && <LoadingOverlay loadingText="Stiamo verificando i tuoi dati" />}
    </Container>
  ) : (
    <MessageNoAction {...outcomeContent[outcome]} />
  );
}

export default withLogin(OnboardingComponent);
