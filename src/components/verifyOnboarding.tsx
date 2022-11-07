import { IllusError } from '@pagopa/mui-italia';
import { Grid, Typography, Button } from '@mui/material';
import { Trans } from 'react-i18next';
import { AxiosError } from 'axios';
import { Party, Product, RequestOutcomeMessage } from '../../types';
import { ENV } from '../utils/env';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';

type Props = {
  selectedParty?: Party;
  selectedProduct?: Product | null;
  externalInstitutionId: string;
  productId?: string;
  setOutcome: React.Dispatch<React.SetStateAction<RequestOutcomeMessage | null | undefined>>;
  onForwardAction: () => void;
  setRequiredLogin: React.Dispatch<React.SetStateAction<boolean>>;
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
        <Grid container item justifyContent="center" mb={2} mt={1}>
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
        <Grid container item justifyContent="center" mt={2}>
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
export const verifyOnboarding = async ({
  selectedParty,
  selectedProduct,
  externalInstitutionId,
  productId,
  setOutcome,
  onForwardAction,
  setRequiredLogin,
}: Props) => {
  const notAllowedError: RequestOutcomeMessage = {
    title: '',
    description: [
      <>
        <IllusError size={60} />
        <Grid container direction="column" key="0" mt={3}>
          <Grid container item justifyContent="center">
            <Grid item xs={6}>
              <Typography variant="h4">
                <Trans i18nKey="onboardingStep1_5.userNotAllowedError.title" />
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center" mb={2} mt={1}>
            <Grid item xs={6}>
              <Typography>
                <Trans i18nKey="onboardingStep1_5.userNotAllowedError.description">
                  Al momento, l’ente
                  {{ partyName: selectedParty?.description }}
                  non ha il permesso di aderire a{{ productName: selectedProduct?.title }}
                </Trans>
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center" mt={2}>
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

  const onboardingStatus = await fetchWithLogs(
    { endpoint: 'VERIFY_ONBOARDING', endpointParams: { externalInstitutionId, productId } },
    { method: 'HEAD' },
    () => setRequiredLogin(true)
  );

  // Check the outcome
  const restOutcome = getFetchOutcome(onboardingStatus);
  // party is already onboarded
  if (restOutcome === 'success') {
    setOutcome(alreadyOnboarded);
  } else {
    // party is NOT already onboarded
    if (
      (onboardingStatus as AxiosError<any>).response?.status === 404 ||
      (onboardingStatus as AxiosError<any>).response?.status === 400
    ) {
      setOutcome(null);
      onForwardAction();
    } else if ((onboardingStatus as AxiosError<any>).response?.status === 403) {
      setOutcome(notAllowedError);
    } else {
      setOutcome(genericError);
    }
  }
};
