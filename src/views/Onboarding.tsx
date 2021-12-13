import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Stack, Typography, Grid } from '@mui/material';
import { withLogin } from '../components/withLogin';
import { RequestOutcome, RequestOutcomeOptions, StepperStep } from '../../types';
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
// import { InlineSupportLink } from '../components/InlineSupportLink';
import { URL_FE_LANDING } from '../utils/constants';
import { OnboardingStep1_5 } from '../components/OnboardingStep1_5';
import { HeaderContext } from '../lib/context';
import { URL_FE_LOGOUT } from '../utils/constants';
import SessionModal from './../components/SessionModal';

export const unregisterUnloadEvent = (
  setOnLogout: React.Dispatch<React.SetStateAction<(() => void) | null | undefined>>
) => {
  window.removeEventListener('beforeunload', keepOnPage);
  setOnLogout(undefined);
};

const registerUnloadEvent = (
  setOnLogout: React.Dispatch<React.SetStateAction<(() => void) | null | undefined>>,
  setOpenLogoutModal: React.Dispatch<React.SetStateAction<boolean>>
) => {
  window.addEventListener('beforeunload', keepOnPage);
  // react dispatch consider a function input as a metod to be called with the previuos state to caluclate the next state: those we are defining a function that return the next function
  setOnLogout(() => () => setOpenLogoutModal(true));
};

const keepOnPage = (e: BeforeUnloadEvent) => {
  const message =
    "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it.";
  console.log('E', window);
  e.preventDefault();
  // eslint-disable-next-line functional/immutable-data
  e.returnValue = message;
  return message;
};

function OnboardingComponent({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [institutionId, setInstitutionId] = useState<string>('');
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const history = useHistory();
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const { setOnLogout } = useContext(HeaderContext);

  useEffect(() => {
    registerUnloadEvent(setOnLogout, setOpenLogoutModal);
    return () => unregisterUnloadEvent(setOnLogout);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    Object.assign(history.location, { state: undefined });
  }, []);
  const reload = () => {
    history.go(0);
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

  const submit = async () => {
    setLoading(true);

    const postLegalsResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_POST_LEGALS', endpointParams: { institutionId, productId } },
      { method: 'POST', data: (formData as any).users }
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
        OnboardingStep2({ forward: forwardWithData, back: () => setActiveStep(activeStep - 2) }),
    },
    {
      label: 'Inserisci i dati degli amministratori',
      Component: () => OnboardingStep3({ forward: submit, back }),
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
            onClick={() => window.location.assign(URL_FE_LANDING)}
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
              <Button onClick={reload} variant={'contained'}>
                Torna alla home
              </Button>
            </Grid>
          </Grid>
        </Grid>,
      ],
    },
  };

  if (outcome) {
    unregisterUnloadEvent(setOnLogout);
  }
  return !outcome ? (
    <Container>
      <Step />
      <SessionModal
        handleClose={() => setOpenLogoutModal(false)}
        handleExit={() => setOpenLogoutModal(false)}
        onConfirm={() => {
          unregisterUnloadEvent(setOnLogout);
          window.location.assign(URL_FE_LOGOUT);
        }}
        open={openLogoutModal}
        title={'Vuoi davvero uscire?'}
        message={'Se esci, la richiesta di adesione andrà persa.'}
        confirmLabel="Esci"
        rejectLabel="Annulla"
      />
      {loading && <LoadingOverlay loadingText="Stiamo verificando i tuoi dati" />}
    </Container>
  ) : (
    <MessageNoAction {...outcomeContent[outcome]} />
  );
}

export default withLogin(OnboardingComponent);
