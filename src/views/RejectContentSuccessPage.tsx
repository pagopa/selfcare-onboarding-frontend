import { IllusCompleted } from '@pagopa/mui-italia';
import { Typography, Button } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { ENV } from '../utils/env';

export default function RejectContentSuccessPage() {
  const { t } = useTranslation();
  return (
    <>
      <IllusCompleted size={60} />
      <Typography variant="h4" mt={3}>
        {t('rejectRegistration.outcomeContent.success.title')}
      </Typography>
      <Typography variant="body1" mb={4} mt={1}>
        <Trans i18nKey="rejectRegistration.outcomeContent.success.description">
          Nella home dell’Area Riservata puoi vedere i prodotti
          <br />
          disponibili e richiedere l’adesione per il tuo ente.
        </Trans>
      </Typography>
      <Typography mt={3}>
        <Button
          variant="contained"
          sx={{ alignSelf: 'center' }}
          onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
        >
          {t('rejectRegistration.outcomeContent.success.backActionLabel')}
        </Button>
      </Typography>
    </>
  );
}
