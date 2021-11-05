import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
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
import checkIllustration from '../assets/check-illustration.svg';
import redXIllustration from '../assets/red-x-illustration.svg';
import { InlineSupportLink } from '../components/InlineSupportLink';
import { URL_FE_LANDING } from '../lib/constants';

const keepOnPage= (e: BeforeUnloadEvent) => {
  const message = 'Warning!\n\nNavigating away from this page will delete your text if you haven\'t already saved it.';
  console.log("E",window);
  e.preventDefault();
    // eslint-disable-next-line functional/immutable-data
    e.returnValue = message;
    return message;
  };

function OnboardingComponent() {
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [_legalEmail, setLegalEmail] = useState('');
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const history = useHistory();
 
  useEffect(() => {
   
    window.addEventListener('beforeunload', keepOnPage);
    return () => {
    window.removeEventListener('beforeunload', keepOnPage);
    };
  },[]);


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

  const forwardWithDataAndEmail = (newFormData: Partial<FormData>, newLegalEmail: string) => {
    setLegalEmail(newLegalEmail);
    forwardWithData(newFormData);
  };

  const submit = async () => {
    setLoading(true);

    const postLegalsResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_POST_LEGALS' },
      { method: 'POST', data: formData }
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
      Component: () => OnboardingStep1({ forward: forwardWithDataAndEmail, back }),
    },
    {
      label: 'Inserisci i dati del rappresentante legale',
      Component: () => OnboardingStep2({ forward: forwardWithData, back }),
    },
    {
      label: 'Inserisci i dati degli amministratori',
      Component: () => OnboardingStep3({ forward: submit, back }),
    },
  ];

  const Step = steps[activeStep].Component;

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      img: { src: checkIllustration, alt: "Icona dell'email" },
      title: 'La tua richiesta è stata inviata con successo',
      description: [
        <Stack key="0" spacing={10}>
          <Typography>
            Riceverai una PEC all’indirizzo istituzionale dell’Ente.
            <br />
            Al suo interno troverai le istruzioni per confermare i dati e ottenere l’autorizzazione.
          </Typography>
          <Button
            variant="contained"
            sx={{ width: '200px', alignSelf: 'center' }}
            onClick={() => window.location.assign(URL_FE_LANDING)}
          >
            Torna al portale
          </Button>
          {/* <Typography>
            Non hai ricevuto nessuna mail? Attendi qualche minuto e controlla anche nello spam. Se
            non arriva, <InlineSupportLink />
          </Typography> */}
        </Stack>,
      ],
    },
    error: {
      img: { src: redXIllustration, alt: "Icona dell'email" },
      title: "C'è stato un problema...",
      description: [
        <p key="0">
          Il salvataggio dei dati inseriti non è andato a buon fine.
          <br />
          <Button onClick={reload} variant={'text'}>
            Prova nuovamente a registrarti
          </Button>
          , e se il problema dovesse persistere, <InlineSupportLink />!
        </p>,
      ],
    },
  };

  return !outcome ? (
    <React.Fragment>
      <Step />
      {loading && <LoadingOverlay loadingText="Stiamo verificando i tuoi dati" />}
    </React.Fragment>
  ) : (
    <MessageNoAction {...outcomeContent[outcome]} />
  );
}

export const Onboarding = withLogin(OnboardingComponent);
