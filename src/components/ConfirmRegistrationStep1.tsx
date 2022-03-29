import { Button, Grid, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation, Trans } from 'react-i18next';
import { AlertDialogActions, StepperStepComponentProps } from '../../types';
import { ReactComponent as PaymentCompleted } from '../assets/payment_completed.svg';
import { FileUploader } from './FileUploader';

export function ConfirmRegistrationStep1(
  { setDialogTitle, setDialogDescription, setShowDialog }: AlertDialogActions,
  { forward }: StepperStepComponentProps,
  { loading }: any,
  { uploadedFiles, setUploadedFiles }: any
) {
  const { t } = useTranslation();
  const onDropAccepted = (acceptedFiles: Array<File>) => {
    setUploadedFiles(acceptedFiles);
  };

  const onDropRejected = () => {
    setDialogTitle(t('confirmRegistrationStep1.errorAlertTitle'));
    setDialogDescription(t('confirmRegistrationStep1.errorAlertDescription'));
    setShowDialog(true);
  };

  const onSubmit = (): void => {
    forward(uploadedFiles[0]);
  };

  const deleteUploadedFiles = (): void => {
    setUploadedFiles([]);
  };
  const theme = useTheme();

  const uploaderImageWidth = 180;
  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <PaymentCompleted width={60} />
        </Box>
      </Grid>
      <Grid item xs={10} pb={1}>
        <Typography color="textPrimary" align="center" variant="h4">
          {t('confirmRegistrationStep1.pageTitle')}
        </Typography>
      </Grid>
      <Grid item xs={11} pb={4}>
        <Typography color="textPrimary" variant={'body2'} align="center">
          <Trans i18nKey="confirmRegistrationStep1.pageSubtitle">
            Per completare l&apos;adesione, carica l&apos;atto ricevuto via
            <br />
            PEC, firmato digitalmente dal Legale Rappresentante.
          </Trans>
        </Typography>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
        <FileUploader
          title={t('confirmRegistrationStep1.fileUploaderTitle')}
          description={t('confirmRegistrationStep1.fileUploaderDescription')}
          descriptionLink={t('confirmRegistrationStep1.fileUploaderDescriptionLink')}
          uploadedFiles={uploadedFiles}
          deleteUploadedFiles={deleteUploadedFiles}
          onDropAccepted={onDropAccepted}
          onDropRejected={onDropRejected}
          accept={['application/pdf', 'application/pkcs7-mime', 'application/x-pkcs7-mime']}
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
            disabled={!(uploadedFiles && uploadedFiles.length > 0)}
            onClick={onSubmit}
          >
            {t('confirmRegistrationStep1.confirmAction')}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
