import { useContext, useState } from 'react';
import { Typography, useTheme, Grid } from '@mui/material';
import { Box } from '@mui/system';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { useTranslation, Trans } from 'react-i18next';
import Button from '@mui/material/Button';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { AxiosResponse } from 'axios';
import { ENV } from '../../../../utils/env';
import { fetchWithLogs } from '../../../../lib/api-utils';
import { getFetchOutcome } from '../../../../lib/error-utils';
import { UserContext } from '../../../../lib/context';
import { Product, SelfcareParty, StepperStepComponentProps } from '../../../../../types';
import FooterCarnet from './components/carnetPlanComponent/FooterCarnet';
import FooterConsumptionCard from './components/consumptionPlanComponent/FooterConsumptionCard';
import HeaderPlanCard from './components/HeaderPlanCard';

type Props = StepperStepComponentProps & {
  product?: Product;
};
export default function SubProductStepSelectPricingPlan({ forward, product }: Props) {
  const discount = true;
  const { t } = useTranslation();
  const theme = useTheme();
  const { setRequiredLogin } = useContext(UserContext);

  const [openExitModal, setOpenExitModal] = useState<boolean>(false);
  const onReject = () => {
    setOpenExitModal(true);
  };
  const handleClose = () => {
    setOpenExitModal(false);
  };

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
      trackEvent('ONBOARDING_REDIRECT_TO_ONBOARDING_FAILURE', { product_id: product?.id });
    }
    setOpenExitModal(false);
  };

  return (
    <>
      <Box width={'100%'} sx={{ backgroundColor: 'primary.main' }} mt={'-88px'}>
        <Grid
          container
          direction={'column'}
          alignContent={'centr'}
          sx={{ alignContent: 'center' }}
          alignItems="center"
        >
          {/* discount banner */}
          <Grid item xs={12} mt={8}>
            {discount ? (
              <Box
                width={'326px'}
                height={'41px'}
                sx={{
                  backgroundColor: 'warning.main',
                  borderRadius: theme.spacing(0.5),
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="subtitle2">
                  {t('onBoardingSubProduct.subProductStepSelectPricingPlan.discountLabelData')}{' '}
                </Typography>
              </Box>
            ) : (
              <Box height={'41px'}></Box>
            )}
          </Grid>
          {/* title section */}
          <Grid item xs={4} mt={3} display="flex" justifyContent="center" maxWidth={'100%'}>
            <Typography
              variant="h2"
              display={'flex'}
              justifyContent="center"
              alignContent={'center'}
              color="white"
              textAlign="center"
            >
              <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.title">
                Passa a IO Premium e migliora le <br /> performance dei messaggi
              </Trans>
            </Typography>
          </Grid>
          {/* check section */}
          <Grid container item xs={4} mt={3} maxWidth={'100%'} direction="column">
            <Box display={'flex'} justifyContent="center">
              <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
              <Typography pl={1} fontSize="fontSize" color={'white'}>
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.firstCheckLabel')}
              </Typography>
            </Box>
            <Box display={'flex'} justifyContent="center" pt={1}>
              <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
              <Typography pl={1} fontSize="fontSize" color={'white'}>
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.secondCheckLabel')}
              </Typography>
            </Box>
            <Box display={'flex'} justifyContent="center" pt={1}>
              <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
              <Typography pl={1} fontSize="fontSize" color={'white'}>
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.thirdCheckLabel')}
              </Typography>
            </Box>
          </Grid>
          {/* info section */}
          <Grid container item justifyContent={'center'} mt={4} mb={5}>
            <Grid item xs={7}>
              <Typography fontSize={'fontSize'} color="white" textAlign={'center'}>
                <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.infoSectionLabel">
                  Se il tuo ente ha già aderito ad app IO, scegli qual è il piano che più soddisfa
                  le sue esigenze. <br /> Il piano a carnet è attivabile una sola volta. Una volta
                  terminato il numero di messaggi del piano a <br /> carnet, si attiverà
                  automaticamente il piano a consumo.
                </Trans>
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent={'center'}>
            <Box mr={3} sx={{ borderRadius: '16px' }}>
              {/* <HeaderCarnetCard discount={discount} /> */}
              <HeaderPlanCard
                discount={discount}
                caption={t(
                  'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.caption'
                )}
                discountBoxLabel={t(
                  'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.discountBoxLabel'
                )}
                title={t('onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.title')}
                firstNumberBeforeComma={'0,'}
                firstNumberAfterComma={discount ? '15€' : '20€'}
                secondNumberBeforeComma={'0,'}
                secondNumberAfterComma={discount ? '165€' : '22€'}
                carnetPlan={true}
              />
            </Box>
            <Box mr={3} sx={{ borderRadius: '16px' }}>
              <HeaderPlanCard
                discount={discount}
                caption={t(
                  'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.caption'
                )}
                discountBoxLabel={t(
                  'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.discountBoxLabel'
                )}
                title={
                  <Trans
                    i18nKey={
                      'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.title'
                    }
                  >
                    Scegli di pagare solo i messaggi <br /> effettivi che invii
                  </Trans>
                }
                firstNumberBeforeComma={'0,'}
                firstNumberAfterComma={discount ? '15€' : '20€'}
                secondNumberBeforeComma={'0,'}
                secondNumberAfterComma={discount ? '187€' : '25€'}
                carnetPlan={false}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Grid container item justifyContent={'center'}>
          <Box mr={3} sx={{ borderRadius: '16px' }}>
            <FooterCarnet forward={forward} discount={discount} />
          </Box>
          <Box mr={3} sx={{ borderRadius: '16px' }}>
            <FooterConsumptionCard forward={forward} discount={discount} />
          </Box>
        </Grid>
        {/* forward action */}
        <Grid item display={'flex'} justifyContent="center">
          <Button
            onClick={() => onReject()}
            sx={{ mt: 5, ':hover': { backgroundColor: 'transparent' } }}
            disableRipple
          >
            {t('onBoardingSubProduct.subProductStepSelectPricingPlan.btnRejectLabel')}
          </Button>
        </Grid>
        <SessionModal
          open={openExitModal}
          title={t(
            'onBoardingSubProduct.subProductStepSelectPricingPlan.pricingPlanExitModal.title'
          )}
          message={t(
            'onBoardingSubProduct.subProductStepSelectPricingPlan.pricingPlanExitModal.subtitle'
          )}
          onConfirmLabel={t(
            'onBoardingSubProduct.subProductStepSelectPricingPlan.pricingPlanExitModal.closeBtnLabel'
          )}
          onCloseLabel={t(
            'onBoardingSubProduct.subProductStepSelectPricingPlan.pricingPlanExitModal.confirmBtnLabel'
          )}
          onConfirm={onExitPremiumFlow}
          handleClose={handleClose}
        />
      </Box>
    </>
  );
}
