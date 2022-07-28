import { Button, Grid, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { resolvePathVariables } from '@pagopa/selfcare-common-frontend/utils/routes-utils';
import { useTranslation, Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { History } from 'history';
import { IllusError } from '@pagopa/mui-italia';
import { RequestOutcomeMessage, StepperStepComponentProps } from '../../../../types';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { ROUTES } from '../../../utils/constants';
import { ReactComponent as SubscribedIcon } from '../../../assets/already-onboarded.svg';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  productId: string;
  subProductId: string;
  productTitle: string;
};

const alreadyOnboardedSubProduct: RequestOutcomeMessage = {
  ImgComponent: SubscribedIcon,
  title: '',
  description: [
    <Grid container direction="column" key="0">
      <Grid container item justifyContent="center" mt={1}>
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
              L&apos;ente che hai selezionato ha già sottoscritto l&apos;offerta <br />
              Premium.
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

const buildNotBasicProduct = (
  productTitle: string,
  productId: string,
  externalInstitutionId: string,
  history: History
): RequestOutcomeMessage => ({
  title: '',
  description: [
    <>
      <IllusError size={60} />
      <Grid container direction="column" key="0">
        <Grid container item justifyContent="center" mt={3}>
          <Grid item xs={6}>
            <Typography variant="h4">
              <Trans i18nKey="onBoardingSubProduct.notBasicProductError.title">
                L&apos;ente non ha aderito a {{ selectedProduct: productTitle }}
              </Trans>
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center" mb={2} mt={1}>
          <Grid item xs={6}>
            <Typography>
              <Trans i18nKey="onBoardingSubProduct.notBasicProductError.message">
                Per poter sottoscrivere l&apos;offerta Premium, l&apos;ente che hai <br />
                selezionato deve prima aderire al prodotto {{ selectedProduct: productTitle }}
              </Trans>
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center" mt={3}>
          <Grid item xs={4}>
            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => {
                history.push(
                  resolvePathVariables(ROUTES.ONBOARDING.PATH, { productId }).concat(
                    `?partyExternalId=${externalInstitutionId}`
                  )
                );
              }}
            >
              <Trans i18nKey="onBoardingSubProduct.notBasicProductError.adhesionButton">
                Aderisci
              </Trans>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>,
  ],
});

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

// eslint-disable-next-line sonarjs/cognitive-complexity
export function SubProductStepOnBoardingStatus({
  forward,
  externalInstitutionId,
  productId,
  subProductId,
  productTitle,
}: Props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const history = useHistory();

  const checkProduct = async (): Promise<boolean> => {
    const onboardingProductStatus = await fetchWithLogs(
      { endpoint: 'VERIFY_ONBOARDING', endpointParams: { externalInstitutionId, productId } },
      { method: 'HEAD' },
      () => setRequiredLogin(true)
    );
    const restOutcomeProduct = getFetchOutcome(onboardingProductStatus);
    if (
      restOutcomeProduct === 'error' &&
      ((onboardingProductStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingProductStatus as AxiosError<any>).response?.status === 400)
    ) {
      setOutcome(buildNotBasicProduct(productTitle, productId, externalInstitutionId, history));
      return false;
    } else {
      return true;
    }
  };

  const checkSubProduct = async (): Promise<boolean> => {
    const onboardingSubProductStatus = await fetchWithLogs(
      {
        endpoint: 'VERIFY_ONBOARDING',
        endpointParams: { externalInstitutionId, productId: subProductId },
      },
      { method: 'HEAD' },
      () => setRequiredLogin(true)
    );
    const restOutcomeSubProduct = getFetchOutcome(onboardingSubProductStatus);
    if (restOutcomeSubProduct === 'success') {
      setOutcome(alreadyOnboardedSubProduct);
      return false;
    } else {
      if (
        (onboardingSubProductStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingSubProductStatus as AxiosError<any>).response?.status === 400
      ) {
        return true;
      } else {
        setOutcome(genericError);
        return false;
      }
    }
  };

  const submit = async () => {
    setLoading(true);

    const checkProductResult = await checkProduct();
    if (checkProductResult) {
      const checkSubProductResult = await checkSubProduct();
      if (checkSubProductResult) {
        forward();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void submit();
  }, []);

  if (outcome) {
    unregisterUnloadEvent(setOnExit);
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
