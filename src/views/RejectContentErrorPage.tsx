import { IllusError } from '@pagopa/mui-italia';
import { Grid, Typography, Button } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { ENV } from '../utils/env';

export default function RejectContentErrorPage() {
  const { t } = useTranslation();
  return (
    <>
      <IllusError size={60} />
      <Grid container direction="column" key="0" style={{ textAlign: 'center' }} mt={3}>
        <Grid container item justifyContent="center">
          <Grid item xs={6}>
            <Typography variant="h4">
              {t('rejectRegistration.outcomeContent.error.title')}
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center" mb={4} mt={1}>
          <Grid item xs={6}>
            <Typography variant="body1">
              <Trans i18nKey="rejectRegistration.outcomeContent.error.description">
                A causa di un errore del sistema non è possibile completare la procedura.
                <br />
                Ti chiediamo di riprovare più tardi.
              </Trans>
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center">
          <Grid item xs={4}>
            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            >
              {t('rejectRegistration.outcomeContent.error.backActionLabel')}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
