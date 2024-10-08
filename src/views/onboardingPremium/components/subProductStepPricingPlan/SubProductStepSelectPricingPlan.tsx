import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Grid, Typography, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosError, AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Problem, Product, SelfcareParty, StepperStepComponentProps } from '../../../../../types';
import { fetchWithLogs } from '../../../../lib/api-utils';
import { UserContext } from '../../../../lib/context';
import { getFetchOutcome } from '../../../../lib/error-utils';
import { ENV } from '../../../../utils/env';
import { PlansPrices } from '../../../../model/PlansPrices';
import HeaderPlanCard from './components/HeaderPlanCard';
import FooterCarnet from './components/carnetPlanComponent/FooterCarnet';
import FooterConsumptionCard from './components/consumptionPlanComponent/FooterConsumptionCard';

type Props = StepperStepComponentProps & {
  product?: Product;
  setAvailablePricingPlanIds: React.Dispatch<React.SetStateAction<Array<string> | undefined>>;
};

export default function SubProductStepSelectPricingPlan({
  forward,
  product,
  setAvailablePricingPlanIds,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setRequiredLogin } = useContext(UserContext);

  const [openExitModal, setOpenExitModal] = useState<boolean>(false);
  const [plansPrices, setPlansPrices] = useState<PlansPrices>();

  useEffect(() => {
    if (plansPrices) {
      const pricingPlanIds = plansPrices?.carnetPlans
        .map((p) => p.pricingPlan)
        .concat(plansPrices.consumptionPlan.pricingPlan);
      setAvailablePricingPlanIds(pricingPlanIds);
    }
  }, [plansPrices]);

  const onReject = () => {
    setOpenExitModal(true);
  };
  const handleClose = () => {
    setOpenExitModal(false);
  };

  const onExitPremiumFlow = async () => {
    trackEvent('PREMIUM_USER EXIT');
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
        product_id: product?.id,
        reason: errorBody?.detail,
      });
    }
    setOpenExitModal(false);
  };

  const retrievePlanPrices = async () => {
    try {
      const response = await fetch(ENV.JSON_URL.PLAN_PRICES);
      const res = await response.json();
      setPlansPrices(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void retrievePlanPrices();
    trackEvent('PREMIUM_LANDING VIEW');
  }, []);

  const discount = false;

  const minCarnetMessagePrice = plansPrices?.carnetPlans
    ? plansPrices.carnetPlans
        .reduce((minPrice, cp) => {
          const currentPrice = Number(cp.messagePrice.replace(',', '.'));
          return currentPrice < minPrice ? currentPrice : minPrice;
        }, Infinity)
        .toString()
        .replace('.', ',')
    : '';

  const maxCarnetMessagePrice = plansPrices?.carnetPlans
    ? plansPrices.carnetPlans
        .reduce((maxPrice, cp) => {
          const currentPrice = Number(cp.messagePrice.replace(',', '.'));
          return currentPrice > maxPrice ? currentPrice : maxPrice;
        }, 0)
        .toString()
        .replace('.', ',')
    : '';

  const minConsumptionMessagePrice = plansPrices?.consumptionPlan.echelons
    ? plansPrices.consumptionPlan.echelons
        .reduce((minPrice, cp) => {
          const currentPrice = Number(cp.price.replace(',', '.'));
          return currentPrice < minPrice ? currentPrice : minPrice;
        }, Infinity)
        .toString()
        .replace('.', ',')
    : '';

  const maxConsumptionMessagePrice = plansPrices?.consumptionPlan.echelons
    ? plansPrices.consumptionPlan.echelons
        .reduce((maxPrice, cp) => {
          const currentPrice = Number(cp.price.replace(',', '.'));
          return currentPrice > maxPrice ? currentPrice : maxPrice;
        }, 0)
        .toString()
        .replace('.', ',')
    : '';

  const carnetCount = plansPrices?.carnetPlans.length;

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
                  {t('onboardingSubProduct.subProductStepSelectPricingPlan.discountLabelData')}{' '}
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
              <Trans i18nKey="onboardingSubProduct.subProductStepSelectPricingPlan.title">
                Passa a IO Premium e migliora le <br /> performance dei messaggi
              </Trans>
            </Typography>
          </Grid>
          {/* check section */}
          <Grid container item xs={4} mt={3} maxWidth={'100%'} direction="column">
            <Box display={'flex'} justifyContent="center">
              <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
              <Typography pl={1} fontSize="fontSize" color={'white'}>
                {t('onboardingSubProduct.subProductStepSelectPricingPlan.firstCheckLabel')}
              </Typography>
            </Box>
            <Box display={'flex'} justifyContent="center" pt={1}>
              <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
              <Typography pl={1} fontSize="fontSize" color={'white'}>
                {t('onboardingSubProduct.subProductStepSelectPricingPlan.secondCheckLabel')}
              </Typography>
            </Box>
            <Box display={'flex'} justifyContent="center" pt={1}>
              <CheckCircleIcon style={{ color: 'white' }} fontSize="small" />
              <Typography pl={1} fontSize="fontSize" color={'white'}>
                {t('onboardingSubProduct.subProductStepSelectPricingPlan.thirdCheckLabel')}
              </Typography>
            </Box>
          </Grid>
          {/* info section */}
          <Grid container item justifyContent={'center'} mt={4} mb={5}>
            <Grid item xs={7}>
              <Typography fontSize={'fontSize'} color="white" textAlign={'center'}>
                <Trans i18nKey="onboardingSubProduct.subProductStepSelectPricingPlan.infoSectionLabel">
                  Se il tuo ente ha già aderito ad IO, scegli qual è il piano che più soddisfa
                  le sue esigenze. <br /> Il piano a carnet è attivabile una sola volta. Una volta
                  terminato il numero di messaggi del piano a <br /> carnet, si attiverà
                  automaticamente il piano a consumo.
                </Trans>
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent={'center'}>
            <Box mr={3} sx={{ borderRadius: '16px' }}>
              <HeaderPlanCard
                discount={discount}
                caption={t(
                  'onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.caption'
                )}
                discountBoxLabel={t(
                  'onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.discountBoxLabel'
                )}
                title={t('onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.title', {
                  carnetCount,
                })}
                minCarnetMessagePrice={minCarnetMessagePrice}
                maxCarnetMessagePrice={maxCarnetMessagePrice}
                minConsumptionMessagePrice={minConsumptionMessagePrice}
                maxConsumptionMessagePrice={maxConsumptionMessagePrice}
                isCarnetPlans={true}
              />
            </Box>
            <Box mr={3} sx={{ borderRadius: '16px' }}>
              <HeaderPlanCard
                discount={discount}
                caption={t(
                  'onboardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.caption'
                )}
                discountBoxLabel={t(
                  'onboardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.discountBoxLabel'
                )}
                title={
                  <Trans
                    i18nKey={
                      'onboardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.title'
                    }
                  >
                    Scegli di pagare solo i messaggi <br /> effettivi che invii
                  </Trans>
                }
                minCarnetMessagePrice={minCarnetMessagePrice}
                maxCarnetMessagePrice={maxCarnetMessagePrice}
                minConsumptionMessagePrice={minConsumptionMessagePrice}
                maxConsumptionMessagePrice={maxConsumptionMessagePrice}
                isCarnetPlans={false}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Grid container item justifyContent={'center'}>
          <Box mr={3} sx={{ borderRadius: '16px' }}>
            <FooterCarnet
              carnetPlans={plansPrices?.carnetPlans}
              forward={forward}
              discount={discount}
            />
          </Box>
          <Box mr={3} sx={{ borderRadius: '16px' }}>
            <FooterConsumptionCard
              pricingPlan={plansPrices?.consumptionPlan.pricingPlan}
              consumptionPlan={plansPrices?.consumptionPlan.echelons}
              forward={forward}
              discount={discount}
            />
          </Box>
        </Grid>
        {/* forward action */}
        <Grid item display={'flex'} justifyContent="center">
          <Button
            onClick={() => onReject()}
            sx={{ mt: 5, ':hover': { backgroundColor: 'transparent' } }}
            disableRipple
          >
            {t('onboardingSubProduct.subProductStepSelectPricingPlan.btnRejectLabel')}
          </Button>
        </Grid>
        <SessionModal
          open={openExitModal}
          title={t(
            'onboardingSubProduct.subProductStepSelectPricingPlan.pricingPlanExitModal.title'
          )}
          message={t(
            'onboardingSubProduct.subProductStepSelectPricingPlan.pricingPlanExitModal.subtitle'
          )}
          onConfirmLabel={t(
            'onboardingSubProduct.subProductStepSelectPricingPlan.pricingPlanExitModal.closeBtnLabel'
          )}
          onCloseLabel={t(
            'onboardingSubProduct.subProductStepSelectPricingPlan.pricingPlanExitModal.confirmBtnLabel'
          )}
          onConfirm={onExitPremiumFlow}
          handleClose={handleClose}
        />
      </Box>
    </>
  );
}
