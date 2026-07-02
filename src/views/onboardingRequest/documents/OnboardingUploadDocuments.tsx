/* eslint-disable sonarjs/cognitive-complexity */
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { productId2ProductTitle } from '@pagopa/selfcare-common-frontend/lib/utils/productId2ProductTitle';
import { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { RequestOutcomeComplete } from '../../../../types';
import { OnboardingVerify } from '../../../api/generated/onboarding/OnboardingVerify';
import { LoadingOverlay } from '../../../components/modals/LoadingOverlay';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';
import { useHistoryState } from '../../../hooks/useHistoryState';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ContractSummaryDocument, UploadedDocument } from '../../../model/Documents';
import { verifyRequest } from '../../../services/tokenServices';
import { customErrors } from '../../../utils/constants';
import { getRequestJwt } from '../../../utils/getRequestJwt';
import { CompleteRequestFailPage } from '../complete/pages/CompleteRequestFailPage';
import CompleteRequestSuccessPage from '../complete/pages/CompleteRequestSuccessPage';
import AlreadyCompletedRequest from '../status/AlreadyCompletedPage';
import AlreadyRejectedRequest from '../status/AlreadyRejectedPage';
import ExpiredRequestPage from '../status/ExpiredPage';
import NotFoundPage from '../status/NotFoundPage';
import StepUploadDocuments, { buildInitialDocuments } from './StepUploadDocuments';
import UploadedContractsSummary from './UploadedContractsSummary';

/* const error2errorCode: { [key in keyof typeof customErrors]: Array<string> } = {
  INVALID_DOCUMENT: ['002-1000', '002-1001', '002-1002'],
  INVALID_SIGN: ['002-1004', '002-1005', '002-1006', '002-1007'],
  INVALID_SIGN_FORMAT: ['002-1003', '002-1008'],
  ALREADY_ONBOARDED: ['002-1009'],
  GENERIC: [],
}; */

/* const transcodeErrorCode = (data: Problem): keyof typeof customErrors => {
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
}; */

export default function OnboardingUploadDocuments() {
  const { t } = useTranslation();
  const { setSubHeaderVisible, setOnExit, setEnableLogin } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const { onboardingId: onboardingIdFromPath } = useParams<{ onboardingId?: string }>();
  const onboardingId = onboardingIdFromPath || getRequestJwt();

  const [activeStep, setActiveStep, setActiveStepHistory] = useHistoryState(
    'upload_documents_step',
    0
  );
  const [outcomeContentState, setOutcomeContentState] = useState<RequestOutcomeComplete | null>(
    !onboardingId ? 'notFound' : null
  );
  const [errorCode, setErrorCode] = useState<keyof typeof customErrors>('GENERIC');
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [requestData, setRequestData] = useState<OnboardingVerify>();
  const [documents, setDocuments] = useState<Array<UploadedDocument>>(buildInitialDocuments(t));
  const translationKeyValue = 'product';
  const naturaGiuridica = documents.find((d) => d.group === 'naturaGiuridica');
  const visura = documents.find((d) => d.group === 'visura');
  const servizioPubblico = documents.filter((d) => d.group === 'servizioPubblico');
  const contractSummary: ContractSummaryDocument = [naturaGiuridica, visura, servizioPubblico];

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
    verifyRequest({
      onboardingId,
      setRequiredLogin,
      setOutcomeContentState,
      setRequestData,
    }).finally(() => setLoading(false));
  }, [onboardingId]);

  const handleErrorModalClose = () => setOpen(false);

  const handleErrorModalExit = () => {
    setActiveStepHistory(0);
    setActiveStep(0);
    setOpen(false);
  };

  const handleErrorModalConfirm = () => setOpen(false);

  /* const uploadDocuments = async () => {
    setLoading(true);
    try {
      // Each document is uploaded as a named attachment; the user-typed title (when present)
      // is used as the attachment name so multiple "servizio pubblico" docs don't collide
      for (const doc of documents) {
        if (doc.file) {
          // eslint-disable-next-line no-await-in-loop
          await OnboardingApi.uploadAttachment(
            onboardingId as string,
            doc.title.trim() || doc.name,
            doc.file
          );
        }
      }
      setLoading(false);
      setOutcomeContentState('success');
    } catch (error) {
      setLoading(false);
      const errorBody = (error as HttpError).httpBody as Problem | undefined;
      if (getErrorStatus(error) === 400 && errorBody) {
        setErrorCode(transcodeErrorCode(errorBody));
      } else {
        setErrorCode('GENERIC');
      }
      setOpen(true);
    }
  }; */

  const steps: Array<React.ReactNode> = [
    <StepUploadDocuments
      key="upload"
      naturaGiuridica={naturaGiuridica}
      visura={visura}
      servizioPubblico={servizioPubblico}
      setDocuments={setDocuments}
      loading={loading}
      forward={() => setActiveStep(1)}
      onDropRejected={() => {
        setErrorCode('INVALID_SIGN_FORMAT');
        setOpen(true);
      }}
    />,
    <UploadedContractsSummary
      key="summary"
      contractSummary={contractSummary}
      forward={() => console.log('submit')}
      back={() => setActiveStep(0)}
    />,
  ];

  const outcomeContent = {
    toBeCompleted: {
      title: '',
      description: [<>{steps[activeStep]}</>],
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
            addUserFlow={false}
            translationKeyValue={translationKeyValue}
          />
        </>,
      ],
    },
    error: {
      title: '',
      description: [
        <>
          <CompleteRequestFailPage back={handleErrorModalExit} />
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
