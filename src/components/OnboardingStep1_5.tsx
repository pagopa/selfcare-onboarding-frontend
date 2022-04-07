import { Button, Grid, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { useEffect, useState, useContext } from 'react';
// import ErrorIcon from '@pagopa/selfcare-common-frontend/components/icons/ErrorIcon';
import { Trans, useTranslation } from 'react-i18next';
import { RequestOutcomeMessage, StepperStepComponentProps } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { ENV } from '../utils/env';
import { getFetchOutcome } from '../lib/error-utils';
import { HeaderContext, UserContext } from '../lib/context';
import { ReactComponent as ErrorIcon } from '../assets/payment_completed_error.svg';
import { unregisterUnloadEvent } from '../utils/unloadEvent-utils';
import { LoadingOverlay } from './LoadingOverlay';
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
          <Typography variant="h4">
            <Trans i18nKey="onboardingStep1_5.alreadyOnboarded.title" />
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={3} mt={1}>
        <Grid item xs={6}>
          <Typography>
            <Trans i18nKey="onboardingStep1_5.alreadyOnboarded.description" />
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
            <Trans i18nKey="onboardingStep1_5.alreadyOnboarded.backAction" />
          </Button>
        </Grid>
      </Grid>
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
          <Typography variant="h4">
            <Trans i18nKey="onboardingStep1_5.genericError.title" />
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={3} mt={1}>
        <Grid item xs={6}>
          <Typography>
            <Trans i18nKey="onboardingStep1_5.genericError.description">
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
            <Trans i18nKey="onboardingStep1_5.genericError.backAction" />
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
  const { t } = useTranslation();

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
    <LoadingOverlay loadingText={t('onboardingStep1_5.loadingText')} />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default OnboardingStep1_5;
