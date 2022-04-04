import { Button, Grid, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { resolvePathVariables } from '@pagopa/selfcare-common-frontend/utils/routes-utils';
import { useTranslation, Trans } from 'react-i18next';
import { RequestOutcomeMessage, StepperStepComponentProps } from '../../../../types';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import { unregisterUnloadEvent } from '../../Onboarding';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { ROUTES } from '../../../utils/constants';

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
          <Typography variant="h4">
            <Trans i18nKey="onBoardingSubProduct.alreadyOnboardedError.title">
              Sottoscrizione già avvenuta
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={3} mt={1}>
        <Grid item xs={6}>
          <Typography>
            <Trans i18nKey="onBoardingSubProduct.alreadyOnboardedError.message">
              L&apos;ente che hai selezionato ha già sottoscritto l&apos;offerta Premium.
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
            <Trans i18nKey="onBoardingSubProduct.alreadyOnboardedError.closeButton"> Chiudi </Trans>
          </Button>
        </Grid>
      </Grid>
    </Grid>,
  ],
};

const notBasicProduct: RequestOutcomeMessage = {
  title: '',
  description: [
    <Grid container direction="column" key="0">
      <Grid container item justifyContent="center" mt={5}>
        <Grid item xs={6}>
          <Typography variant="h4">
            <Trans i18nKey="onBoardingSubProduct.notBasicProductError.title">
              L&apos;ente non ha aderito a {/* TODO SelectedProduct */}
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={3} mt={1}>
        <Grid item xs={6}>
          <Typography>
            <Trans i18nKey="onBoardingSubProduct.notBasicProductError.message">
              Per poter sottoscrivere l&apos;offerta Premium, l&apos;ente che hai selezionato deve
              prima aderire al prodotto {/* TODO SelectedProduct */}
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center">
        <Grid item xs={4}>
          <Button
            variant="contained"
            sx={{ alignSelf: 'center' }}
            onClick={() => resolvePathVariables(ROUTES.ONBOARDING.PATH, {})}
          >
            <Trans i18nKey="onBoardingSubProduct.notBasicProductError.adhesionButton">
              Aderisci
            </Trans>
          </Button>
        </Grid>
      </Grid>
    </Grid>,
  ],
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function SubProductStepOnBoardingStatus({
  forward,
  institutionId,
  productId,
  subProductId,
}: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const submit = async () => {
    setLoading(true);

    const onboardingProductStatus = await fetchWithLogs(
      { endpoint: 'VERIFY_ONBOARDING', endpointParams: { institutionId, productId } },
      { method: 'HEAD' },
      () => setRequiredLogin(true)
    );

    const onboardingSubProductStatus = await fetchWithLogs(
      { endpoint: 'VERIFY_ONBOARDING', endpointParams: { institutionId, subProductId } },
      { method: 'HEAD' },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    const restOutcomeProduct = getFetchOutcome(onboardingProductStatus);
    const restOutcomeSubProduct = getFetchOutcome(onboardingSubProductStatus);

    if (restOutcomeProduct === 'success') {
      onForwardAction();
    } else {
      if (
        (onboardingProductStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingProductStatus as AxiosError<any>).response?.status === 400
      ) {
        setOutcome(notBasicProduct);
      } else if (restOutcomeSubProduct === 'success') {
        setOutcome(alreadyOnboarded);
      } else {
        if (
          (onboardingSubProductStatus as AxiosError<any>).response?.status === 404 ||
          (onboardingSubProductStatus as AxiosError<any>).response?.status === 400
        ) {
          onForwardAction();
        }
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
    <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default SubProductStepOnBoardingStatus;
