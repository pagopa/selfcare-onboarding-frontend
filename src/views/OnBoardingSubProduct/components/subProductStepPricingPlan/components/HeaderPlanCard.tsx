import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Box, useTheme } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
type Props = {
  discount: boolean;
  caption: string;
  discountBoxLabel: string;
  title: React.ReactNode;
  firstNumberBeforeComma: string;
  firstNumberAfterComma: string;
  secondNumberBeforeComma: string;
  secondNumberAfterComma: string;
};
export default function HeaderPlanCard({
  discount,
  caption,
  discountBoxLabel,
  title,
  firstNumberBeforeComma,
  firstNumberAfterComma,
  secondNumberBeforeComma,
  secondNumberAfterComma,
}: Props) {
  const theme = useTheme();
  const fontBigBlue = { color: '#0073E6', fontSize: '50px', fontWeight: '700' };
  const fontMediumBlueRegular = { color: '#0073E6', fontSize: '32px', marginRight: '8px' };
  const cardWidth = '530px';
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        width: cardWidth,
        height: '241px',
        borderRadius: '16px 16px 0 0',
      }}
    >
      <CardContent>
        <Box display={'flex'} justifyContent="space-between" alignItems={'center'}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'fontWeightBold',
                color: 'text.secondary',
              }}
            >
              {caption}
            </Typography>
          </Box>
          {discount && (
            <Box
              width={'99px'}
              height={'22px'}
              sx={{ backgroundColor: 'warning.main', borderRadius: theme.spacing(0.5) }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="subtitle2">{discountBoxLabel}</Typography>
            </Box>
          )}
        </Box>
        <Box>
          <Typography variant="h6" mt={3}>
            {title}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="h6"
            mt={3}
            display="flex"
            justifyContent={'center'}
            alignItems="center"
            fontFamily="Titillium Web !important"
          >
            <Trans i18nKey="onBoardingSubProduct.subProductStepSelectPricingPlan.carnetPlan.infoLabel">
              <span style={{ color: '#5C6F82', fontSize: '16px', marginRight: '8px' }}>
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.from')}
              </span>

              <span style={fontBigBlue}>{firstNumberBeforeComma}</span>

              <span style={fontMediumBlueRegular}>{firstNumberAfterComma}</span>

              <span style={{ color: '#5C6F82', fontSize: '16px', marginRight: '8px' }}>
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.to')}
              </span>

              <span style={fontBigBlue}>{secondNumberBeforeComma}</span>

              <span style={fontMediumBlueRegular}>{secondNumberAfterComma}</span>

              <span style={{ color: '#5C6F82', fontSize: '16px', marginRight: '8px' }}>
                {t('onBoardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.mess')}
              </span>
            </Trans>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
