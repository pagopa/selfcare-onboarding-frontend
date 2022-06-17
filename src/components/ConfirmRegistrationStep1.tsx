import { Button, Grid, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { IllusUploadFile } from '@pagopa/mui-italia';
import { useTranslation, Trans } from 'react-i18next';
import { AlertDialogActions, StepperStepComponentProps } from '../../types';
import { FileUploader } from './FileUploader';

export function ConfirmRegistrationStep1(
  { setDialogTitle, setDialogDescription, setShowDialog }: AlertDialogActions,
  { forward }: StepperStepComponentProps,
  { loading }: any,
  { uploadFile, setUploadFile }: File
) {
  const { t } = useTranslation();
  const onDropAccepted = (acceptedFile: File) => {
    setUploadFile(acceptedFile);
  };

  const onDropRejected = () => {
    setDialogTitle(t('confirmRegistrationStep1.errorAlertTitle'));
    setDialogDescription(
      <Trans i18nKey="confirmRegistrationStep1.errorAlertDescription">
        {'Il caricamento del documento non è andato a buon fine. Torna indietro'}
        <br />
        {'e caricalo di nuovo.'}
      </Trans>
    );
    setShowDialog(true);
  };

  const onSubmit = (): void => {
    forward(uploadFile);
  };

  const deleteUploadedFile = (): void => {
    setUploadFile();
  };
  const theme = useTheme();

  const uploaderImageWidth = 180;
  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IllusUploadFile size={60} />
        </Box>
      </Grid>
      <Grid item xs={10} pb={1} mt={3}>
        <Typography color={theme.palette.text.primary} align="center" variant="h4">
          {t('confirmRegistrationStep1.pageTitle')}
        </Typography>
      </Grid>
      <Grid item xs={11} pb={3}>
        <Typography color={theme.palette.text.primary} variant={'body1'} align="center">
          <Trans i18nKey="confirmRegistrationStep1.pageSubtitle">
            Carica l’Accordo di Adesione ricevuto all’indirizzo PEC
            <br />
            primario dell’ente, firmato digitalmente dal Legale
            <br />
            Rappresentante.
          </Trans>
        </Typography>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
        <FileUploader
          title={t('confirmRegistrationStep1.fileUploaderTitle')}
          descriptionLink={t('confirmRegistrationStep1.fileUploaderDescriptionLink')}
          uploadedFile={uploadFile}
          deleteUploadedFile={deleteUploadedFile}
          onDropAccepted={onDropAccepted}
          onDropRejected={onDropRejected}
          maxFiles={1}
          multiple={false}
          accept={'application/pdf'}
          uploaderImageWidth={uploaderImageWidth}
          loading={loading}
          theme={theme}
        />
      </Grid>
      <Grid item>
        <Grid container>
          <Button
            sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}
            fullWidth
            color="primary"
            variant="contained"
            disabled={!uploadFile}
            onClick={onSubmit}
          >
            {t('confirmRegistrationStep1.confirmAction')}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
