import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box, useTheme } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { StepperStepComponentProps } from '../../../../../../../types';

type Props = StepperStepComponentProps & {
  discount: boolean;
};
export default function FooterConsumptionCard({ forward, discount }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const { t } = useTranslation();
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const theme = useTheme();
  const [openRangeCard, setOpenRangeCard] = React.useState<boolean>();

  const fontMediumBlueBold = {
    color: '#0073E6',
    fontSize: '32px',
    fontWeight: '700',
  };
  const fontSmallBlueBold = {
    color: '#0073E6',
    fontSize: '16px',
    fontWeight: '700',
  };
  const cardWidth = '530px';

  const onForwardAction = () => {
    forward('C0');
  };
  return (
    <>
      <Card
        sx={{
          width: cardWidth,
          borderRadius: '0px 0px 16px 16px',
          mt: '1px',
          p: '0px',
        }}
      >
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ height: '100%' }}>
            {/* range 1 */}
            <Box display={'flex'} justifyContent="space-between" alignItems={'center'} mt={2}>
              <Box>
                <Trans
                  i18nKey={
                    'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeLabelsWithScount.r1'
                  }
                >
                  <Typography variant="h6">
                    Da 1 a <br /> 100.000 <span style={{ fontSize: '16px' }}>mess</span>
                  </Typography>
                </Trans>
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
                    <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValuesDiscounted.r1">
                      <span style={fontMediumBlueBold}>0,</span>
                      <span style={fontSmallBlueBold}> 187 € / mess</span>
                    </Trans>
                  ) : (
                    <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValues.r1">
                      <span style={fontMediumBlueBold}>0,</span>
                      <span style={fontSmallBlueBold}> 25 € / mess </span>
                    </Trans>
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
            {/* range 2 */}
            <Box display={'flex'} justifyContent="space-between" alignItems={'center'} mt={5}>
              <Box>
                <Trans
                  i18nKey={
                    'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeLabelsWithScount.r2'
                  }
                >
                  <Typography variant="h6">
                    Da 100.001 a <br /> 500.000 <span style={{ fontSize: '16px' }}>mess</span>
                  </Typography>
                </Trans>
              </Box>
              <Box display={'flex'} alignItems="flex-end">
                {discount && (
                  <Box display={'flex'} alignSelf="flex-end">
                    <Typography pr={1} sx={{ color: 'text.secondary' }}>
                      <s>
                        {t(
                          'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValuesDiscount.r2'
                        )}
                      </s>
                    </Typography>
                  </Box>
                )}
                <Box>
                  {discount ? (
                    <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValuesDiscounted.r2">
                      <span style={fontMediumBlueBold}>0,</span>
                      <span style={fontSmallBlueBold}> 18 € / mess</span>
                    </Trans>
                  ) : (
                    <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValues.r2">
                      <span style={fontMediumBlueBold}>0,</span>
                      <span style={fontSmallBlueBold}> 24 € / mess </span>
                    </Trans>
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
            {/* range 3 */}
            <Box display={'flex'} justifyContent="space-between" alignItems={'center'} mt={5}>
              <Box>
                <Trans
                  i18nKey={
                    'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeLabelsWithScount.r3'
                  }
                >
                  <Typography variant="h6">
                    Da 500.001 a <br /> 1.000.000 <span style={{ fontSize: '16px' }}>mess</span>
                  </Typography>
                </Trans>
              </Box>
              <Box display={'flex'} alignItems="flex-end">
                {discount && (
                  <Box display={'flex'} alignSelf="flex-end">
                    <Typography pr={1} sx={{ color: 'text.secondary' }}>
                      <s>
                        {t(
                          'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValuesDiscount.r3'
                        )}
                      </s>
                    </Typography>
                  </Box>
                )}
                <Box>
                  {discount ? (
                    <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValuesDiscounted.r3">
                      <span style={fontMediumBlueBold}>0,</span>
                      <span style={fontSmallBlueBold}> 165 € / mess</span>
                    </Trans>
                  ) : (
                    <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValues.r3">
                      <span style={fontMediumBlueBold}>0,</span>
                      <span style={fontSmallBlueBold}> 22 € / mess </span>
                    </Trans>
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
            {/* range 4 */}
            <Box display={'flex'} justifyContent="space-between" alignItems={'center'} mt={5}>
              <Box>
                <Trans
                  i18nKey={
                    'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeLabelsWithScount.r4'
                  }
                >
                  <Typography variant="h6">
                    Oltre <br /> 1.000.000 <span style={{ fontSize: '16px' }}>mess</span>
                  </Typography>
                </Trans>
              </Box>
              <Box display={'flex'} alignItems="flex-end">
                {discount && (
                  <Box display={'flex'} alignSelf="flex-end">
                    <Typography pr={1} sx={{ color: 'text.secondary' }}>
                      <s>
                        {t(
                          'onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValuesDiscount.r4'
                        )}
                      </s>
                    </Typography>
                  </Box>
                )}
                <Box>
                  {discount ? (
                    <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValuesDiscounted.r4">
                      <span style={fontMediumBlueBold}>0,</span>
                      <span style={fontSmallBlueBold}> 15 € / mess</span>
                    </Trans>
                  ) : (
                    <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.consumptionPlan.rangeValues.r4">
                      <span style={fontMediumBlueBold}>0,</span>
                      <span style={fontSmallBlueBold}> 20 € / mess </span>
                    </Trans>
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
