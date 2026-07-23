/* eslint-disable sonarjs/cognitive-complexity */
import { useErrorDispatcher } from '@pagopa/selfcare-common-frontend';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { productId2ProductTitle } from '@pagopa/selfcare-common-frontend/lib/utils/productId2ProductTitle';
import { uniqueId } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { RequestOutcomeComplete } from '../../../../types';
import { InstitutionInfo } from '../../../api/generated/onboarding/InstitutionInfo';
import { OnboardingVerify } from '../../../api/generated/onboarding/OnboardingVerify';
import { ConfirmOnboardingModal } from '../../../components/modals/ConfirmOnboardingRequest';
import { LoadingOverlay } from '../../../components/modals/LoadingOverlay';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';
import { useHistoryState } from '../../../hooks/useHistoryState';
import { HeaderContext, UserContext } from '../../../lib/context';
import { RequiredDocument, UploadedDocument } from '../../../model/Documents';
import {
  fetchRequiredDocuments,
  requiredDocumentsFlow,
  submitDocuments,
} from '../../../services/documentServices';
import { getOnboardingInstitutionInfo, verifyRequest } from '../../../services/tokenServices';
import { customErrors } from '../../../utils/constants';
import { getRequestJwt } from '../../../utils/getRequestJwt';
import { triggerQualtricsIntercept } from '../../../utils/qualtricsUtils';
import CompleteRequest from '../../onboardingRequest/complete/CompleteRequest';
import { CompleteRequestFailPage } from '../../onboardingRequest/complete/pages/CompleteRequestFailPage';
import CompleteRequestSuccessPage from '../../onboardingRequest/complete/pages/CompleteRequestSuccessPage';
import AlreadyCompletedRequest from '../../onboardingRequest/status/AlreadyCompletedPage';
import AlreadyRejectedRequest from '../../onboardingRequest/status/AlreadyRejectedPage';
import ExpiredRequestPage from '../../onboardingRequest/status/ExpiredPage';
import NotFoundPage from '../../onboardingRequest/status/NotFoundPage';
import StepUploadDocuments from './step/StepUploadDocuments';
import UploadedContractsSummary from './step/UploadedContractsSummary';

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
  const [openConfirmationModal, setOpenConfirmationModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(!!onboardingId);
  const [requestData, setRequestData] = useState<OnboardingVerify>();
  const [institutionInfo, setInstitutionInfo] = useState<InstitutionInfo>();
  const [documents, setDocuments] = useState<Array<UploadedDocument>>([]);
  const translationKeyValue = 'product';
  const [requiredDocumentsEnabled, setRequiredDocumentsEnabled] = useState<boolean>();
  const [requiredDocuments, setRequiredDocuments] = useState<Array<RequiredDocument>>([]);
  const addError = useErrorDispatcher();

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

  useEffect(() => {
    if (!onboardingId) {
      return;
    }
    void getOnboardingInstitutionInfo(onboardingId, setInstitutionInfo);
  }, [onboardingId]);

  useEffect(() => {
    if (!requestData?.productId) {
      return;
    }

    void requiredDocumentsFlow(
      requestData?.productId,
      'GSP',
      'SELC',
      addError,
      setRequiredDocumentsEnabled
    );
  }, [requestData?.productId]);

  useEffect(() => {
    if (!requiredDocumentsEnabled || !requestData?.productId) {
      return;
    }

    setLoading(true);
    void fetchRequiredDocuments(
      requestData?.productId,
      'GSP',
      'SELC',
      addError,
      setRequiredDocuments
    ).finally(() => setLoading(false));
  }, [requiredDocumentsEnabled, requestData?.productId]);

  useEffect(() => {
    const retrivedDocuments = requiredDocuments.map(
      (rd): UploadedDocument => ({
        id: uniqueId(`${rd.id}-`),
        documentCode: rd.id,
        name: rd.name,
        title: '',
        documentType: 'REQUIRED',
      })
    );
    setDocuments(retrivedDocuments);
  }, [requiredDocuments]);

  const handleErrorModalClose = () => setOpen(false);

  const handleErrorModalExit = () => {
    setActiveStepHistory(0);
    setActiveStep(0);
    setOpen(false);
  };

  const handleErrorModalConfirm = () => setOpen(false);

  const handleConfirmSubmit = () => {
    setOpenConfirmationModal(false);
    void submitDocuments(
      onboardingId as string,
      requiredDocuments,
      documents,
      addError,
      setLoading,
      () => {
        setOutcomeContentState('success');
        void triggerQualtricsIntercept({
          institutionDescription: institutionInfo?.name ?? '',
          productId: requestData?.productId ?? '',
          institutionType: institutionInfo?.institutionType ?? '',
        });
      },
      () => setOpen(true)
    );
  };

  const steps: Array<React.ReactNode> = [
    <StepUploadDocuments
      key="upload"
      requiredDocuments={requiredDocuments}
      documents={documents}
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
      requiredDocuments={requiredDocuments}
      documents={documents}
      forward={() => setOpenConfirmationModal(true)}
      back={() => setActiveStep(0)}
    />,
  ];

  const outcomeContent = {
    toBeCompleted: {
      title: '',
      description: [
        <>
          {requiredDocumentsEnabled === undefined ? (
            <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
          ) : requiredDocumentsEnabled ? (
            steps[activeStep]
          ) : (
            <CompleteRequest />
          )}
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
      <ConfirmOnboardingModal
        open={openConfirmationModal}
        productName={productId2ProductTitle(requestData?.productId ?? '')}
        onConfirm={handleConfirmSubmit}
        handleClose={() => setOpenConfirmationModal(false)}
      />
    </>
  ) : (
    <MessageNoAction {...outcomeContent.error} />
  );
}
