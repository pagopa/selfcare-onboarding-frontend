import React, {useState} from 'react';
/* import { withLogin } from '../components/withLogin'; */
import { useHistory } from 'react-router-dom';
import { Button } from '@mui/material';
import { RequestOutcome, RequestOutcomeOptions, StepperStep } from '../../types';
/* import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils'; */
import { OnboardingStep1 } from '../components/OnboardingStep1';
import { OnboardingStep2 } from '../components/OnboardingStep2';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { MessageNoAction } from '../components/MessageNoAction';
import checkIllustration from '../assets/check-illustration.svg';
import redXIllustration from '../assets/red-x-illustration.svg';
import { InlineSupportLink } from '../components/InlineSupportLink';


function OnboardingComponent() {
  const [loading, _setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [_legalEmail, setLegalEmail] = useState('');
  const [outcome, _setOutcome] = useState<RequestOutcome>();
  const history = useHistory();

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
/*
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
  }; */

  const steps: Array<StepperStep> = [
    {
      label: "Accetta privacy",
      Component: () => OnboardingStep1({ forward }),
    },
    {
      label: "Seleziona l'ente",
      Component: () => OnboardingStep2({ forward: forwardWithDataAndEmail, back }),
    },/*
    {
      label: 'Inserisci i dati',
      Component: () => OnboardingStep2({ forward: forwardWithData, back }),
    },
    {
      label: "Verifica l'accordo",
      Component: () => OnboardingStep3({ forward: submit, back }),
    }, */
  ];

  const Step = steps[activeStep].Component;

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      img: { src: checkIllustration, alt: "Icona dell'email" },
      title: 'La tua richiesta è stata inviata con successo',
      description: [
        <p key="0">
          Riceverai una PEC all’indirizzo istituzionale dell’Ente.<br />
          Al suo interno troverai le istruzioni per confermare i dati e ottenere l’autorizzazione.  
        </p>,
        <p key="1">
          Non hai ricevuto nessuna mail? Attendi qualche minuto e controlla anche nello spam. Se non
          arriva, <InlineSupportLink />
        </p>,
      ],
    },
    error: {
      img: { src: redXIllustration, alt: "Icona dell'email" },
      title: "C'è stato un problema...",
      description: [
        <p key="0">
          Il salvataggio dei dati inseriti non è andato a buon fine.{' '}
          <Button onClick={reload}>
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

export const Onboarding = /* TODO withLogin( */ OnboardingComponent; /* ); */
