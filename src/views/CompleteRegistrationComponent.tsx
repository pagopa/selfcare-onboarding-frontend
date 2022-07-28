import { useState, useContext, useEffect } from 'react';
import { Button, Stack, Typography, Grid } from '@mui/material';
import { AxiosError } from 'axios';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import { uniqueId } from 'lodash';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { buildAssistanceURI } from '@pagopa/selfcare-common-frontend/services/assistanceService';
import { RequestOutcome, RequestOutcomeOptions, StepperStep, Problem } from '../../types';
import { ConfirmRegistrationStep0 } from '../components/ConfirmRegistrationStep0';
import { ConfirmRegistrationStep1 } from '../components/ConfirmRegistrationStep1';
import { useHistoryState } from '../components/useHistoryState';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import redXIllustration from '../assets/red-x-illustration.svg';
import { ENV } from '../utils/env';
import { MessageNoAction } from '../components/MessageNoAction';
import { HeaderContext, UserContext } from '../lib/context';
import { getOnboardingMagicLinkJwt } from './RejectRegistration';

type FileErrorAttempt = {
  fileName: string;
  fileSize: number;
  fileLastModifyDate: number;
  errorCount: number;
};

const errors = {
  INVALID_DOCUMENT: {
    title: 'title',
    message: 'message',
  },
  INVALID_SIGN: {
    title: 'title',
    message: 'message',
  },
  GENERIC: {
    title: 'title',
    message: 'message',
  },
};

const error2errorCode: { [key in keyof typeof errors]: Array<string> } = {
  INVALID_DOCUMENT: ['002-1000', '002-1001'],
  INVALID_SIGN: ['002-1002', '002-1003', '002-1004', '002-1005', '002-1006', '002-1007'],
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
  const { setSubHeaderVisible, setOnExit, setEnableLogin } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const token = getOnboardingMagicLinkJwt();

  const [activeStep, setActiveStep, setActiveStepHistory] = useHistoryState(
    'complete_registration_step',
    0
  );

  const [outcome, setOutcome] = useState<RequestOutcome | null>(!token ? 'error' : null);
  const [errorCode, setErrorCode] = useState<keyof typeof errors>('GENERIC');

  const [loading, setLoading] = useState<boolean>(false);

  const [lastFileErrorAttempt, setLastFileErrorAttempt] = useState<FileErrorAttempt>();
  const [showBlockingError, setShowBlockingError] = useState(false);

  const [uploadedFiles, setUploadedFiles, setUploadedFilesHistory] = useHistoryState<Array<File>>(
    'uploaded_files',
    []
  );
  const { t } = useTranslation();

  useEffect(() => {
    setSubHeaderVisible(true);
    setEnableLogin(false);
    return () => {
      setSubHeaderVisible(true);
      setOnExit(undefined);
      setEnableLogin(true);
    };
  }, []);
  const setUploadedFilesAndWriteHistory = (files: Array<File>) => {
    setUploadedFilesHistory(files);
    setUploadedFiles(files);
  };

  const forward = () => {
    setActiveStepHistory(activeStep + 1);
    setUploadedFilesHistory(uploadedFiles);
    setActiveStep(activeStep + 1);
  };

  const submit = async (file: File) => {
    const requestId = uniqueId('upload-contract-');
    trackEvent('ONBOARDING_CONTRACT_UPLOAD', { request_id: requestId });

    setLoading(true);
    const formData = new FormData();
    formData.append('contract', file);

    const uploadDocument = await fetchWithLogs(
      { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
      { method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' } },
      () => setRequiredLogin(true)
    );

    setLoading(false);
    const outcome = getFetchOutcome(uploadDocument);
    setOutcome(outcome);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_SUCCESS', { request_id: requestId, party_id: token });
    }

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
        trackEvent('ONBOARDING_CONTRACT_FAILURE', { request_id: requestId, party_id: token });
        setErrorCode(
          transcodeErrorCode((uploadDocument as AxiosError<Problem>).response?.data as Problem)
        );
      } else {
        trackEvent('ONBOARDING_FAILURE', { request_id: requestId, party_id: token });
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
      label: t('completeRegistration.steps.step0.label'),
      Component: () => ConfirmRegistrationStep0({ forward }),
    },
    {
      label: t('completeRegistration.steps.step1.label'),
      Component: () =>
        ConfirmRegistrationStep1(
          { forward: submit },
          { loading },
          { uploadedFiles, setUploadedFiles: setUploadedFilesAndWriteHistory }
        ),
    },
  ];

  const Step = steps[activeStep].Component;

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      title: '',
      description: [
        <>
          <IllusCompleted size={60} />
          <Typography mt={3} mb={1} variant="h4">
            {t('completeRegistration.outcomeContent.success.title')}
          </Typography>
          <Stack key="0" spacing={3}>
            <Typography variant="body1">
              <Trans i18nKey="completeRegistration.outcomeContent.success.description">
                Comunicheremo l&apos;avvenuta adesione all&apos;indirizzo PEC
                <br />
                primario dell&apos;ente. Da questo momento, gli Amministratori
                <br />
                inseriti in fase di richiesta possono accedere all&apos;Area
                <br />
                Riservata.`,
              </Trans>
            </Typography>
            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            >
              {t('completeRegistration.outcomeContent.success.backActionLabel')}
            </Button>
          </Stack>
        </>,
      ],
    },
    error: {
      img: { src: redXIllustration, alt: t('completeRegistration.outcomeContent.error.alt') },
      title: t('completeRegistration.outcomeContent.error.title'),
      description: [
        <div key="0">
          {!token
            ? t('completeRegistration.outcomeContent.error.descriptionWithoutToken')
            : t('completeRegistration.outcomeContent.error.descriptionWithToken')}
        </div>,
      ],
    },
  };
  return outcome === 'success' ? (
    <MessageNoAction {...outcomeContent[outcome]} />
  ) : outcome === 'error' ? (
    !token || showBlockingError ? (
      <Grid container direction="column" key="0" style={{ textAlign: 'center' }}>
        <Grid container item justifyContent="center" mb={2}>
          <IllusError size={60} />
        </Grid>
        <Grid container item justifyContent="center" mt={3}>
          <Grid item xs={6}>
            <Typography variant="h4">{t('completeRegistration.title')}</Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center" mb={4} mt={1}>
          <Grid item xs={6}>
            <Typography variant="body1">
              <Trans i18nKey="completeRegistration.description">
                Non siamo riusciti a indirizzarti alla pagina di caricamento
                <br />
                per completare la procedura.
              </Trans>
            </Typography>
          </Grid>
        </Grid>
        <Grid container item justifyContent="center">
          <Grid item xs={4}>
            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => window.location.assign(buildAssistanceURI(ENV.ASSISTANCE.EMAIL))}
            >
              {t('completeRegistration.contactAssistanceButton')}
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
        title={t(`completeRegistration.errors.${errorCode}.title`)}
        message={t(`completeRegistration.errors.${errorCode}.message`)}
        onConfirmLabel={t('completeRegistration.sessionModal.onConfirmLabel')}
        onCloseLabel={t('completeRegistration.sessionModal.onCloseLabel')}
      />
    )
  ) : (
    <Step />
  );
}
