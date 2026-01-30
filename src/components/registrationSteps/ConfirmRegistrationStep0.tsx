import { Button, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import { IllusUploadFile, IllusSharingInfo } from '@pagopa/mui-italia';
import { useTranslation, Trans } from 'react-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import { SessionModal } from '@pagopa/selfcare-common-frontend/lib';
import { useState } from 'react';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { ENV } from '../../utils/env';
import { fileFromReader } from '../../utils/formatting-utils';

type Props = {
  onboardingId: string | undefined;
  fileName?: string;
  translationKeyValue: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  forward: () => void;
};
export function ConfirmRegistrationStep0({
  onboardingId,
  fileName,
  translationKeyValue,
  setLoading,
  forward,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const onForwardAction = () => {
    forward();
  };

  const getContract = (onboardingId: string, documentName?: string) => {
    setLoading(true);
    const sessionToken = storageTokenOps.read();
    const url =
      translationKeyValue === 'attachments'
        ? `${ENV.URL_API.ONBOARDING_V2}/v2/tokens/${onboardingId}/template-attachment?name=${documentName}`
        : `${ENV.URL_API.ONBOARDING_V2}/v2/tokens/${onboardingId}/contract`;

    fetch(url, {
      headers: {
        accept: '*/*',
        'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        authorization: `Bearer ${sessionToken}`,
        'content-type': 'application/octet-stream',
      },
      method: 'GET',
    })
      .then((response) => {
        const contentDisposition = response.headers.get('content-disposition');
        const matchedIndex = contentDisposition?.indexOf('=') as number;
        const fileNameFromHeader =
          contentDisposition?.substring(matchedIndex + 1) ?? 'Accordo_di_adesione.pdf';
        const finalFileName =
          translationKeyValue === 'attachments' ? `${documentName}.pdf` : fileNameFromHeader;
        return response.blob().then((blob) => {
          const reader = blob.stream().getReader();
          fileFromReader(reader)
            .then((url) => {
              const link = document.createElement('a');
              // eslint-disable-next-line functional/immutable-data
              link.href = url;
              // eslint-disable-next-line functional/immutable-data
              link.download = finalFileName;
              document.body.appendChild(link);
              link.click();
              setLoading(false);
            })
            .catch(() => {
              setOpenModal(true);
              setLoading(false);
            });
        });
      })
      .catch(() => {
        setOpenModal(true);
        setLoading(false);
      });
  };

  const onClickDownload = (onboardingId: string | undefined) => {
    if (onboardingId) {
      if (translationKeyValue === 'attachments' && fileName) {
        return getContract(onboardingId, fileName);
      } else {
        return getContract(onboardingId);
      }
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
                  {t(`confirmOnboarding.chooseOption.download.${translationKeyValue}.title`)}
                </Typography>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Typography color={theme.palette.text.primary} variant="body1" align={'center'}>
                  <Trans
                    i18nKey={`confirmOnboarding.chooseOption.download.${translationKeyValue}.description`}
                    components={{ 1: <br />, 2: <strong /> }}
                  >
                    {translationKeyValue === 'user'
                      ? `Per completare l’adesione, scarica il Modulo di aggiunta e fai apporre la <1 />firma digitale in <2>formato p7m</2> dal Legale Rappresentante dell’ente.`
                      : translationKeyValue === 'attachments'
                        ? `Per adeguarti alla nuova normativa, scarica l’addendum e provvedi alla  <1 />firma digitale <2>formato p7m</2>.`
                        : `Per completare l’adesione, scarica l’accordo e fai apporre la firma digitale in <1 /><2>formato p7m</2> dal Legale Rappresentante dell’ente.`}
                  </Trans>
                </Typography>
              </Grid>
              <Grid item py={4}>
                <Button
                  fullWidth
                  color="primary"
                  variant="contained"
                  onClick={() => onClickDownload(onboardingId)}
                >
                  {t(
                    `confirmOnboarding.chooseOption.download.${translationKeyValue}.downloadContract`
                  )}
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
                  {translationKeyValue === 'attachments'
                    ? t('confirmOnboarding.chooseOption.download.disclaimerAttachments')
                    : t('confirmOnboarding.chooseOption.download.disclaimer')}
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
                  {t(`confirmOnboarding.chooseOption.upload.${translationKeyValue}.title`)}
                </Typography>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
                <Typography color={theme.palette.text.primary} variant="body1" align={'center'}>
                  <Trans
                    i18nKey={`confirmOnboarding.chooseOption.upload.${translationKeyValue}.description`}
                    components={{ 1: <br />, 3: <strong /> }}
                  >
                    {translationKeyValue === 'user'
                      ? `Una volta firmato il Modulo, segui le istruzioni per inviarlo e completare <1 /> l’aggiunta di uno o più Amministratori.`
                      : translationKeyValue === 'attachments'
                        ? `Una volta firmato digitalmente il documento, caricalo per completare la <1 />sottoscrizione.`
                        : `Una volta firmato l’accordo, segui le istruzioni per inviarlo e completare <1 /> l’adesione al prodotto scelto. Ricorda di caricare l’accordo <3>entro 30 giorni.</3>`}
                  </Trans>
                </Typography>
              </Grid>
              <Grid item pb={1}>
                <Button fullWidth color="primary" variant="contained" onClick={onForwardAction}>
                  {t('confirmOnboarding.chooseOption.upload.goToUpload')}
                  <ArrowForwardIcon fontSize="small" sx={{ marginLeft: 1 }} />
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <SessionModal
        open={openModal}
        title={t('stepVerifyOnboarding.genericError.title')}
        message={
          <Trans
            i18nKey={'stepVerifyOnboarding.genericError.description'}
            components={{ 1: <br /> }}
          >
            {`A causa di un errore del sistema non è possibile completare la procedura.
        <1/>
        Ti chiediamo di riprovare più tardi.`}
          </Trans>
        }
        handleClose={() => setOpenModal(false)}
      />
    </>
  );
}
