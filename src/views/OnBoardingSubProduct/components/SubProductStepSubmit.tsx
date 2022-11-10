import { useContext, useEffect, useState } from 'react';
import {
  // trackAppError,
  trackEvent,
} from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { Button, Grid, Typography } from '@mui/material';
import { IllusError, theme } from '@pagopa/mui-italia';
import { Trans } from 'react-i18next';
import { AxiosError } from 'axios';
import {
  BillingData,
  InstitutionType,
  Problem,
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
import {
  billingData2billingDataRequest,
  pspData2pspDataRequest,
} from '../../onboarding/Onboarding';

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
                Qualcosa è andato storto
              </Trans>
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center" mb={3} mt={1}>
          <Grid item xs={6}>
            <Typography>
              <Trans i18nKey="onBoardingSubProduct.genericError.message">
                A causa di un errore del sistema non è possibile completare <br />
                la procedura. Ti chiediamo di riprovare più tardi.
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
  const { setOnExit } = useContext(HeaderContext);
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
          unregisterUnloadEvent(setOnExit);
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
      {
        method: 'POST',
        data: {
          users: users.map((u) => ({
            ...u,
            taxCode: u.taxCode.toUpperCase(),
            email: u.email.toLowerCase(),
          })),
          billingData: billingData2billingDataRequest(billingData as BillingData),
          pspData:
            institutionType === 'PSP'
              ? pspData2pspDataRequest(billingData as BillingData)
              : undefined,
          institutionType,
          pricingPlan,
          origin,
        },
      },
      () => setRequiredLogin(true)
    );

    // Check the outcome
    const outcome = getFetchOutcome(postLegalsResponse);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_PREMIUM_SEND_SUCCESS', {
        request_id: requestId,
        party_id: externalInstitutionId,
        product_id: product?.id,
        subproduct_id: subProduct?.id,
      });
      forward();
    } else {
      const event =
        (postLegalsResponse as AxiosError<Problem>).response?.status === 409
          ? 'ONBOARDING_PREMIUM_SEND_CONFLICT_ERROR_FAILURE'
          : 'ONBOARDING_PREMIUM_SEND_FAILURE';
      trackEvent(event, {
        party_id: externalInstitutionId,
        request_id: requestId,
        product_id: product?.id,
        subproduct_id: subProduct?.id,
      });
      setError(true);
    }
  };

  return error ? <MessageNoAction {...errorOutCome} /> : <></>;
}
export default SubProductStepSubmit;
