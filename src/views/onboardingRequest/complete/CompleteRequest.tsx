/* eslint-disable sonarjs/cognitive-complexity */
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { productId2ProductTitle } from '@pagopa/selfcare-common-frontend/lib/utils/productId2ProductTitle';
import { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import {
  FileErrorAttempt,
  OnboardingRequestData,
  Problem,
  RequestOutcomeComplete,
  StepperStep,
} from '../../../../types';
import { LoadingOverlay } from '../../../components/modals/LoadingOverlay';
import { ConfirmRegistrationStep0 } from '../../../components/registrationSteps/ConfirmRegistrationStep0';
import { ConfirmRegistrationStep1 } from '../../../components/registrationSteps/ConfirmRegistrationStep1';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';
import { useHistoryState } from '../../../hooks/useHistoryState';
import { HeaderContext, UserContext } from '../../../lib/context';
import { onboardingContractUpload } from '../../../services/requestStatusServices';
import { getOnboardingInfo, verifyRequest } from '../../../services/tokenServices';
import { customErrors } from '../../../utils/constants';
import { getRequestJwt } from '../../../utils/getRequestJwt';
import AlreadyCompletedRequest from '../status/AlreadyCompletedPage';
import AlreadyRejectedRequest from '../status/AlreadyRejectedPage';
import ExpiredRequestPage from '../status/ExpiredPage';
import NotFoundPage from '../status/NotFoundPage';
import { CompleteRequestFailPage } from './pages/CompleteRequestFailPage';
import CompleteRequestSuccessPage from './pages/CompleteRequestSuccessPage';

const error2errorCode: { [key in keyof typeof customErrors]: Array<string> } = {
  INVALID_DOCUMENT: ['002-1000', '002-1001', '002-1002'],
  INVALID_SIGN: ['002-1004', '002-1005', '002-1006', '002-1007'],
  INVALID_SIGN_FORMAT: ['002-1003', '002-1008'],
  ALREADY_ONBOARDED: ['002-1009'],
  GENERIC: [],
};

const transcodeErrorCode = (data: Problem): keyof typeof customErrors => {
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
  const { onboardingId: onboardingIdFromPath } = useParams<{ onboardingId?: string }>();
  const onboardingId = onboardingIdFromPath || getRequestJwt();

  const [activeStep, setActiveStep, setActiveStepHistory] = useHistoryState(
    'complete_registration_step',
    0
  );
  const [outcomeContentState, setOutcomeContentState] = useState<RequestOutcomeComplete | null>(
    !onboardingId ? 'notFound' : null
  );
  const [errorCode, setErrorCode] = useState<keyof typeof customErrors>('GENERIC');
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastFileErrorAttempt, setLastFileErrorAttempt] = useState<FileErrorAttempt>();
  const [uploadedFiles, setUploadedFiles, setUploadedFilesHistory] = useHistoryState<Array<File>>(
    'uploaded_files',
    []
  );
  const [requestData, setRequestData] = useState<OnboardingRequestData>();
  const [institutionId, setInstitutionId] = useState<string>();
  const [attachmentUploadSuccess, setAttachmentUploadSuccess] = useState<boolean>(false);
  const addUserFlow = new URLSearchParams(window.location.search).get('add-user') === 'true';
  const attachments = window.location.pathname.includes('/attachments');
  const translationKeyValue = addUserFlow ? 'user' : attachments ? 'attachments' : 'product';

  useEffect(() => {
    setSubHeaderVisible(true);
    setEnableLogin(false);
    return () => {
      setSubHeaderVisible(true);
      setOnExit(undefined);
      setEnableLogin(true);
    };
  }, []);

  useEffect(() => {
    if (attachments && onboardingId) {
      setOutcomeContentState('toBeCompleted');
    } else {
      verifyRequest({
        onboardingId,
        setRequiredLogin,
        setOutcomeContentState,
        setRequestData,
      }).finally(() => setLoading(false));
    }
  }, [/* attachments, */ onboardingId]);

  useEffect(() => {
    if (attachmentUploadSuccess && onboardingId) {
      void getOnboardingInfo(
        onboardingId,
        setInstitutionId,
        setLoading,
        setOutcomeContentState
      );
    }
  }, [attachmentUploadSuccess]);

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
    setOpen(false);
    setUploadedFiles([]);
    setOutcomeContentState('toBeCompleted');
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

  const uploadContract = () =>
    onboardingContractUpload(
      uploadedFiles[0],
      setLoading,
      onboardingId,
      requestData,
      addUserFlow,
      setOutcomeContentState,
      lastFileErrorAttempt,
      setLastFileErrorAttempt,
      setOpen,
      setErrorCode,
      transcodeErrorCode,
      attachments ? 'Addendum' : undefined,
      () => setAttachmentUploadSuccess(true)
    );

  const steps: Array<StepperStep> = [
    {
      label: t('completeRegistration.steps.step0.label'),
      Component: () =>
        ConfirmRegistrationStep0({
          onboardingId,
          fileName: 'Addendum',
          translationKeyValue,
          setLoading,
          forward,
        }),
    },
    {
      label: t('completeRegistration.steps.step1.label'),
      Component: () =>
        ConfirmRegistrationStep1(
          addUserFlow,
          translationKeyValue,
          {
            forward: () => uploadContract(),
          },
          { loading },
          { uploadedFiles, setUploadedFiles: setUploadedFilesAndWriteHistory }
        ),
    },
  ];

  const Step = steps[activeStep].Component;

  const outcomeContent = {
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
          <AlreadyRejectedRequest
            translationKeyValue={translationKeyValue}
            productTitle={productId2ProductTitle(requestData?.productId ?? '')}
          />
        </>,
      ],
    },
    alreadyCompleted: {
      title: '',
      description: [
        <>
          <AlreadyCompletedRequest translationKeyValue={translationKeyValue} />
        </>,
      ],
    },
    expired: {
      title: '',
      description: [
        <>
          <ExpiredRequestPage
            translationKeyValue={translationKeyValue}
            productTitle={productId2ProductTitle(requestData?.productId ?? '')}
          />
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
    success: {
      title: '',
      description: [
        <>
          <CompleteRequestSuccessPage
            addUserFlow={addUserFlow}
            translationKeyValue={translationKeyValue}
            institutionId={institutionId}
          />
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

  return loading ? (
    <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
  ) : outcomeContentState && outcomeContentState !== 'error' ? (
    <>
      <MessageNoAction {...outcomeContent[outcomeContentState]} />
      <SessionModal
        handleClose={handleErrorModalClose}
        handleExit={handleErrorModalExit}
        onConfirm={handleErrorModalConfirm}
        open={open}
        title={t(`completeRegistration.errors.${errorCode}.title`)}
        message={
          errorCode === 'INVALID_SIGN_FORMAT' ? (
            <Trans i18nKey={`completeRegistration.errors.${errorCode}.message`}>
              {'Il caricamento del documento non è andato a buon fine.'}
              <br />
              {'Carica un solo file in formato '}
              <strong>{'p7m'}</strong>
              {'.'}
            </Trans>
          ) : errorCode === 'GENERIC' ? (
            t(`completeRegistration.errors.${errorCode}.message`)
          ) : addUserFlow ? (
            t(`completeRegistration.errors.${errorCode}.user.message`)
          ) : (
            t(`completeRegistration.errors.${errorCode}.product.message`)
          )
        }
        onConfirmLabel={t('completeRegistration.sessionModal.onConfirmLabel')}
        onCloseLabel={t('completeRegistration.sessionModal.onCloseLabel')}
      />
    </>
  ) : (
    <MessageNoAction {...outcomeContent.error} />
  );
}
