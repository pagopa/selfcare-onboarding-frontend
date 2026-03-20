import { Grid, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  subtitle: string | ReactElement;
};

export default function Heading({
  subtitle,
}: Props) {
  const { t } = useTranslation();
  return (
    <Grid container sx={{ textAlign: 'center', justifyContent: 'center' }}>
      <Grid item xs={12}>
        <Typography variant="h3" component="h2" sx={{ lineHeight: '1.2' }}>
          {t('onboardingFormData.title')}
        </Typography>
      </Grid>
      <Grid item xs={12} marginTop={1} marginBottom={4}>
        <Typography variant="body1">{subtitle}</Typography>
      </Grid>
    </Grid>
  );
}
