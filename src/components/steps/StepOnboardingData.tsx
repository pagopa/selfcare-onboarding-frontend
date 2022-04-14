import { Button, Grid, Typography } from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { IllusError } from '@pagopa/mui-italia';
import {
  InstitutionOnboardingInfoResource,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../types';
import { MessageNoAction } from '../MessageNoAction';
import { HeaderContext, UserContext } from '../../lib/context';
import { ENV } from '../../utils/env';
import { LoadingOverlay } from '../LoadingOverlay';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { unregisterUnloadEvent } from '../../utils/unloadEvent-utils';

type Props = StepperStepComponentProps & {
  institutionId: string;
  productId: string;
};

const genericError: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <IllusError size={60} />
      <Grid container direction="column" key="0" mt={3}>
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
      </Grid>
    </>,
  ],
};

function StepOnboardingData({ forward, institutionId, productId }: Props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const submit = async () => {
    setLoading(true);

    const onboardingData = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_ONBOARDING_DATA',
        endpointParams: {
          institutionId,
          productId,
        },
      },
      { method: 'GET' },
      () => setRequiredLogin(true)
    );

    const restOutcomeData = getFetchOutcome(onboardingData);
    if (restOutcomeData === 'success') {
      const result = (onboardingData as AxiosResponse).data as InstitutionOnboardingInfoResource;
      forward(result.manager, result.billingData, result.organizationType, result.origin);
    } else if (
      (onboardingData as AxiosError<any>).response?.status === 404 ||
      (onboardingData as AxiosError<any>).response?.status === 400
    ) {
      forward();
    } else {
      setOutcome(genericError);
    }
    setLoading(false);
  };

  useEffect(() => {
    void submit();
  }, []);

  if (outcome) {
    unregisterUnloadEvent(setOnLogout);
  }
  return loading ? (
    <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default StepOnboardingData;
