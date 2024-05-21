import { Grid, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { InstitutionType } from '../../../types';

type Props = {
  t: TFunction<'translation', undefined>;
  institutionType: InstitutionType;
  isPaymentServiceProvider: boolean;
  isPremium: boolean;
  subtitle: string | JSX.Element;
  productId?: string;
};

export default function Heading({
  t,
  institutionType,
  isPaymentServiceProvider,
  isPremium,
  subtitle,
  productId,
}: Props) {
  return (
    <Grid container sx={{ textAlign: 'center', justifyContent: 'center' }}>
      <Grid item xs={12}>
        <Typography variant="h3" component="h2" sx={{ lineHeight: '1.2' }}>
          {isPaymentServiceProvider || productId === 'prod-pagopa'
            ? t('onboardingFormData.pspAndProdPagoPATitle')
            : institutionType === 'PT'
            ? t('onboardingFormData.billingDataPt.title')
            : t('onboardingFormData.title')}
        </Typography>
      </Grid>
      <Grid item mt={2} mb={4}>
        <Grid item xs={isPremium ? 7 : 12}>
          <Typography variant="body1">{subtitle}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
