import { Button, Grid, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { IllusUploadFile } from '@pagopa/mui-italia';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { StepperStepComponentProps } from '../../../types';
import { FileUploader } from '../fileUpload/FileUploader';

export function ConfirmRegistrationStep1(
  addUserFlow: boolean,
  translationKeyValue: string,
  { forward }: StepperStepComponentProps,
  { loading }: any,
  { uploadedFiles, setUploadedFiles }: any
) {
  const { t } = useTranslation();
  const theme = useTheme();

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

  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IllusUploadFile size={60} />
        </Box>
      </Grid>
      <Grid item xs={10} pb={1} mt={3}>
        <Typography color={theme.palette.text.primary} align="center" variant="h4">
          {addUserFlow
            ? t('confirmOnboarding.upload.user.title')
            : translationKeyValue === 'attachments'
              ? t('confirmOnboarding.upload.attachments.title')
              : t('confirmOnboarding.upload.product.title')}
        </Typography>
      </Grid>
      <Grid item xs={11} pb={4}>
        <Typography color={theme.palette.text.primary} variant={'body1'} align="center">
          <Trans
            i18nKey={
              addUserFlow
                ? 'confirmOnboarding.upload.user.description'
                : translationKeyValue === 'attachments'
                  ? 'confirmOnboarding.upload.attachments.description'
                  : 'confirmOnboarding.upload.product.description'
            }
            components={{ 1: <br /> }}
          >
            {addUserFlow
              ? `Carica il Modulo di aggiunta, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`
              : `Carica l’accordo di adesione, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`}
          </Trans>
        </Typography>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
        <FileUploader
          title={
            addUserFlow
              ? t('confirmOnboarding.upload.user.dropArea.title')
              : translationKeyValue === 'attachments'
                ? t('confirmOnboarding.upload.attachments.dropArea.title')
                : t('confirmOnboarding.upload.product.dropArea.title')
          }
          descriptionLink={
            addUserFlow
              ? t('confirmOnboarding.upload.user.dropArea.link')
              : translationKeyValue === 'attachments'
                ? t('confirmOnboarding.upload.attachments.dropArea.link')
                : t('confirmOnboarding.upload.product.dropArea.link')
          }
          uploadedFiles={uploadedFiles}
          deleteUploadedFiles={deleteUploadedFiles}
          onDropAccepted={onDropAccepted}
          onDropRejected={onDropRejected}
          accept={{
            'application/pdf': ['.pdf'],
            'application/x-pkcs7-certificates': ['.p7c'],
            'application/x-pkcs7-certreqresp': ['.p7r'],
            'application/x-pkcs7-mime': ['.p7m'],
            'application/x-pkcs7-signature': ['.p7z'],
          }}
          loading={loading}
          theme={theme}
          isAggregatesUpload={false}
        />
      </Grid>
      <SessionModal
        open={rejectedError}
        title={t('confirmOnboarding.upload.error.title')}
        message={
          <Trans i18nKey="confirmOnboarding.upload.error.description">
            {'Il caricamento del documento non è andato a buon fine.'}
            <br />
            {'Carica un solo file in formato '}
            <strong>{'p7m'}</strong>
            {'.'}
          </Trans>
        }
        onConfirmLabel={t('confirmOnboarding.upload.error.retry')}
        onCloseLabel={t('confirmOnboarding.upload.error.close')}
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
            {t('confirmOnboarding.upload.continue')}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
