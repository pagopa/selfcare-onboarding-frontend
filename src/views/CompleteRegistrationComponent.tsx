import React, { useState, useContext, useEffect } from 'react';
import { Button, Stack, Typography, Grid } from '@mui/material';
import { AxiosError } from 'axios';
import { RequestOutcome, RequestOutcomeOptions, StepperStep, Problem } from '../../types';
import { ConfirmRegistrationStep0 } from '../components/ConfirmRegistrationStep0';
import { ConfirmRegistrationStep1 } from '../components/ConfirmRegistrationStep1';
import { AlertDialog } from '../components/AlertDialog';
import { useHistoryState } from '../components/useHistoryState';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import checkIllustration from '../assets/check-illustration.svg';
import redXIllustration from '../assets/red-x-illustration.svg';
import { ReactComponent as ErrorIllustration } from '../assets/error-illustration.svg';
import { ENV } from '../utils/env';
import { MessageNoAction } from '../components/MessageNoAction';
import { HeaderContext } from '../lib/context';
import { getOnboardingMagicLinkJwt } from './RejectRegistration';
import SessionModal from './../components/SessionModal';

type FileErrorAttempt = {
  fileName: string;
  fileSize: number;
  fileLastModifyDate: number;
  errorCount: number;
};

const errors = {
  INVALID_DOCUMENT: {
    title: 'Controlla il documento',
    message:
      "Il documento caricato non è riconducibile all'Atto di adesione del tuo Ente. Verifica che sia quello corretto e caricalo di nuovo.",
  },
  INVALID_SIGN: {
    title: 'Controlla il documento',
    message:
      'La Firma Digitale non è riconducibile al Legale Rappresentante indicato in fase di adesione. Verifica la corrispondenza e carica di nuovo il documento.',
  },
  GENERIC: {
    title: 'Caricamento non riuscito',
    message:
      'Il caricamento del documento non è andato a buon fine. Torna indietro e caricalo di nuovo.',
  },
};

const error2errorCode: { [key in keyof typeof errors]: Array<string> } = {
  INVALID_DOCUMENT: ['002-0100', '002-0101'],
  INVALID_SIGN: ['002-0102', '002-0103', '002-0104', '002-0105', '002-0106', '002-0107'],
  GENERIC: [],
};

const transcodeErrorCode = (data: Problem): keyof typeof errors => {
  if (data.errors?.findIndex((e) => error2errorCode.INVALID_DOCUMENT.includes(e.code)) > -1) {
    return 'INVALID_DOCUMENT';
  } else if (data.errors?.findIndex((e) => error2errorCode.INVALID_SIGN.includes(e.code)) > -1) {
    return 'INVALID_SIGN';
  }
  return 'GENERIC';
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function CompleteRegistrationComponent() {
  const { setSubHeaderVisible, setOnLogout } = useContext(HeaderContext);
  const token = getOnboardingMagicLinkJwt();

  const [activeStep, setActiveStep, setActiveStepHistory] = useHistoryState(
    'complete_registration_step',
    0
  );
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string | null>(null);
  const [dialogDescription, setDialogDescription] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<RequestOutcome | null>(!token ? 'error' : null);
  const [errorCode, setErrorCode] = useState<keyof typeof errors>('GENERIC');

  const [loading, setLoading] = useState<boolean>(false);

  const [lastFileErrorAttempt, setLastFileErrorAttempt] = useState<FileErrorAttempt>();
  const [showBlockingError, setShowBlockingError] = useState(false);

  const [uploadedFiles, setUploadedFiles, setUploadedFilesHistory] = useHistoryState<Array<File>>(
    'uploaded_files',
    []
  );

  useEffect(() => {
    setSubHeaderVisible(true);
    setOnLogout(null);
    return () => {
      setSubHeaderVisible(true);
      setOnLogout(undefined);
    };
  }, []);
  const setUploadedFilesAndWriteHistory = (files: Array<File>) => {
    setUploadedFilesHistory(files);
    setUploadedFiles(files);
  };

  const handleCloseDialog = (): void => {
    setShowDialog(false);
  };

  const forward = () => {
    setActiveStepHistory(activeStep + 1);
    setUploadedFilesHistory(uploadedFiles);
    setActiveStep(activeStep + 1);
  };

  const submit = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('contract', file);

    const uploadDocument = await fetchWithLogs(
      { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
      { method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' } }
    );

    setLoading(false);
    const outcome = getFetchOutcome(uploadDocument);
    setOutcome(outcome);

    if (outcome === 'error') {
      if (
        lastFileErrorAttempt &&
        lastFileErrorAttempt.fileName === file.name &&
        lastFileErrorAttempt.fileSize === file.size &&
        lastFileErrorAttempt.fileLastModifyDate === file.lastModified
      ) {
        const errorCount = lastFileErrorAttempt.errorCount + 1;
        setLastFileErrorAttempt({
          ...lastFileErrorAttempt,
          errorCount,
        });
        if (errorCount > ENV.UPLOAD_CONTRACT_MAX_LOOP_ERROR) {
          setShowBlockingError(true);
          return;
        }
      } else {
        setLastFileErrorAttempt({
          fileName: file.name,
          fileSize: file.size,
          fileLastModifyDate: file.lastModified,
          errorCount: 1,
        });
      }
      if (
        (uploadDocument as AxiosError<Problem>).response?.status === 409 &&
        (uploadDocument as AxiosError<Problem>).response?.data
      ) {
        setErrorCode(
          transcodeErrorCode((uploadDocument as AxiosError<Problem>).response?.data as Problem)
        );
      } else {
        setErrorCode('GENERIC');
      }
    }
  };

  const handleErrorModalClose = () => {
    setOutcome(null);
  };

  const handleErrorModalExit = () => {
    setActiveStepHistory(0);
    setUploadedFilesHistory([]);
    setActiveStep(0);
    setUploadedFiles([]);
    setOutcome(null);
  };

  const handleErrorModalConfirm = () => {
    console.log('EXIT');
    setOutcome(null);
    setUploadedFiles([]);
  };

  const steps: Array<StepperStep> = [
    {
      label: "Carica l'Atto di Adesione",
      Component: () => ConfirmRegistrationStep0({ forward }),
    },
    {
      label: "Carica l'Atto di Adesione",
      Component: () =>
        ConfirmRegistrationStep1(
          {
            setDialogTitle,
            setDialogDescription,
            setShowDialog,
            handleCloseDialog,
          },
          { forward: submit },
          { loading },
          { uploadedFiles, setUploadedFiles: setUploadedFilesAndWriteHistory }
        ),
    },
  ];

  const Step = steps[activeStep].Component;

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      img: { src: checkIllustration, alt: "Icona dell'email" },
      title: 'Adesione completata',
      description: [
        <Stack key="0" spacing={10}>
          <Typography>
            {"Comunicheremo l'avvenuta adesione all'indirizzo PEC dell'Ente."}
            <br />
            {'Da questo momento in poi, i Referenti Amministrativi inseriti in fase di richiesta'}
            <br />
            {'potranno accedere al portale.'}
          </Typography>
          <Button
            variant="contained"
            sx={{ width: '200px', alignSelf: 'center' }}
            onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
          >
            Torna alla home
          </Button>
        </Stack>,
      ],
    },
    error: {
      img: { src: redXIllustration, alt: 'Error' },
      title: 'Richiesta di adesione in errore',
      description: [
        <div key="0">
          {!token
            ? 'Il link usato non è valido!'
            : 'Il salvataggio dei dati inseriti non è andato a buon fine.'}
        </div>,
      ],
    },
  };

  return outcome === 'success' ? (
    <MessageNoAction {...outcomeContent[outcome]} />
  ) : outcome === 'error' ? (
    !token || showBlockingError ? (
      <Grid container direction="column" key="0" style={{ textAlign: 'center' }}>
        <Grid container item justifyContent="center" mb={5}>
          <Grid item xs={6}>
            <ErrorIllustration />
          </Grid>
        </Grid>
        <Grid container item justifyContent="center">
          <Grid item xs={6}>
            <Typography variant="h2">Spiacenti, qualcosa è andato storto.</Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center" mb={7} mt={1}>
          <Grid item xs={6}>
            <Typography>
              A causa di un errore del sistema non è possibile completare la procedura.
              <br />
              Ti chiediamo di riprovare più tardi.
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center">
          <Grid item xs={4}>
            <Button
              variant="contained"
              sx={{ width: '200px', alignSelf: 'center' }}
              onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            >
              Torna alla home
            </Button>
          </Grid>
        </Grid>
      </Grid>
    ) : (
      <SessionModal
        handleClose={handleErrorModalClose}
        handleExit={handleErrorModalExit}
        onConfirm={handleErrorModalConfirm}
        open={true}
        title={errors[errorCode].title}
        message={errors[errorCode].message}
        confirmLabel="Torna alla pagina di caricamento"
        rejectLabel="Esci"
        height="18em"
      />
    )
  ) : (
    <React.Fragment>
      <Step />
      <AlertDialog
        open={showDialog}
        handleClose={handleCloseDialog}
        description={dialogDescription}
        title={dialogTitle}
      />
    </React.Fragment>
  );
}
