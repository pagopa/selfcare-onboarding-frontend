import { Grid, Typography, Button } from '@mui/material';
import { IllusError } from '@pagopa/mui-italia';
import { useTranslation, Trans } from 'react-i18next';
import { ENV } from '../utils/env';

export default function JwtInvalidPage() {
  const { t } = useTranslation();
  return (
    <Grid container direction="column" key="0" style={{ textAlign: 'center' }}>
      <Grid container item justifyContent="center" mb={2}>
        <IllusError size={60} />
      </Grid>
      <Grid container item justifyContent="center" mt={3}>
        <Grid item xs={4}>
          <Typography variant="h4">
            <Trans i18nKey="completeRegistration.jwtNotValid.title">
              Richiesta di adesione non più <br /> valida
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={4} mt={1}>
        <Grid item xs={6}>
          <Typography variant="body1">{t('completeRegistration.jwtNotValid.subtitle')}</Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center">
        <Grid item xs={4}>
          <Button
            variant="contained"
            sx={{ alignSelf: 'center' }}
            onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
          >
            {t('completeRegistration.jwtNotValid.backHome')}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
