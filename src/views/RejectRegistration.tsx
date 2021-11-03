import React, { useEffect, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { MessageNoAction } from '../components/MessageNoAction';
import checkIllustration from '../assets/check-illustration.svg';
import redXIllustration from '../assets/red-x-illustration.svg';
import { RequestOutcome, RequestOutcomeOptions } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { LoadingOverlay } from '../components/LoadingOverlay';

export const getOnboardingMagicLinkJwt = () =>
  new URLSearchParams(window.location.search).get('jwt');

export default function RejectRegistration() {
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const [loading, setLoading] = useState(true);

  const token = getOnboardingMagicLinkJwt();

  useEffect(() => {
    async function asyncSendDeleteRequest() {
      // Send DELETE request
      const contractPostResponse = await fetchWithLogs(
        { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
        { method: 'DELETE' }
      );

      // Check the outcome
      const outcome = getFetchOutcome(contractPostResponse);

      // Show it to the end user
      setLoading(false);
      setOutcome(outcome);
    }

    if (!token) {
      setLoading(false);
      setOutcome('error');
    } else {
      void asyncSendDeleteRequest();
    }
  }, []); // in order to be invoked once

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      img: { src: checkIllustration, alt: "Icona dell'email" },
      title: 'La tua richiesta di adesione è stata annullata',
      description: [
        <Stack key="0" spacing={10}>
          <Typography>
            Visita il portale Self Care per conoscere i prodotti e richiedere una nuova
            <br />
            adesione per il tuo Ente.
          </Typography>
          <Button
            variant="contained"
            sx={{ width: '200px', alignSelf: 'center' }}
            onClick={() => window.location.assign(process.env.REACT_APP_URL_FE_LOGIN)} // TODO redirect to landing
          >
            Torna al portale
          </Button>
        </Stack>,
      ],
    },
    error: {
      img: { src: redXIllustration, alt: 'Error' },
      title: "C'è stato un problema...",
      description: [
        <p key="0">
          {!token
            ? 'Il link usato non è valido!'
            : 'Il salvataggio dei dati inseriti non è andato a buon fine.'}
        </p>,
      ],
    },
  };

  if (loading) {
    return <LoadingOverlay loadingText="Stiamo verificando i tuoi dati" />;
  }

  return (
    <React.Fragment>
      {!outcome ? (
        <LoadingOverlay loadingText="Stiamo cancellando la tua iscrizione" />
      ) : (
        <MessageNoAction {...outcomeContent[outcome]} />
      )}
    </React.Fragment>
  );
}
