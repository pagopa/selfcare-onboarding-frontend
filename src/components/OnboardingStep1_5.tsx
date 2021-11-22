import { Button, Divider, Grid, Typography, Link } from '@mui/material';
// import { Box } from '@mui/system';
import { AxiosResponse } from 'axios';
import { useEffect, useState, useContext } from 'react';
import {
  InstitutionInfo,
  OnBoardingInfo,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { URL_FE_LANDING } from '../utils/constants';
import { getFetchOutcome } from '../lib/error-utils';
import { HeaderContext } from '../lib/context';
import { ReactComponent as ErrorIllustration } from '../assets/error-illustration.svg';
import { LoadingOverlay } from './LoadingOverlay';
import { unregisterUnloadEvent } from './../views/Onboarding';
import { MessageNoAction } from './MessageNoAction';

type Props = StepperStepComponentProps & {
  institutionId: string;
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
            Per accedere, chiedi al Referente incaricato di aggiungerti al portale Self Care del tuo
            Ente.
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
            {/* TODO: redirect TBD */}
            <Link>Registra un nuovo referente</Link> 
          </Typography>
        </Grid>
      </Grid>
    </Grid>,
  ],
};
// const reload = () => {
//   history.go(0);
// };
const genericError: RequestOutcomeMessage = {
  ImgComponent: ErrorIllustration,
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
          </Typography>
          <Typography>Ti chiediamo di riprovare più tardi.</Typography>
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
};

export function OnboardingStep1_5({ forward, institutionId }: Props) {
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnLogout } = useContext(HeaderContext);

  const submit = async () => {
    setLoading(true);

    const onboardingStatus = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_INFO' },
      { method: 'GET', params: { institutionId } }
    );

    setLoading(false);

    // Check the outcome
    const restOutcome = getFetchOutcome(onboardingStatus);

    if (restOutcome === 'success') {
      const onBoardingInfo: OnBoardingInfo = (onboardingStatus as AxiosResponse<OnBoardingInfo>)
        .data;
      const institution: InstitutionInfo | null =
        onBoardingInfo.institutions?.length > 0 ? onBoardingInfo.institutions[0] : null;
      if (institution && institution.state === 'ACTIVE') {
        setOutcome(alreadyOnboarded);
      } else {
        setOutcome(null);
        onForwardAction();
      }
    } else {
      setOutcome(genericError);
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
