import { Button, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { ENV } from '../utils/env';
import { ReactComponent as PaymentCompleted } from './../assets/payment_completed.svg';

type Props = {
  setIsConfirmPageVisible: (value: React.SetStateAction<boolean>) => void;
  deleteRequest: () => void;
};
export default function ConfrimCancellationPage({ setIsConfirmPageVisible, deleteRequest }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <PaymentCompleted />
      <Typography variant="h4" mt={3}>
        <Trans i18nKey="rejectRegistration.confirmCancellatione.title">
          Vuoi eliminare la richiesta di
          <br />
          adesione?
        </Trans>
      </Typography>
      <Typography variant="body1" mb={4} mt={1}>
        <Trans i18nKey="rejectRegistration.confirmCancellatione.description">
          Se la elimini, tutti i dati inseriti verranno persi.
        </Trans>
      </Typography>
      <Typography mt={3}>
        <Button
          variant="outlined"
          sx={{ alignSelf: 'center', mr: 2 }}
          onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
        >
          {t('rejectRegistration.outcomeContent.success.backActionLabel')}
        </Button>
        <Button
          variant="contained"
          sx={{ alignSelf: 'center' }}
          onClick={() => {
            setIsConfirmPageVisible(false);
            deleteRequest();
          }}
        >
          {t('rejectRegistration.confirmCancellatione.confirmActionLabel')}
        </Button>
      </Typography>
    </>
  );
}
