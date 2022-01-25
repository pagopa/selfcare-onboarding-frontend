import { Button, Grid, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { useEffect, useState, useContext } from 'react';
import ErrorIcon from '@pagopa/selfcare-common-frontend/components/icons/ErrorIcon';
import { RequestOutcomeMessage, StepperStepComponentProps } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { ENV } from '../utils/env';
import { getFetchOutcome } from '../lib/error-utils';
import { HeaderContext, UserContext } from '../lib/context';
import { LoadingOverlay } from './LoadingOverlay';
import { unregisterUnloadEvent } from './../views/Onboarding';
import { MessageNoAction } from './MessageNoAction';

type Props = StepperStepComponentProps & {
  institutionId: string;
  productId: string;
};

const alreadyOnboarded: RequestOutcomeMessage = {
  title: '',
  description: [
    <Grid container direction="column" key="0">
      <Grid container item justifyContent="center" mt={5}>
        <Grid item xs={6}>
          <Typography variant="h2">L&apos;Ente che hai scelto ha già aderito</Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={7} mt={1}>
        <Grid item xs={7}>
          <Typography>
            Per accedere, chiedi al Referente incaricato di abilitarti nella sezione Referenti del
            portale.
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
      {/* removed from MVP
      <Grid container item justifyContent="center">
        <Grid item xs={4} pt={12}>
          <Divider />
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={7} mt={1}>
        <Grid item xs={7} mt={2}>
          <Typography variant="body2">
            <Typography variant="body2">
              Gli attuali Referenti non sono più disponibili e hai la necessità di gestire i
              prodotti?
            </Typography>
            {/* redirect TBD * /} 
            <Link>Registra un nuovo referente</Link>
          </Typography>
        </Grid>
      </Grid> */}
    </Grid>,
  ],
};

const genericError: RequestOutcomeMessage = {
  ImgComponent: ErrorIcon,
  title: '',
  description: [
    <Grid container direction="column" key="0">
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
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function OnboardingStep1_5({ forward, institutionId, productId }: Props) {
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const submit = async () => {
    setLoading(true);

    const onboardingStatus = await fetchWithLogs(
      { endpoint: 'VERIFY_ONBOARDING', endpointParams: { institutionId, productId } },
      { method: 'HEAD' },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const restOutcome = getFetchOutcome(onboardingStatus);

    if (restOutcome === 'success') {
      setOutcome(alreadyOnboarded);
    } else {
      if (
        (onboardingStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingStatus as AxiosError<any>).response?.status === 400
      ) {
        setOutcome(null);
        onForwardAction();
      } else {
        setOutcome(genericError);
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
