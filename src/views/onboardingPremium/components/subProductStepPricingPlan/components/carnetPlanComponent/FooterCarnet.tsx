import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box, useTheme, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { useState } from 'react';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { StepperStepComponentProps } from '../../../../../../../types';
import { CarnetPlan } from '../../../../../../model/PlansPrices';

type Props = StepperStepComponentProps & {
  discount: boolean;
  carnetPlans?: Array<CarnetPlan>;
};

export default function FooterCarnet({ carnetPlans, forward, discount }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();

  const [isPricingPlanSelected, setIsPricingPlanSelected] = useState<boolean>(false);
  const [pricingPlanSelected, setPricingPlanSelected] = useState<string>('');
  const [openCarnetCard, setOpenCarnetCard] = useState<boolean>();

  const handleExpandClick = () => {
    setExpanded(!expanded);
    if (!expanded) {
      trackEvent('PREMIUM_SHOW_CARNET');
    }
  };

  const setPpFunction = (pp: string) => {
    setPricingPlanSelected(pp);
  };

  const onForwardAction = () => {
    forward(pricingPlanSelected);
    trackEvent('PREMIUM_ATTIVATION_START', {
      selected_plan: 'carnet',
    });
  };

  return (
    <>
      <Card
        sx={{
          width: '530px',
          borderRadius: '0px 0px 16px 16px',
          mt: '1px',
          p: '0px',
        }}
      >
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ height: '100%' }}>
            <RadioGroup name="radio-buttons-group">
              {carnetPlans?.map((cp, index) => (
                <Box
                  key={index}
                  width={'100%'}
                  height={'87px'}
                  sx={{
                    border: '1px solid #E3E7EB',
                    borderRadius: '8px',
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 2,
                  }}
                >
                  <FormControlLabel
                    id={cp.pricingPlan}
                    onClick={() => {
                      setIsPricingPlanSelected(true);
                      setPpFunction(cp.pricingPlan);
                    }}
                    value={cp.pricingPlan}
                    control={<Radio />}
                    label={
                      <Typography variant="h6">
                        <Trans
                          i18nKey={
                            discount
                              ? 'onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithScount.c1'
                              : 'onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithoutScount.c1'
                          }
                        >
                          {cp.messages}
                          <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                            {' '.concat('mess')}
                          </Typography>
                          <br />
                          {discount ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,165 €/mess
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {cp.messagePrice.concat(' €/mess')}
                            </Typography>
                          )}
                        </Trans>
                      </Typography>
                    }
                  />
                  <Box display={'flex'} alignItems="flex-end">
                    {discount && (
                      <Box display={'flex'} alignSelf="flex-end">
                        <Typography pr={1} sx={{ color: 'text.secondary' }}>
                          <s>
                            {t(
                              'onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscount.c1'
                            )}
                          </s>
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      {discount ? (
                        <Trans i18nKey="onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscounted.c1">
                          <span
                            style={{
                              color: '#0073E6',
                              fontSize: '32px',
                              fontWeight: '700',
                            }}
                          >
                            165,
                          </span>
                          <span
                            style={{
                              color: '#0073E6',
                              fontSize: '16px',
                              fontWeight: '700',
                            }}
                          >
                            00 €
                          </span>
                        </Trans>
                      ) : (
                        <Trans i18nKey="onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValues.c1">
                          <span
                            style={{
                              color: '#0073E6',
                              fontSize: '32px',
                              fontWeight: '700',
                            }}
                          >
                            {cp.carnetPrice.slice(0, -2).trimEnd()}
                          </span>
                          <span
                            style={{
                              color: '#0073E6',
                              fontSize: '16px',
                              fontWeight: '700',
                            }}
                          >
                            {' '.concat(cp.carnetPrice.slice(-2).concat(' €'))}
                          </span>
                        </Trans>
                      )}

                      {discount && (
                        <Box
                          width={'99px'}
                          height={'22px'}
                          sx={{
                            backgroundColor: 'warning.main',
                            borderRadius: theme.spacing(0.5),
                          }}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Typography variant="subtitle2">
                            {t(
                              'onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsDiscount.c1'
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textAlign: 'center', display: 'flex', mt: 3 }}
                >
                  {t('onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.description')}
                </Typography>
              </Box>

              {/* forward action with pricing plan */}
              <Box mt={3} display="flex" justifyContent={'center'}>
                <Button
                  id="forwardCarnetPlan"
                  disabled={!isPricingPlanSelected || pricingPlanSelected === ''}
                  variant="contained"
                  onClick={onForwardAction}
                >
                  {t(
                    'onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.btnActionLabel'
                  )}
                </Button>
              </Box>
            </RadioGroup>
          </CardContent>
        </Collapse>
        <CardActions
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: 1,
            borderTop: '1px solid #E3E7EB',
          }}
        >
          <Button
            id="showMoreCarnetPlan"
            size="small"
            onClick={() => {
              handleExpandClick();
              setOpenCarnetCard(!openCarnetCard);
              setPpFunction('');
            }}
            sx={{ ':hover': { backgroundColor: 'transparent' } }}
          >
            {openCarnetCard ? (
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontWeight: 'fontWeightBold' }}
              >
                {t('onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.showLess')}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontWeight: 'fontWeightBold' }}
              >
                {t('onboardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.showMore')}
              </Typography>
            )}
          </Button>
        </CardActions>
      </Card>
    </>
  );
}
