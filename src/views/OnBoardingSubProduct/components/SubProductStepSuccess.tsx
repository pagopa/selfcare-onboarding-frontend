import { Button, Stack, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { Trans } from 'react-i18next';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { ENV } from '../../../utils/env';
import { ReactComponent as CheckIllustration } from '../../../assets/check-illustration.svg';

const successfulOutCome = {
  ImgComponent: CheckIllustration,
  title: '',
  description: [
    <>
      <Typography variant={'h4'} sx={{ color: theme.palette.text.primary, marginBottom: 1 }}>
        <Trans i18nKey="onBoardingSubProduct.successfulAdhesion.title">
          La tua richiesta è stata inviata
          <br />
          con successo
        </Trans>
      </Typography>
      <Stack key="0" spacing={4}>
        <Typography variant="body1">
          <Trans i18nKey="onBoardingSubProduct.successfulAdhesion.message">
            Riceverai una PEC all’indirizzo istituzionale dell&apos;ente.
            <br />
            Al suo interno troverai le istruzioni per completare la
            <br />
            sottoscrizione all&apos;offerta Premium.
          </Trans>
        </Typography>
        <Button
          variant="contained"
          sx={{ alignSelf: 'center' }}
          onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
        >
          <Trans i18nKey="onBoardingSubProduct.successfulAdhesion.closeButton"> Chiudi </Trans>
        </Button>
      </Stack>
    </>,
  ],
};

function SubProductStepSuccess() {
  return <MessageNoAction {...successfulOutCome} />;
}
export default SubProductStepSuccess;
