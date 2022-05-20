import React, { useEffect, useState, useContext } from 'react';
import { Button, Typography, Grid } from '@mui/material';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import { uniqueId } from 'lodash';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { MessageNoAction } from '../components/MessageNoAction';
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

  const { t } = useTranslation();
  useEffect(() => {
    const requestId = uniqueId('contract-reject-');
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
        trackEvent('ONBOARDING_CANCEL_SUCCESS', { request_id: requestId, party_id: token });
      } else if (outcome === 'error') {
        trackEvent('ONBOARDING_CANCEL_FAILURE', { request_id: requestId, party_id: token });
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
      title: '',
      description: [
        <>
          <IllusCompleted size={60} />
          <Typography variant="h4" mt={3}>
            <Trans i18nKey="rejectRegistration.outcomeContent.success.title">
              La tua richiesta di adesione è
              <br />
              stata annullata
            </Trans>
          </Typography>
          <Typography variant="body1" mb={4} mt={1}>
            <Trans i18nKey="rejectRegistration.outcomeContent.success.description">
              Nella home dell’Area Riservata puoi vedere i prodotti
              <br />
              disponibili e richiedere l’adesione per il tuo ente.
            </Trans>
          </Typography>
          <Typography mt={3}>
            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            >
              {t('rejectRegistration.outcomeContent.success.backActionLabel')}
            </Button>
          </Typography>
          ,
        </>,
      ],
    },
    error: {
      title: '',
      description: [
        <>
          <IllusError size={60} />
          <Grid container direction="column" key="0" style={{ textAlign: 'center' }} mt={3}>
            <Grid container item justifyContent="center">
              <Grid item xs={6}>
                <Typography variant="h4">
                  {t('rejectRegistration.outcomeContent.error.title')}
                </Typography>
              </Grid>
            </Grid>
            <Grid container item justifyContent="center" mb={4} mt={1}>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <Trans i18nKey="rejectRegistration.outcomeContent.error.description">
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
                  variant="contained"
                  sx={{ alignSelf: 'center' }}
                  onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
                >
                  {t('rejectRegistration.outcomeContent.error.backActionLabel')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </>,
      ],
    },
  };

  if (loading) {
    return <LoadingOverlay loadingText={t('rejectRegistration.loading.loadingText')} />;
  }

  return (
    <React.Fragment>
      {!outcome ? (
        <LoadingOverlay loadingText={t('rejectRegistration.notOutcome.loadingText')} />
      ) : (
        <MessageNoAction {...outcomeContent[outcome]} />
      )}
    </React.Fragment>
  );
}
