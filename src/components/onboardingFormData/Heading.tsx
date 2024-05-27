import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InstitutionType } from '../../../types';

type Props = {
  institutionType: InstitutionType;
  isPaymentServiceProvider: boolean;
  subtitle: string | JSX.Element;
  productId?: string;
};

export default function Heading({
  institutionType,
  isPaymentServiceProvider,
  subtitle,
  productId,
}: Props) {
  const { t } = useTranslation();
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
      <Grid item xs={12} marginTop={1} marginBottom={4}>
        <Typography variant="body1">{subtitle}</Typography>
      </Grid>
    </Grid>
  );
}
