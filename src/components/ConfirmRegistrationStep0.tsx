import { Button, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import { IllusUploadFile, IllusSharingInfo } from '@pagopa/mui-italia';
import { useTranslation, Trans } from 'react-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import { SessionModal } from '@pagopa/selfcare-common-frontend';
import { useContext, useState } from 'react';
import { AxiosResponse } from 'axios';
import { StepperStepComponentProps } from '../../types';
import { getFetchOutcome } from '../lib/error-utils';
import { fetchWithLogs } from '../lib/api-utils';
import { UserContext } from '../lib/context';
import { getRequestJwt } from '../utils/getRequestJwt';

export function ConfirmRegistrationStep0({ forward }: StepperStepComponentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setRequiredLogin } = useContext(UserContext);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const token = getRequestJwt();

  const onForwardAction = () => {
    forward();
  };

  const getContract = async () => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_CONTRACT', endpointParams: { onboardingId: token } },
      { method: 'GET' },
      () => setRequiredLogin(true)
    );
    const outcome = getFetchOutcome(searchResponse);
    const response = (searchResponse as AxiosResponse).data.file;

    if (outcome === 'success') {
      const file = URL.createObjectURL(new Blob([response]));
      window.open(file);
    } else {
      setOpenModal(true);
    }
  };

  return (
    <>
      <Grid container alignContent="center" flexDirection="column">
        <Card
          sx={{
            marginBottom: 4,
            width: '627px',
            borderRadius: theme.spacing(2),
            boxShadow:
              '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
          }}
        >
          <CardContent sx={{ width: '100%' }}>
            <Grid container display="flex" justifyContent="center" alignItems="center">
              <Grid item xs={12} pb={3} display="flex" justifyContent="center">
                <IllusSharingInfo size={80} />
              </Grid>
              <Grid item xs={10} pb={1}>
                <Typography
                  color={theme.palette.text.primary}
                  display="flex"
                  justifyContent="center"
                  variant="h4"
                >
                  {t('confirmRegistrationStep0.download.title')}
                </Typography>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Typography color={theme.palette.text.primary} variant="body1" align={'center'}>
                  <Trans
                    i18nKey="confirmRegistrationStep0.download.description"
                    components={{ 1: <br />, 2: <strong /> }}
                  >
                    {`Per completare l’adesione, scarica l’Accordo e fai apporre la firma digitale in <1 /><2>formato p7m</2> dal Legale Rappresentante dell’ente o da un suo procuratore.`}
                  </Trans>
                </Typography>
              </Grid>
              <Grid item py={4}>
                <Button fullWidth color="primary" variant="contained" onClick={getContract}>
                  {t('confirmRegistrationStep0.download.downloadContract')}
                  <DownloadIcon fontSize="small" sx={{ marginLeft: 1 }} />
                </Button>
              </Grid>
              <Grid item py={1}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: theme.palette.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  {t('confirmRegistrationStep0.download.disclaimer')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card
          sx={{
            width: '627px',
            borderRadius: theme.spacing(2),
            boxShadow:
              '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
          }}
        >
          <CardContent sx={{ width: '100%' }}>
            <Grid container display="flex" justifyContent="center" alignItems="center">
              <Grid item xs={12} pb={4} display="flex" justifyContent="center">
                <IllusUploadFile size={60} />
              </Grid>
              <Grid item xs={10} pb={1}>
                <Typography
                  color={theme.palette.text.primary}
                  display="flex"
                  justifyContent="center"
                  variant="h4"
                >
                  {t('confirmRegistrationStep0.upload.title')}
                </Typography>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
                <Typography color={theme.palette.text.primary} variant="body1" align={'center'}>
                  <Trans
                    i18nKey="confirmRegistrationStep0.upload.description"
                    components={{ 1: <br />, 3: <strong /> }}
                  >
                    {`Una volta firmato l’Accordo, segui le istruzioni per inviarlo e completare <1 />
            l’adesione al prodotto scelto. Ricorda di caricare l’Accordo
            <3>entro 30 giorni.</3>`}
                  </Trans>
                </Typography>
              </Grid>
              <Grid item pb={1}>
                <Button fullWidth color="primary" variant="contained" onClick={onForwardAction}>
                  {t('confirmRegistrationStep0.upload.goToUpload')}
                  <ArrowForwardIcon fontSize="small" sx={{ marginLeft: 1 }} />
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <SessionModal
        open={openModal}
        title={t('onboardingStep1_5.genericError.title')}
        message={'onboardingStep1_5.genericError.message'}
        handleClose={() => setOpenModal(false)}
      />
    </>
  );
}
