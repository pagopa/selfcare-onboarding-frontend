import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router';
import { Button, Stack, Typography } from '@mui/material';
import { MessageNoAction } from '../components/MessageNoAction';
import checkIllustration from '../assets/check-illustration.svg';
import redXIllustration from '../assets/red-x-illustration.svg';
import { RequestOutcome, RequestOutcomeOptions } from '../../types';
// import { parseSearch } from '../lib/url-utils';
// import { fetchWithLogs } from '../lib/api-utils';
// import { getFetchOutcome } from '../lib/error-utils';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { InlineSupportLink } from '../components/InlineSupportLink';

export function RejectRegistration() {
  // const location = useLocation();
  const [outcome, setOutcome] = useState<RequestOutcome>();

  /*  const getJwt = () => {
    const s = parseSearch(location.search);
    return s.jwt;
  }; */

  // const token = 'pippo '; // getJwt();

  const reload = () => {
    history.go(0);
  };

  useEffect(() => {
    async function asyncSendDeleteRequest() {
      // Send DELETE request
      /*  const contractPostResponse = await fetchWithLogs(
        { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
        { method: 'DELETE' }
      ); */

      // Check the outcome
      //  const outcome = getFetchOutcome(contractPostResponse);
      const outcome = 'success';
      // Show it to the end user
      setOutcome(outcome);
    }

    void asyncSendDeleteRequest();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            onClick={() => window.location.assign(process.env.REACT_APP_URL_FE_LOGIN)}
          >
            Torna al portale
          </Button>
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

  return (
    <React.Fragment>
      {!outcome ? (
        <LoadingOverlay loadingText="Stiamo cancellando la tua iscrizione" />
      ) : (
        <MessageNoAction {...outcomeContent[outcome!]} />
      )}
    </React.Fragment>
  );
}
