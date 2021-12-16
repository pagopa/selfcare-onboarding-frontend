import { Button, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { AlertDialogActions, StepperStepComponentProps } from '../../types';
import { FileUploader } from './FileUploader';

export function ConfirmRegistrationStep1(
  { setDialogTitle, setDialogDescription, setShowDialog }: AlertDialogActions,
  { forward }: StepperStepComponentProps,
  { loading }: any,
  { uploadedFiles, setUploadedFiles }: any
) {
  const onDropAccepted = (acceptedFiles: Array<File>) => {
    setUploadedFiles(acceptedFiles);
  };

  const onDropRejected = () => {
    setDialogTitle('Controlla il Documento');
    setDialogDescription("E' possibile caricare un solo file di tipo PDF");
    setShowDialog(true);
  };

  const onSubmit = (): void => {
    forward(uploadedFiles[0]);
  };

  const deleteUploadedFiles = (): void => {
    setUploadedFiles([]);
  };

  const subtitle1 =
    "Per completare l'adesione, carica l'atto ricevuto via PEC, firmato digitalmente ";
  const subtitle2 = 'dal Legale Rappresentante.';
  const uploaderImageWidth = 180;
  return (
    <Box>
      <Grid container direction="row" justifyContent={'flex-start'} alignItems={'center'}>
        <Grid item xs={1} />
        <Grid item xs={11}>
          <Grid container columns={11}>
            <Grid item xs={11}>
              <Typography color="textPrimary" variant={'h2'} align="left">
                {"Carica l'Accordo di Adesione"}
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
                title={'Trascina qui l’Accordo di Adesione firmato'}
                description={'oppure '}
                descriptionLink={'selezionalo dal tuo computer'}
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
                Invia
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
