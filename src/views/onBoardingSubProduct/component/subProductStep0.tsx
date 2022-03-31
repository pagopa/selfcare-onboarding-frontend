import { Button, Grid, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { RequestOutcomeMessage, StepperStepComponentProps } from '../../../../types';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import { unregisterUnloadEvent } from '../../Onboarding';
import { LoadingOverlay } from '../../../components/LoadingOverlay';

type Props = StepperStepComponentProps & {
  institutionId: string;
  productId: string;
  subProductId: string;
};

const alreadyOnboarded: RequestOutcomeMessage = {
  title: '',
  description: [
    <Grid container direction="column" key="0">
      <Grid container item justifyContent="center" mt={5}>
        <Grid item xs={6}>
          <Typography variant="h4">Sottoscrizione già avvenuta</Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={3} mt={1}>
        <Grid item xs={6}>
          <Typography>
            L&apos;ente che hai selezionato ha già sottoscritto l&apos;offerta Premium.
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
            Chiudi
          </Button>
        </Grid>
      </Grid>
    </Grid>,
  ],
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function SubProductStep0({ forward, institutionId, productId, subProductId }: Props) {
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const submit = async () => {
    setLoading(true);

    // new Fetch
    const onboardingStatus = await fetchWithLogs(
      { endpoint: 'VERIFY_ONBOARDING', endpointParams: { institutionId, productId, subProductId } },
      { method: 'HEAD' },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const restOutcome = getFetchOutcome(onboardingStatus);
    if (restOutcome === 'success') {
      // prodotto
      onForwardAction();
    } else {
      if (
        // sotto prodotto
        (onboardingStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingStatus as AxiosError<any>).response?.status === 400
      ) {
        setOutcome(alreadyOnboarded);
      }
    }
  };

  useEffect(() => {
    void submit();
  }, []);

  const onForwardAction = () => {
    forward();
  };

  if (outcome) {
    unregisterUnloadEvent(setOnLogout);
  }
  return loading ? (
    <LoadingOverlay loadingText="Stiamo verificando i tuoi dati" />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default SubProductStep0;
