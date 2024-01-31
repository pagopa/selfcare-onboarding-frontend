import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { StepperStepComponentProps } from '../../../../../../../types';
import { Echelon } from '../../../../../../model/PlansPrices';

type Props = StepperStepComponentProps & {
  discount: boolean;
  consumptionPlan?: Array<Echelon>;
  pricingPlan?: string;
};

export default function FooterConsumptionCard({
  consumptionPlan,
  pricingPlan,
  forward,
  discount,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);
  const [openRangeCard, setOpenRangeCard] = useState<boolean>();

  const handleExpandClick = () => {
    setExpanded(!expanded);
    if (!expanded) {
      trackEvent('PREMIUM_SHOW_CONSUMO');
    }
  };

  const onForwardAction = () => {
    forward(pricingPlan);
    trackEvent('PREMIUM_ATTIVATION_START', {
      selected_plan: 'consumo',
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
            {consumptionPlan?.map((cp, index) => (
              <Box
                key={index}
                display={'flex'}
                justifyContent="space-between"
                alignItems={'center'}
                mt={index === 0 ? 2 : 5}
              >
                <Box>
                  {consumptionPlan.length - 1 !== index ? (
                    <Typography variant="h6" height={'55px'}>
                      {t(
                        'onBoardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.from'
                      )}{' '}
                      {cp.from}{' '}
                      {t('onBoardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.to')}{' '}
                      <br /> {cp.to} <span style={{ fontSize: '16px' }}>mess</span>
                    </Typography>
                  ) : (
                    <Typography variant="h6" height={'55px'}>
                      {t(
                        'onBoardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.beyond'
                      )}{' '}
                      <br /> {cp.from}
                    </Typography>
                  )}
                </Box>
                <Box display={'flex'} alignItems="flex-end">
                  {discount && (
                    <Box display={'flex'} alignSelf="flex-end">
                      <Typography pr={1} sx={{ color: 'text.secondary' }}>
                        <s>
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValuesDiscount.r1'
                          )}
                        </s>
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    {discount ? (
                      <>
                        <span
                          style={{
                            color: '#0073E6',
                            fontSize: '32px',
                            fontWeight: '700',
                          }}
                        >
                          0,
                        </span>
                        <span
                          style={{
                            color: '#0073E6',
                            fontSize: '16px',
                            fontWeight: '700',
                          }}
                        >
                          187 € / mess
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          style={{
                            color: '#0073E6',
                            fontSize: '32px',
                            fontWeight: '700',
                          }}
                        >
                          {cp.price.slice(0).substring(0, 1).concat(',')}
                        </span>
                        <span
                          style={{
                            color: '#0073E6',
                            fontSize: '16px',
                            fontWeight: '700',
                          }}
                        >
                          {' '.concat(cp.price.slice(-2)).concat('€ / mess')}
                        </span>
                      </>
                    )}

                    {discount && (
                      <Box
                        width={'99px'}
                        height={'22px'}
                        sx={{
                          backgroundColor: 'warning.main',
                          borderRadius: theme.spacing(0.5),
                          width: '100%',
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="subtitle2">
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeLabelsDiscount'
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}

            <Box display={'flex'} justifyContent={'center'}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', textAlign: 'center', display: 'flex', mt: 3 }}
              >
                {t(
                  'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.description'
                )}
              </Typography>
            </Box>

            {/* forward action with pricing plan */}
            <Box mt={3} display="flex" justifyContent={'center'}>
              <Button variant="contained" onClick={onForwardAction} id={'forwardConsumptionPlan'}>
                {t(
                  'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.btnActionLabel'
                )}
              </Button>
            </Box>
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
            id="showMoreConsumptionPlan"
            size="small"
            onClick={() => {
              handleExpandClick();
              setOpenRangeCard(!openRangeCard);
            }}
            sx={{ ':hover': { backgroundColor: 'transparent' } }}
          >
            {openRangeCard ? (
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontWeight: 'fontWeightBold' }}
              >
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.showLess')}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontWeight: 'fontWeightBold' }}
              >
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.showMore')}
              </Typography>
            )}
          </Button>
        </CardActions>
      </Card>
    </>
  );
}
