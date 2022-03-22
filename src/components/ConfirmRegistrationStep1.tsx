import { Button, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { AlertDialogActions, StepperStepComponentProps } from '../../types';
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

  const subtitle1 = t('confirmRegistrationStep1.pageSubtitle1');
  const subtitle2 = t('confirmRegistrationStep1.pageSubtitle2');
  const uploaderImageWidth = 180;
  return (
    <Box>
      <Grid container direction="row" justifyContent={'flex-start'} alignItems={'center'}>
        <Grid item xs={1} />
        <Grid item xs={11}>
          <Grid container columns={11}>
            <Grid item xs={11}>
              <Typography color="textPrimary" variant={'h2'} align="left">
                {t('confirmRegistrationStep1.pageTitle')}
              </Typography>
            </Grid>
            <Grid item xs={11}>
              <Typography
                color="textPrimary"
                sx={{
                  mt: 3,
                }}
                variant={'body2'}
                align="left"
              >
                {subtitle1}
                <br />
                {subtitle2}
              </Typography>
            </Grid>
            <Grid item xs={11}>
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
              />
            </Grid>
            <Grid item xs={2} mt={8}>
              <Button
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
      </Grid>
    </Box>
  );
}
