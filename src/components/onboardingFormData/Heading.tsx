import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { subtitleUtils } from '../../utils/formUtils';
import { isRtpProduct } from '../../utils/institutionTypeUtils';
import { InstitutionType, Product } from '../../../types';

type Props = {
  institutionType: InstitutionType | undefined;
  selectedProduct: Product | null | undefined;
};

export default function Heading({ institutionType, selectedProduct }: Props) {
  const { t } = useTranslation();
  return (
    <Grid container sx={{ textAlign: 'center', justifyContent: 'center' }}>
      <Grid item xs={12}>
        <Typography variant="h3" component="h2" sx={{ lineHeight: '1.2' }}>
          {isRtpProduct(selectedProduct?.id)
            ? t('onboardingFormData.rtpTitle')
            : t('onboardingFormData.title')}
        </Typography>
      </Grid>
      <Grid item xs={12} marginTop={1} marginBottom={4}>
        <Typography variant="body1">{subtitleUtils(institutionType, selectedProduct)}</Typography>
      </Grid>
    </Grid>
  );
}
