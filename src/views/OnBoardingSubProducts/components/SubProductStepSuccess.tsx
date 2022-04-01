import { Button, Stack, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { ENV } from '../../../utils/env';
import { ReactComponent as CheckIllustration } from '../../../assets/check-illustration.svg';

const successfulOutCome = {
  ImgComponent: CheckIllustration,
  title: '',
  description: [
    <>
      <Typography variant={'h4'} sx={{ color: theme.palette.text.primary, marginBottom: 1 }}>
        La tua richiesta è stata inviata
        <br />
        con successo
      </Typography>
      <Stack key="0" spacing={4}>
        <Typography variant="body1">
          Riceverai una PEC all’indirizzo istituzionale dell’Ente.
          <br />
          Al suo interno troverai le istruzioni per completare l&apos;adesione.
        </Typography>
        <Button
          variant="contained"
          sx={{ alignSelf: 'center' }}
          onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
        >
          Chiudi
        </Button>
      </Stack>
    </>,
  ],
};

function SubProductStepSuccess() {
  return <MessageNoAction {...successfulOutCome} />;
}
export default SubProductStepSuccess;
