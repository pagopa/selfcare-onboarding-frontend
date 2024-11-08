import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

type Props = {
  discount: boolean;
  caption: string;
  discountBoxLabel: string;
  title: React.ReactNode;
  isCarnetPlans: boolean;
  minCarnetMessagePrice: string;
  maxCarnetMessagePrice: string;
  minConsumptionMessagePrice: string;
  maxConsumptionMessagePrice: string;
};

export default function HeaderPlanCard({
  discount,
  caption,
  discountBoxLabel,
  title,
  minCarnetMessagePrice,
  maxCarnetMessagePrice,
  minConsumptionMessagePrice,
  maxConsumptionMessagePrice,
  isCarnetPlans,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Card
      sx={{
        width: '530px',
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
            <span style={{ color: '#5C6F82', fontSize: '16px', marginRight: '8px' }}>
              {t('onboardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.from')}
            </span>

            <span style={{ color: '#0073E6', fontSize: '50px', fontWeight: '700' }}>
              {isCarnetPlans
                ? minCarnetMessagePrice?.slice(0, 1).concat(',')
                : minConsumptionMessagePrice?.slice(0, 1).concat(',')}
            </span>

            <span style={{ color: '#0073E6', fontSize: '32px', marginRight: '8px' }}>
              {isCarnetPlans
                ? minCarnetMessagePrice?.slice(-2).concat('€')
                : minConsumptionMessagePrice?.slice(-2).concat('€')}
            </span>

            <span style={{ color: '#5C6F82', fontSize: '16px', marginRight: '8px' }}>
              {t('onboardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.to')}
            </span>

            <span style={{ color: '#0073E6', fontSize: '50px', fontWeight: '700' }}>
              {isCarnetPlans
                ? maxCarnetMessagePrice?.slice(0, 1).concat(',')
                : maxConsumptionMessagePrice?.slice(0, 1).concat(',')}
            </span>

            <span style={{ color: '#0073E6', fontSize: '32px', marginRight: '8px' }}>
              {isCarnetPlans
                ? maxCarnetMessagePrice?.slice(-2)
                : maxConsumptionMessagePrice?.slice(-2)}
            </span>

            <span style={{ color: '#5C6F82', fontSize: '16px', marginRight: '8px' }}>
              {t('onboardingSubProduct.subProductStepSelectPricingPlan.headerPlanCard.mess')}
            </span>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
