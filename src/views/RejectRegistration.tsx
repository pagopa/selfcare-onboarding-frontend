import React, { useEffect, useState, useContext } from 'react';
import { Button, Stack, Typography, Grid } from '@mui/material';
import { MessageNoAction } from '../components/MessageNoAction';
import checkIllustration from '../assets/check-illustration.svg';
// import redXIllustration from '../assets/red-x-illustration.svg';
import { RequestOutcome, RequestOutcomeOptions } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { HeaderContext } from '../lib/context';
import { URL_FE_LANDING } from '../utils/constants';
import { ReactComponent as ErrorIllustration } from '../assets/error-illustration.svg';

export const getOnboardingMagicLinkJwt = () =>
  new URLSearchParams(window.location.search).get('jwt');

export default function RejectRegistration() {
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const [loading, setLoading] = useState(true);

  const token = getOnboardingMagicLinkJwt();
  const { setSubHeaderVisible, setOnLogout } = useContext(HeaderContext);

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

  useEffect(() => {
    setSubHeaderVisible(true);
    setOnLogout(null);
    return () => {
      setSubHeaderVisible(true);
      setOnLogout(undefined);
    };
  }, []);
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
            onClick={() => window.location.assign(URL_FE_LANDING)}
          >
            Torna al portale
          </Button>
        </Stack>,
      ],
    },
    error: {
      ImgComponent: ErrorIllustration,
      title: '',
      description: [
        <Grid container direction="column" key="0" style={{ textAlign: 'center' }}>
          <Grid container item justifyContent="center">
            <Grid item xs={6}>
              <Typography variant="h2">Spiacenti, qualcosa è andato storto.</Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center" mb={7} mt={1}>
            <Grid item xs={6}>
              {/* TODO: text TBD  */}
              <Typography>
                A causa di un errore del sistema non è possibile completare la procedura.
                <br />
                Ti chiediamo di riprovare più tardi.EE
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center">
            <Grid item xs={4}>
              <Button
                variant="contained"
                sx={{ width: '200px', alignSelf: 'center' }}
                onClick={() => window.location.assign(URL_FE_LANDING)}
              >
                Torna al portale
              </Button>
            </Grid>
          </Grid>
        </Grid>,
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
