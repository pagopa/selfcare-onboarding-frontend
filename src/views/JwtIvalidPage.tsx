import { Grid, Typography, Button } from '@mui/material';
import { IllusError } from '@pagopa/mui-italia';
import { Trans, useTranslation } from 'react-i18next';
import { ENV } from '../utils/env';

export default function JwtIvalidPage() {
  const { t } = useTranslation();
  return (
    <Grid container direction="column" key="0" style={{ textAlign: 'center' }}>
      <Grid container item justifyContent="center" mb={2}>
        <IllusError size={60} />
      </Grid>
      <Grid container item justifyContent="center" mt={3}>
        <Grid item xs={4}>
          {/* TODO: modify text when is confirmed */}
          <Typography variant="h4">{t('completeRegistration.jwtNotValid.title')}</Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center" mb={4} mt={1}>
        <Grid item xs={6}>
          <Typography variant="body1">
            {/* TODO: modify text when is confirmed */}
            <Trans i18nKey="completeRegistration.jwtNotValid.subtitle">
              Richiesta di adesione non più valida in quanto è stata
              <br />
              annullata o già completata o scaduta.
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item justifyContent="center">
        <Grid item xs={4}>
          <Button
            variant="contained"
            sx={{ alignSelf: 'center' }}
            // TODO: to confirm
            onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
          >
            {'Torna alla home'}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
