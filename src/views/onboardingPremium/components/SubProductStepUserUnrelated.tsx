import { IllusError } from '@pagopa/mui-italia';
import { Grid, Box, Typography, Button } from '@mui/material';
import { useContext, useEffect } from 'react';
import { resolvePathVariables } from '@pagopa/selfcare-common-frontend/lib/utils/routes-utils';
import { Trans, useTranslation } from 'react-i18next';
import { AxiosError, AxiosResponse } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';
import { fetchWithLogs } from '../../../lib/api-utils';
import { UserContext } from '../../../lib/context';
import { getFetchOutcome } from '../../../lib/error-utils';
import { ENV } from '../../../utils/env';
import { Problem, Product, SelfcareParty } from '../../../../types';

type Props = {
  product?: Product;
  subProduct?: Product;
  productId: string;
};

export default function SubProductStepUserUnrelated({ product, subProduct, productId }: Props) {
  const history = useHistory();
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();

  useEffect(() => {
    trackEvent('ONBOARDING_PREMIUM_JOIN_NOT_ALLOWED');
  }, []);

  const onExitPremiumFlow = async () => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_USER_PARTIES' },
      { method: 'GET' },
      () => setRequiredLogin(true)
    );
    const outcome = getFetchOutcome(searchResponse);
    const response = (searchResponse as AxiosResponse).data as Array<SelfcareParty>;
    if (outcome === 'success' && response.length > 0) {
      window.location.assign(ENV.URL_FE.DASHBOARD);
    } else if (outcome === 'success' && response.length === 0) {
      window.location.assign('https://www.pagopa.it/it/prodotti-e-servizi/app-io');
    } else {
      const errorBody = (searchResponse as AxiosError<Problem>).response?.data;
      trackEvent('ONBOARDING_REDIRECT_TO_ONBOARDING_FAILURE', {
        product_id: productId,
        reason: errorBody?.detail,
      });
    }
  };

  const onButtonGoTo = () => {
    history.push(resolvePathVariables(ROUTES.ONBOARDING_PRODUCT.PATH, { productId }));
  };

  return (
    <Box sx={{ minHeight: '52vh', position: 'static' }} display="flex" flexGrow={1}>
      <Grid container direction="column" key="0" style={{ textAlign: 'center' }} margin={'auto'}>
        <Grid container item justifyContent="center" mb={3}>
          <Grid item xs={6}>
            <IllusError size={60} />
          </Grid>
        </Grid>
        <Grid container item justifyContent="center">
          <Grid item xs={6}>
            <Typography variant={'h4'}>
              <Trans
                i18nKey="onboardingSubProduct.subProductStepUserUnrelated.title"
                values={{ selectedProduct: subProduct?.title }}
              >
                {`Non puoi aderire a {{selectedProduct}}`}
              </Trans>
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center" mb={4} mt={2}>
          <Grid item xs={6}>
            <Typography variant={'body1'}>
              <Trans
                i18nKey="onboardingSubProduct.subProductStepUserUnrelated.description"
                values={{ selectedProduct: product?.title }}
                components={{ 3: <br />, 5: <br />, 7: <br /> }}
              >
                {`Il tuo ente non ha aderito ad <strong>{{selectedProduct}}</strong>, o non hai un ruolo per <1/>gestire il prodotto. <3/> Chiedi ad un Amministratore di aggiungerti nella sezione <5/>Utenti, oppure richiedi l’adesione ad <strong>{{selectedProduct}}</strong> per il tuo ente.`}
              </Trans>
            </Typography>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center">
          <Box>
            <Button
              variant="outlined"
              sx={{ alignSelf: 'center', mr: 2 }}
              onClick={onExitPremiumFlow}
            >
              {t('onboardingSubProduct.subProductStepUserUnrelated.backHomeLabelBtn')}
            </Button>
          </Box>
          <Box>
            <Button variant="contained" sx={{ alignSelf: 'center' }} onClick={onButtonGoTo}>
              {t('onboardingSubProduct.subProductStepUserUnrelated.goToBtnLabel')}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
