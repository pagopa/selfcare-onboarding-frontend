import { useContext, useEffect, useState } from 'react';
import {
  // trackAppError,
  trackEvent,
} from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { Button, Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { Trans } from 'react-i18next';
import { Product, StepperStepComponentProps, UserOnCreate } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { unregisterUnloadEvent } from '../../Onboarding';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { ENV } from '../../../utils/env';
import { ReactComponent as ErrorIcon } from '../../../assets/payment_completed_error.svg';

type Props = StepperStepComponentProps & {
  requestId: string;
  product: Product;
  subProduct: Product;
  institutionId: string;
  users: Array<UserOnCreate>;
  billingData: any; // TODO Use the correct type
  setLoading: (loading: boolean) => void;
};

const errorOutCome = {
  ImgComponent: ErrorIcon,
  title: '',
  description: [
    <Grid container direction="column" key="0">
      <Grid container item justifyContent="center">
        <Grid item xs={5}>
          <Typography variant="h4">
            <Trans i18nKey="onBoardingSubProduct.genericError.title">
              {' '}
              Richiesta di adesione premium in errore
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={3} mt={1}>
        <Grid item xs={5}>
          <Typography>
            <Trans i18nKey="onBoardingSubProduct.genericError.message">
              A causa di un errore del sistema non è possibile completare la procedura.
              <br />
              Ti chiediamo di riprovare più tardi.
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center">
        <Grid item xs={4}>
          <Button onClick={() => window.location.assign(ENV.URL_FE.LANDING)} variant={'contained'}>
            <Typography width="100%" sx={{ color: theme.palette.primary.contrastText }}>
              <Trans i18nKey="onBoardingSubProduct.genericError.homeButton">Torna alla home</Trans>
            </Typography>
          </Button>
        </Grid>
      </Grid>
    </Grid>,
  ],
};

function SubProductStepSubmit({
  requestId,
  forward,
  product,
  subProduct,
  institutionId,
  users,
  billingData,
  setLoading,
}: Props) {
  const [error, setError] = useState<boolean>(false);
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  useEffect(() => {
    if (!error) {
      setLoading(true);
      submit()
        .catch((_reason) => {
          setError(true);
          /*
          trackAppError({
            id: `ONBOARDING_SUBPRODUCT_ERROR_${requestId}`,
            blocking: false,
            toNotify: true,
            techDescription: `Something gone wrong while onboarding SubProduct ${subProduct?.id} for party ${institutionId}`,
            error: reason,
          });
          */
        })
        .finally(() => {
          unregisterUnloadEvent(setOnLogout);
          setLoading(false);
        });
    }
  }, []);

  const submit = async () => {
    const postLegalsResponse = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_POST_LEGALS',
        endpointParams: { institutionId, productId: subProduct.id },
      },
      { method: 'POST', data: { users, billingData } },
      () => setRequiredLogin(true)
    );

    // Check the outcome
    const outcome = getFetchOutcome(postLegalsResponse);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_SEND_SUCCESS', {
        party_id: institutionId,
        request_id: requestId,
        product_id: product.id,
        subproduct_id: subProduct.id,
      });
      forward();
    } else if (outcome === 'error') {
      setError(true);
      trackEvent('ONBOARDING_SEND_FAILURE', {
        party_id: institutionId,
        request_id: requestId,
        product_id: product?.id,
        subproduct_id: subProduct?.id,
      });
    }
  };

  return error ? <MessageNoAction {...errorOutCome} /> : <></>;
}
export default SubProductStepSubmit;
