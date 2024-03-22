import { useState, useContext, useEffect } from 'react';
import { AxiosError } from 'axios';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import { uniqueId } from 'lodash';
import { productId2ProductTitle } from '@pagopa/selfcare-common-frontend/utils/productId2ProductTitle';
import {
  StepperStep,
  Problem,
  RequestOutcomeOptionsJwt,
  RequestOutcomeJwt,
  OnboardingRequestData,
  RequestOutcomeOptions,
  RequestOutcomeMessage,
} from '../../../../types';
import { ConfirmRegistrationStep0 } from '../../../components/ConfirmRegistrationStep0';
import { ConfirmRegistrationStep1 } from '../../../components/ConfirmRegistrationStep1';
import { useHistoryState } from '../../../components/useHistoryState';
import { redirectToLogin } from '../../../utils/unloadEvent-utils';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { ENV } from '../../../utils/env';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { HeaderContext, UserContext } from '../../../lib/context';
import { verifyRequest } from '../../../services/tokenServices';
import NotFoundPage from '../outcomePages/NotFoundPage';
import ExpiredRequestPage from '../outcomePages/ExpiredRequestPage';
import AlreadyCompletedRequestPage from '../outcomePages/AlreadyCompletedRequestPage';
import AlreadyRejectedRequestPage from '../outcomePages/AlreadyRejectedRequestPage';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { getRequestJwt } from '../../../utils/getRequestJwt';
import CompleteRequestSuccessPage from './pages/CompleteRequestSuccessPage';
import { CompleteRequestFailPage } from './pages/CompleteRequestFailPage';

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
  INVALID_SIGN_FORMAT: {
    title: 'title',
    message: 'message',
  },
  ALREADY_ONBOARDED: {
    title: 'title',
    message: 'message',
  },
};

const error2errorCode: { [key in keyof typeof errors]: Array<string> } = {
  INVALID_DOCUMENT: ['002-1000', '002-1001', '002-1002'],
  INVALID_SIGN: ['002-1004', '002-1005', '002-1006', '002-1007'],
  INVALID_SIGN_FORMAT: ['002-1003', '002-1008'],
  ALREADY_ONBOARDED: ['002-1009'],
  GENERIC: [],
};

const transcodeErrorCode = (data: Problem): keyof typeof errors => {
  if (data.errors?.findIndex((e) => error2errorCode.INVALID_DOCUMENT.includes(e.code)) > -1) {
    return 'INVALID_DOCUMENT';
  } else if (data.errors?.findIndex((e) => error2errorCode.INVALID_SIGN.includes(e.code)) > -1) {
    return 'INVALID_SIGN';
  } else if (
    data.errors?.findIndex((e) => error2errorCode.INVALID_SIGN_FORMAT.includes(e.code)) > -1
  ) {
    return 'INVALID_SIGN_FORMAT';
  } else if (
    data.errors?.findIndex((e) => error2errorCode.ALREADY_ONBOARDED.includes(e.code)) > -1
  ) {
    return 'ALREADY_ONBOARDED';
  }
  return 'GENERIC';
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function CompleteRequestComponent() {
  const { t } = useTranslation();
  const { setSubHeaderVisible, setOnExit, setEnableLogin } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const token = getRequestJwt();
  const [activeStep, setActiveStep, setActiveStepHistory] = useHistoryState(
    'complete_registration_step',
    0
  );
  const [outcomeState, setOutcomeState] = useState<RequestOutcomeMessage | null>();
  const [outcomeContentState, setOutcomeContentState] = useState<RequestOutcomeJwt | null>(
    !token ? 'notFound' : null
  );
  const [errorCode, setErrorCode] = useState<keyof typeof errors>('GENERIC');
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastFileErrorAttempt, setLastFileErrorAttempt] = useState<FileErrorAttempt>();
  const [uploadedFiles, setUploadedFiles, setUploadedFilesHistory] = useHistoryState<Array<File>>(
    'uploaded_files',
    []
  );
  const [requestData, setRequestData] = useState<OnboardingRequestData>();

  useEffect(() => {
    setSubHeaderVisible(true);
    setEnableLogin(false);
    return () => {
      setSubHeaderVisible(true);
      setOnExit(undefined);
      setEnableLogin(true);
    };
  }, []);

  const handleVerifyRequest = async (token: string) => {
    setLoading(true);
    await verifyRequest({
      token,
      setRequiredLogin,
      setOutcomeContentState,
      setRequestData,
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) {
      setOutcomeContentState('notFound');
    } else {
      void handleVerifyRequest(token);
    }
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

  const back = () => {
    setOutcomeContentState('toBeCompleted');
  };

  const submit = async (file: File) => {
    const requestId = uniqueId('upload-contract-');
    trackEvent('ONBOARDING_CONTRACT_UPLOAD', { request_id: requestId, party_id: token });

    setLoading(true);
    const formData = new FormData();
    formData.append('contract', file);

    const uploadDocument = await fetchWithLogs(
      { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
      { method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' } },
      redirectToLogin
    );

    setLoading(false);
    const outcome = getFetchOutcome(uploadDocument);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_SUCCESS', { request_id: requestId, party_id: token });
      setOutcomeState(outcomes[outcome]);
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
          setError(true);
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
        (uploadDocument as AxiosError<Problem>).response?.status === 400 &&
        (uploadDocument as AxiosError<Problem>).response?.data
      ) {
        setOpen(true);
        trackEvent('ONBOARDING_CONTRACT_FAILURE', { request_id: requestId, party_id: token });
        setErrorCode(
          transcodeErrorCode((uploadDocument as AxiosError<Problem>).response?.data as Problem)
        );
      } else {
        setOpen(true);
        trackEvent('ONBOARDING_FAILURE', { request_id: requestId, party_id: token });
        setErrorCode('GENERIC');
      }
    }
  };

  const handleErrorModalClose = () => {
    setOpen(false);
  };

  const handleErrorModalExit = () => {
    setActiveStepHistory(0);
    setUploadedFilesHistory([]);
    setActiveStep(0);
    setUploadedFiles([]);
    setOpen(false);
  };

  const handleErrorModalConfirm = () => {
    setOpen(false);
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

  const outcomes: RequestOutcomeOptions = {
    success: {
      title: '',
      description: [
        <>
          <CompleteRequestSuccessPage />
        </>,
      ],
    },
    error: {
      title: '',
      description: [
        <>
          <CompleteRequestFailPage back={back} />
        </>,
      ],
    },
  };

  const Step = steps[activeStep].Component;

  const outcomeContent: RequestOutcomeOptionsJwt = {
    toBeCompleted: {
      title: '',
      description: [
        <>
          <Step />
        </>,
      ],
    },
    alreadyRejected: {
      title: '',
      description: [
        <>
          <AlreadyRejectedRequestPage
            productTitle={productId2ProductTitle(requestData?.productId ?? '')}
          />
        </>,
      ],
    },
    alreadyCompleted: {
      title: '',
      description: [
        <>
          <AlreadyCompletedRequestPage />
        </>,
      ],
    },
    expired: {
      title: '',
      description: [
        <>
          <ExpiredRequestPage productTitle={productId2ProductTitle(requestData?.productId ?? '')} />
        </>,
      ],
    },
    notFound: {
      title: '',
      description: [
        <>
          <NotFoundPage />
        </>,
      ],
    },
  };

  return (
    <>
      {loading ? (
        <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
      ) : outcomeState ? (
        <MessageNoAction {...outcomeState} />
      ) : outcomeContentState && !error ? (
        <MessageNoAction {...outcomeContent[outcomeContentState]} />
      ) : error ? (
        <CompleteRequestFailPage back={back} />
      ) : (
        <>
          <SessionModal
            handleClose={handleErrorModalClose}
            handleExit={handleErrorModalExit}
            onConfirm={handleErrorModalConfirm}
            open={open}
            title={t(`completeRegistration.errors.${errorCode}.title`)}
            message={
              errorCode === 'INVALID_SIGN_FORMAT' ? (
                <Trans i18nKey={`completeRegistration.errors.INVALID_SIGN_FORMAT.message`}>
                  {'Il caricamento del documento non è andato a buon fine.'}
                  <br />
                  {'Carica un solo file in formato '}
                  <strong>{'p7m'}</strong>
                  {'.'}
                </Trans>
              ) : (
                t(`completeRegistration.errors.${errorCode}.message`)
              )
            }
            onConfirmLabel={t('completeRegistration.sessionModal.onConfirmLabel')}
            onCloseLabel={t('completeRegistration.sessionModal.onCloseLabel')}
          />
          <Step />
        </>
      )}
    </>
  );
}
