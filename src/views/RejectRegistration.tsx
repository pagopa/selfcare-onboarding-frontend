import React, { useEffect, useState, useContext } from 'react';
import { Button, Stack, Typography, Grid } from '@mui/material';
import ErrorIcon from '@pagopa/selfcare-common-frontend/components/icons/ErrorIcon';
import cryptoRandomString from 'crypto-random-string';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { MessageNoAction } from '../components/MessageNoAction';
import checkIllustration from '../assets/check-illustration.svg';
import { RequestOutcome, RequestOutcomeOptions } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { HeaderContext, UserContext } from '../lib/context';
import { ENV } from '../utils/env';

export const getOnboardingMagicLinkJwt = () =>
  new URLSearchParams(window.location.search).get('jwt');

export default function RejectRegistration() {
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const [loading, setLoading] = useState(true);

  const token = getOnboardingMagicLinkJwt();
  const { setSubHeaderVisible, setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  useEffect(() => {
    const requestId = cryptoRandomString({ length: 8 });
    trackEvent('ONBOARDING_CANCEL', { request_id: requestId });
    async function asyncSendDeleteRequest() {
      // Send DELETE request
      const contractPostResponse = await fetchWithLogs(
        { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
        { method: 'DELETE' },
        () => setRequiredLogin(true)
      );

      // Check the outcome
      const outcome = getFetchOutcome(contractPostResponse);

      // Show it to the end user
      setLoading(false);
      setOutcome(outcome);
      if (outcome === 'success') {
        trackEvent('ONBOARDING_CANCEL_SUCCESS', { request_id: requestId });
      } else if (outcome === 'error') {
        trackEvent('ONBOARDING_CANCEL_FAILURE', { request_id: requestId });
      }
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
            onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
          >
            Torna alla home
          </Button>
        </Stack>,
      ],
    },
    error: {
      ImgComponent: ErrorIcon,
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
                variant="contained"
                sx={{ width: '200px', alignSelf: 'center' }}
                onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
              >
                Torna alla home
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
