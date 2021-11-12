import React, { useState, useContext, useEffect } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { RequestOutcome, RequestOutcomeOptions, StepperStep } from '../../types';
import { ConfirmRegistrationStep0 } from '../components/ConfirmRegistrationStep0';
import { ConfirmRegistrationStep1 } from '../components/ConfirmRegistrationStep1';
import { AlertDialog } from '../components/AlertDialog';
import { useHistoryState } from '../components/useHistoryState';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import checkIllustration from '../assets/check-illustration.svg';
import redXIllustration from '../assets/red-x-illustration.svg';
import { URL_FE_DASHBOARD } from '../utils/constants';
import { MessageNoAction } from '../components/MessageNoAction';
import { HeaderContext } from '../lib/context';
import { getOnboardingMagicLinkJwt } from './RejectRegistration';

function CompleteRegistrationComponent() {
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

  const [loading, setLoading] = useState<boolean>(false);

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
    formData.append('file', file);

    const uploadDocument = await fetchWithLogs(
      { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
      { method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' } }
    );

    setLoading(false);
    setOutcome(getFetchOutcome(uploadDocument));
  };

  const steps: Array<StepperStep> = [
    {
      label: "Carica l'Atto di Adessione",
      Component: () => ConfirmRegistrationStep0({ forward }),
    },
    {
      label: "Carica l'Atto di Adessione",
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
      title: 'Richiesta di adesione completata',
      description: [
        <Stack key="0" spacing={10}>
          <Typography>
            {"Comunicheremo all'indirizzo PEC dell'Ente l'avvenuta adesione."}
            <br />
            {"D'ora in poi i Referenti Amministrativi indicati potranno accedere al portale."}
          </Typography>
          <Button
            variant="contained"
            sx={{ width: '200px', alignSelf: 'center' }}
            onClick={() => window.location.assign(URL_FE_DASHBOARD)}
          >
            Torna al portale
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

  return outcome ? (
    <MessageNoAction {...outcomeContent[outcome]} />
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

export default CompleteRegistrationComponent;
