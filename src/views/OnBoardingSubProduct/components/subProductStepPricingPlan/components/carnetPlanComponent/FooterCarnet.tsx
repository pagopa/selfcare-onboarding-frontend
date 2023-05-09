import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box, useTheme, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { StepperStepComponentProps } from '../../../../../../../types';

type Props = StepperStepComponentProps & {
  discount: boolean;
};
// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
export default function FooterCarnet({ forward, discount }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const { t } = useTranslation();
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const theme = useTheme();
  const [isPricingPlanSelected, setIsPricingPlanSelected] = React.useState<boolean>(false);
  const [pricingPlanSelected, setPricingPlanSelected] = React.useState<string>('');
  const [openCarnetCard, setOpenCarnetCard] = React.useState<boolean>();
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
  const carnetBoxWidth = '530';

  const carnetBoxHeight = '87px';
  const carnetBoxStyle = {
    border: '1px solid #E3E7EB',
    borderRadius: '8px',
    mb: 1,
    display: 'flex',
    justifyContent: 'space-between',
    padding: 2,
  };

  const setPpFunction = (pp: string) => {
    setPricingPlanSelected(pp);
  };
  const onForwardAction = () => {
    forward(pricingPlanSelected);
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
            <RadioGroup name="radio-buttons-group">
              {/* C1 */}
              <Box width={carnetBoxWidth} height={carnetBoxHeight} sx={carnetBoxStyle}>
                <Box>
                  <FormControlLabel
                    onClick={() => {
                      setIsPricingPlanSelected(true);
                      setPpFunction('C1');
                    }}
                    value="C1"
                    control={<Radio />}
                    label={
                      <Typography variant="h6">
                        <Trans
                          i18nKey={
                            discount
                              ? 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithScount.c1'
                              : 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithoutScount.c1'
                          }
                        >
                          1.000
                          <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                            mess
                          </Typography>
                          <br />
                          {discount ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,165 €/mess
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,22 €/mess
                            </Typography>
                          )}
                        </Trans>
                      </Typography>
                    }
                  />
                </Box>
                <Box display={'flex'} alignItems="flex-end">
                  {discount && (
                    <Box display={'flex'} alignSelf="flex-end">
                      <Typography pr={1} sx={{ color: 'text.secondary' }}>
                        <s>
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscount.c1'
                          )}
                        </s>
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    {discount ? (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscounted.c1">
                        <span style={fontMediumBlueBold}>165,</span>
                        <span style={fontSmallBlueBold}> 00 € </span>
                      </Trans>
                    ) : (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValues.c1">
                        <span style={fontMediumBlueBold}>220,</span>
                        <span style={fontSmallBlueBold}> 00 € </span>
                      </Trans>
                    )}

                    {discount && (
                      <Box
                        width={'99px'}
                        height={'22px'}
                        sx={{ backgroundColor: 'warning.main', borderRadius: theme.spacing(0.5) }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="subtitle2">
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsDiscount.c1'
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              {/* C2 */}
              <Box width={carnetBoxWidth} height={carnetBoxHeight} sx={carnetBoxStyle}>
                <Box>
                  <FormControlLabel
                    onClick={() => {
                      setIsPricingPlanSelected(true);
                      setPpFunction('C2');
                    }}
                    value="C2"
                    control={<Radio />}
                    label={
                      <Typography variant="h6">
                        <Trans
                          i18nKey={
                            discount
                              ? 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithScount.c2'
                              : 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithoutScount.c2'
                          }
                        >
                          10.000
                          <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                            mess
                          </Typography>
                          <br />
                          {discount ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,163 €/mess
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,217 €/mess
                            </Typography>
                          )}
                        </Trans>
                      </Typography>
                    }
                  />
                </Box>
                <Box display={'flex'} alignItems="flex-end">
                  {discount && (
                    <Box display={'flex'} alignSelf="flex-end">
                      <Typography pr={1} sx={{ color: 'text.secondary' }}>
                        <s>
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscount.c2'
                          )}
                        </s>
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    {discount ? (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscounted.c2">
                        <span style={fontMediumBlueBold}>1.631,</span>
                        <span style={fontSmallBlueBold}> 25 € </span>
                      </Trans>
                    ) : (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValues.c2">
                        <span style={fontMediumBlueBold}>2.175,</span>
                        <span style={fontSmallBlueBold}> 25 € </span>
                      </Trans>
                    )}

                    {discount && (
                      <Box
                        width={'99px'}
                        height={'22px'}
                        sx={{
                          backgroundColor: 'warning.main',
                          borderRadius: theme.spacing(0.5),
                          p: 1,
                          width: '100%',
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="subtitle2">
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsDiscount.c2'
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              {/* C3 */}
              <Box width={carnetBoxWidth} height={carnetBoxHeight} sx={carnetBoxStyle}>
                <Box>
                  <FormControlLabel
                    onClick={() => {
                      setIsPricingPlanSelected(true);
                      setPpFunction('C3');
                    }}
                    value="C3"
                    control={<Radio />}
                    label={
                      <Typography variant="h6">
                        <Trans
                          i18nKey={
                            discount
                              ? 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithScount.c3'
                              : 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithoutScount.c3'
                          }
                        >
                          50.000
                          <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                            mess
                          </Typography>
                          <br />
                          {discount ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,161 €/mess
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,215 €/mess
                            </Typography>
                          )}
                        </Trans>
                      </Typography>
                    }
                  />
                </Box>
                <Box display={'flex'} alignItems="flex-end">
                  {discount && (
                    <Box display={'flex'} alignSelf="flex-end">
                      <Typography pr={1} sx={{ color: 'text.secondary' }}>
                        <s>
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscount.c3'
                          )}
                        </s>
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    {discount ? (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscounted.c3">
                        <span style={fontMediumBlueBold}>8.062,</span>
                        <span style={fontSmallBlueBold}> 50 € </span>
                      </Trans>
                    ) : (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValues.c3">
                        <span style={fontMediumBlueBold}>10.750,</span>
                        <span style={fontSmallBlueBold}> 50 € </span>
                      </Trans>
                    )}

                    {discount && (
                      <Box
                        width={'99px'}
                        height={'22px'}
                        sx={{
                          backgroundColor: 'warning.main',
                          borderRadius: theme.spacing(0.5),
                          p: 1,
                          width: '100%',
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="subtitle2">
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsDiscount.c3'
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              {/* C4 */}
              <Box width={carnetBoxWidth} height={carnetBoxHeight} sx={carnetBoxStyle}>
                <Box>
                  <FormControlLabel
                    onClick={() => {
                      setIsPricingPlanSelected(true);
                      setPpFunction('C4');
                    }}
                    value="C4"
                    control={<Radio />}
                    label={
                      <Typography variant="h6">
                        <Trans
                          i18nKey={
                            discount
                              ? 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithScount.c4'
                              : 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithoutScount.c4'
                          }
                        >
                          100.000
                          <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                            mess
                          </Typography>
                          <br />
                          {discount ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,159 €/mess
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,212 €/mess
                            </Typography>
                          )}
                        </Trans>
                      </Typography>
                    }
                  />
                </Box>
                <Box display={'flex'} alignItems="flex-end">
                  {discount && (
                    <Box display={'flex'} alignSelf="flex-end">
                      <Typography pr={1} sx={{ color: 'text.secondary' }}>
                        <s>
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscount.c4'
                          )}
                        </s>
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    {discount ? (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscounted.c4">
                        <span style={fontMediumBlueBold}>15.937,</span>
                        <span style={fontSmallBlueBold}> 50 € </span>
                      </Trans>
                    ) : (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValues.c4">
                        <span style={fontMediumBlueBold}>21.250,</span>
                        <span style={fontSmallBlueBold}> 50 € </span>
                      </Trans>
                    )}

                    {discount && (
                      <Box
                        width={'99px'}
                        height={'22px'}
                        sx={{
                          backgroundColor: 'warning.main',
                          borderRadius: theme.spacing(0.5),
                          p: 1,
                          width: '100%',
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="subtitle2">
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsDiscount.c4'
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              {/* C5 */}
              <Box width={carnetBoxWidth} height={carnetBoxHeight} sx={carnetBoxStyle}>
                <Box>
                  <FormControlLabel
                    onClick={() => {
                      setIsPricingPlanSelected(true);
                      setPpFunction('C5');
                    }}
                    value="C5"
                    control={<Radio />}
                    label={
                      <Typography variant="h6">
                        <Trans
                          i18nKey={
                            discount
                              ? 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithScount.c5'
                              : 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithoutScount.c5'
                          }
                        >
                          250.000
                          <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                            mess
                          </Typography>
                          <br />
                          {discount ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,157 €/mess
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,21 €/mess
                            </Typography>
                          )}
                        </Trans>
                      </Typography>
                    }
                  />
                </Box>
                <Box display={'flex'} alignItems="flex-end">
                  {discount && (
                    <Box display={'flex'} alignSelf="flex-end">
                      <Typography pr={1} sx={{ color: 'text.secondary' }}>
                        <s>
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscount.c5'
                          )}
                        </s>
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    {discount ? (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscounted.c5">
                        <span style={fontMediumBlueBold}>39.375,</span>
                        <span style={fontSmallBlueBold}> 00 € </span>
                      </Trans>
                    ) : (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValues.c5">
                        <span style={fontMediumBlueBold}>52.500,</span>
                        <span style={fontSmallBlueBold}> 00 € </span>
                      </Trans>
                    )}

                    {discount && (
                      <Box
                        width={'99px'}
                        height={'22px'}
                        sx={{
                          backgroundColor: 'warning.main',
                          borderRadius: theme.spacing(0.5),
                          p: 1,
                          width: '100%',
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="subtitle2">
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsDiscount.c5'
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              {/* C6 */}
              <Box width={carnetBoxWidth} height={carnetBoxHeight} sx={carnetBoxStyle}>
                <Box>
                  <FormControlLabel
                    onClick={() => {
                      setIsPricingPlanSelected(true);
                      setPpFunction('C6');
                    }}
                    value="C6"
                    control={<Radio />}
                    label={
                      <Typography variant="h6">
                        <Trans
                          i18nKey={
                            discount
                              ? 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithScount.c6'
                              : 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithoutScount.c6'
                          }
                        >
                          500.000
                          <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                            mess
                          </Typography>
                          <br />
                          {discount ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,153 €/mess
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,205 €/mess
                            </Typography>
                          )}
                        </Trans>
                      </Typography>
                    }
                  />
                </Box>
                <Box display={'flex'} alignItems="flex-end">
                  {discount && (
                    <Box display={'flex'} alignSelf="flex-end">
                      <Typography pr={1} sx={{ color: 'text.secondary' }}>
                        <s>
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscount.c6'
                          )}
                        </s>
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    {discount ? (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscounted.c6">
                        <span style={fontMediumBlueBold}>76.875,</span>
                        <span style={fontSmallBlueBold}> 00 € </span>
                      </Trans>
                    ) : (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValues.c6">
                        <span style={fontMediumBlueBold}>102.500,</span>
                        <span style={fontSmallBlueBold}> 00 € </span>
                      </Trans>
                    )}
                    {discount && (
                      <Box
                        width={'99px'}
                        height={'22px'}
                        sx={{
                          backgroundColor: 'warning.main',
                          borderRadius: theme.spacing(0.5),
                          p: 1,
                          width: '100%',
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="subtitle2">
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsDiscount.c6'
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              {/* C7 */}
              <Box width={carnetBoxWidth} height={carnetBoxHeight} sx={carnetBoxStyle}>
                <Box>
                  <FormControlLabel
                    onClick={() => {
                      setIsPricingPlanSelected(true);
                      setPpFunction('C7');
                    }}
                    value="C7"
                    control={<Radio />}
                    label={
                      <Typography variant="h6">
                        <Trans
                          i18nKey={
                            discount
                              ? 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithScount.c7'
                              : 'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsWithoutScount.c7'
                          }
                        >
                          1.000.000
                          <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                            mess
                          </Typography>
                          <br />
                          {discount ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,150 €/mess
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              0,20 €/mess
                            </Typography>
                          )}
                        </Trans>
                      </Typography>
                    }
                  />
                </Box>
                <Box display={'flex'} alignItems="flex-end">
                  {discount && (
                    <Box display={'flex'} alignSelf="flex-end">
                      <Typography pr={1} sx={{ color: 'text.secondary' }}>
                        <s>
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscount.c7'
                          )}
                        </s>
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    {discount ? (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValuesDiscounted.c7">
                        <span style={fontMediumBlueBold}>150.000,</span>
                        <span style={fontSmallBlueBold}> 00 € </span>
                      </Trans>
                    ) : (
                      <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetValues.c7">
                        <span style={fontMediumBlueBold}>200.000,</span>
                        <span style={fontSmallBlueBold}> 00 € </span>
                      </Trans>
                    )}

                    {discount && (
                      <Box
                        width={'99px'}
                        height={'22px'}
                        sx={{
                          backgroundColor: 'warning.main',
                          borderRadius: theme.spacing(0.5),
                          p: 1,
                          width: '100%',
                        }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="subtitle2">
                          {t(
                            'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.carnetLabelsDiscount.c7'
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textAlign: 'center', display: 'flex', mt: 3 }}
                >
                  {t('onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.description')}
                </Typography>
              </Box>

              {/* forward action with pricing plan */}
              <Box mt={3} display="flex" justifyContent={'center'}>
                <Button
                  disabled={!isPricingPlanSelected || pricingPlanSelected === ''}
                  variant="contained"
                  onClick={onForwardAction}
                >
                  {t(
                    'onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.btnActionLabel'
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
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.showLess')}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontWeight: 'fontWeightBold' }}
              >
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.showMore')}
              </Typography>
            )}
          </Button>
        </CardActions>
      </Card>
    </>
  );
}
