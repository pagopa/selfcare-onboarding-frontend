import { IllusError } from '@pagopa/mui-italia';
import { Grid, Box, Typography, Button } from '@mui/material';
import { useContext } from 'react';
import { resolvePathVariables } from '@pagopa/selfcare-common-frontend/utils/routes-utils';
import { Trans, useTranslation } from 'react-i18next';
import { AxiosResponse } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';
import { fetchWithLogs } from '../../../lib/api-utils';
import { UserContext } from '../../../lib/context';
import { getFetchOutcome } from '../../../lib/error-utils';
import { ENV } from '../../../utils/env';
import { Product, SelfcareParty } from '../../../../types';

type Props = {
  product?: Product;
  productId: string;
};

export default function SubProductStepUserUnrelated({ product, productId }: Props) {
  const history = useHistory();
  const { setRequiredLogin } = useContext(UserContext);
  const { t } = useTranslation();

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
      trackEvent('ONBOARDING_REDIRECT_TO_ONBOARDING_FAILURE', { product_id: productId });
    }
  };

  const onButtonGoTo = () => {
    history.push(resolvePathVariables(ROUTES.ONBOARDING.PATH, { productId }));
  };

  console.log('prodTitle', product?.title, 'productId', productId);
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
              <Trans i18nKey="onBoardingSubProduct.subProductStepUserUnrelated.title">
                Non puoi aderire a {{ selectedProduct: product?.title }}Premium
              </Trans>
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center" mb={4} mt={1}>
          <Grid item xs={6}>
            <Typography variant={'body1'}>
              <Trans i18nKey="onBoardingSubProduct.subProductStepUserUnrelated.title.description">
                Il tuo ente non ha aderito ad {{ selectedProduct: product?.title }}, o non hai un
                ruolo per gestire il prodotto. <br /> Chiedi ad un Amministratore di aggiungerti
                nella sezione Utenti, oppure richiedi l’adesione ad{' '}
                {{ selectedProduct: product?.title }} per il tuo ente.
              </Trans>
            </Typography>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center">
          <Box>
            <Button
              variant="outlined"
              sx={{ alignSelf: 'center', mr: 1 }}
              onClick={onExitPremiumFlow}
            >
              {t('onBoardingSubProduct.subProductStepUserUnrelated.backHomeLabelBtn')}
            </Button>
          </Box>
          <Box>
            <Button variant="contained" sx={{ alignSelf: 'center' }} onClick={onButtonGoTo}>
              {t('onBoardingSubProduct.subProductStepUserUnrelated.goToBtnLabel')}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
