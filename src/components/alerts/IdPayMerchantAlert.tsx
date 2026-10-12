import { Grid, Alert, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { isIdpayMerchantProduct } from '../../utils/institutionTypeUtils';
import { Product } from '../../../types';
import { PDNDBusinessResource } from '../../model/PDNDBusinessResource';

const IdPayMerchantAlert = ({
  product,
  merchantSearchResult,
  disabledStatusCompany,
}: {
  product: Product | null | undefined;
  merchantSearchResult: PDNDBusinessResource | undefined;
  disabledStatusCompany: boolean;
}) => {
  const { t } = useTranslation();
  if (!isIdpayMerchantProduct(product?.id) || !merchantSearchResult || !disabledStatusCompany) {
    return null;
  }
  return (
    <Grid container item justifyContent="center">
      <Grid item xs={8}>
        <Box display="flex" justifyContent="center" mb={5}>
          <Alert severity="error" sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
              {t('onboardingStep1.onboarding.merchantCompanyStatusDisabled')}
            </Typography>
          </Alert>
        </Box>
      </Grid>
    </Grid>
  );
};

export default IdPayMerchantAlert;
