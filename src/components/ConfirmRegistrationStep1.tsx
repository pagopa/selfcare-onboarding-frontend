import { Button, Grid, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { IllusUploadFile } from '@pagopa/mui-italia';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { StepperStepComponentProps } from '../../types';
import { FileUploader } from './FileUploader';

export function ConfirmRegistrationStep1(
  { forward }: StepperStepComponentProps,
  { loading }: any,
  { uploadedFiles, setUploadedFiles }: any
) {
  const { t } = useTranslation();
  const [rejectedError, setRejectedError] = useState<boolean>(false);
  const onDropAccepted = (acceptedFiles: Array<File>) => {
    setUploadedFiles(acceptedFiles);
  };

  const handleClose = () => {
    setRejectedError(false);
  };

  const onDropRejected = () => {
    setRejectedError(true);
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
          <Trans i18nKey="confirmRegistrationStep1.pageSubtitle" components={{ 1: <br /> }}>
            {`Carica l’Accordo di adesione firmato digitalmente <1 /> in p7m dal Legale Rappresentante.`}
          </Trans>
        </Typography>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
        <FileUploader
          title={t('confirmRegistrationStep1.fileUploaderTitle')}
          descriptionLink={t('confirmRegistrationStep1.fileUploaderDescriptionLink')}
          uploadedFiles={uploadedFiles}
          deleteUploadedFiles={deleteUploadedFiles}
          onDropAccepted={onDropAccepted}
          onDropRejected={onDropRejected}
          accept={['.pdf', '.p7z', '.p7m', '.p7c']}
          uploaderImageWidth={uploaderImageWidth}
          loading={loading}
          theme={theme}
        />
      </Grid>
      <SessionModal
        open={rejectedError}
        title={t('confirmRegistrationStep1.errorAlertTitle')}
        message={
          <Trans i18nKey="confirmRegistrationStep1.errorAlertDescription">
            {'Il caricamento del documento non è andato a buon fine.'}
            <br />
            {'Carica un solo file in formato '}
            <strong>{'p7m'}</strong>
            {'.'}
          </Trans>
        }
        onConfirmLabel={t('confirmRegistrationStep1.errorAlertRetryLabel')}
        onCloseLabel={t('confirmRegistrationStep1.errorAlertCloseLabel')}
        onConfirm={handleClose}
        handleClose={handleClose}
      />
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
