import { useContext, useEffect, useState } from 'react';
import {
  // trackAppError,
  trackEvent,
} from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { Button, Grid, Typography } from '@mui/material';
import { IllusError, theme } from '@pagopa/mui-italia';
import { Trans } from 'react-i18next';
import {
  BillingData,
  InstitutionType,
  Product,
  StepperStepComponentProps,
  UserOnCreate,
} from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { ENV } from '../../../utils/env';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';

type Props = StepperStepComponentProps & {
  requestId: string;
  product: Product;
  subProduct: Product;
  externalInstitutionId: string;
  users: Array<UserOnCreate>;
  billingData: BillingData;
  institutionType: InstitutionType;
  pricingPlan?: string;
  origin: string;
  setLoading: (loading: boolean) => void;
};

const errorOutCome = {
  title: '',
  description: [
    <>
      <IllusError size={60} />
      <Grid container direction="column" key="0" mt={3}>
        <Grid container item justifyContent="center">
          <Grid item xs={5}>
            <Typography variant="h4">
              <Trans i18nKey="onBoardingSubProduct.genericError.title">
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
            <Button
              onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
              variant={'contained'}
            >
              <Typography width="100%" sx={{ color: theme.palette.primary.contrastText }}>
                <Trans i18nKey="onBoardingSubProduct.genericError.homeButton">
                  Torna alla home
                </Trans>
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>,
  ],
};

function SubProductStepSubmit({
  requestId,
  forward,
  product,
  subProduct,
  externalInstitutionId,
  users,
  billingData,
  setLoading,
  institutionType,
  pricingPlan,
  origin,
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
        endpointParams: { externalInstitutionId, productId: subProduct.id },
      },
      { method: 'POST', data: { users, billingData, institutionType, pricingPlan, origin } },
      () => setRequiredLogin(true)
    );

    // Check the outcome
    const outcome = getFetchOutcome(postLegalsResponse);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_SEND_SUCCESS', {
        party_id: externalInstitutionId,
        request_id: requestId,
        product_id: product.id,
        subproduct_id: subProduct.id,
      });
      forward();
    } else if (outcome === 'error') {
      setError(true);
      trackEvent('ONBOARDING_SEND_FAILURE', {
        party_id: externalInstitutionId,
        request_id: requestId,
        product_id: product?.id,
        subproduct_id: subProduct?.id,
      });
    }
  };

  return error ? <MessageNoAction {...errorOutCome} /> : <></>;
}
export default SubProductStepSubmit;
