import { useErrorDispatcher } from '@pagopa/selfcare-common-frontend';
import { productId2ProductTitle } from '@pagopa/selfcare-common-frontend/lib/utils/productId2ProductTitle';
import { uniqueId } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmOnboardingModal } from '../../../components/modals/ConfirmOnboardingRequest';
import { LoadingOverlay } from '../../../components/modals/LoadingOverlay';
import { RequiredDocument, UploadedDocument } from '../../../model/Documents';
import { fetchRequiredDocuments, submitDocuments } from '../../../services/documentServices';
import { CompleteRequestFailPage } from '../../onboardingRequest/complete/pages/CompleteRequestFailPage';
import StepUploadDocuments from './step/StepUploadDocuments';
import UploadedContractsSummary from './step/UploadedContractsSummary';

type Props = {
  onboardingId: string;
  productId: string;
  institutionType: string;
  origin: string;
  onSuccess: () => void;
  back: () => void;
};

const UploadDocumentsFlow = ({
  onboardingId,
  productId,
  institutionType,
  origin,
  onSuccess,
  back,
}: Props) => {
  const { t } = useTranslation();
  const addError = useErrorDispatcher();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState<Array<RequiredDocument>>([]);
  const [documents, setDocuments] = useState<Array<UploadedDocument>>([]);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    void fetchRequiredDocuments(
      productId,
      institutionType,
      origin,
      addError,
      setRequiredDocuments
    ).finally(() => setLoading(false));
  }, [productId, institutionType, origin]);

  useEffect(() => {
    setDocuments(
      requiredDocuments.map(
        (rd): UploadedDocument => ({
          id: uniqueId(`${rd.id}-`),
          documentCode: rd.id,
          name: rd.name,
          title: '',
          documentType: 'REQUIRED',
        })
      )
    );
  }, [requiredDocuments]);

  const handleConfirmSubmit = () => {
    setOpenConfirmationModal(false);
    void submitDocuments(
      onboardingId,
      requiredDocuments,
      documents,
      addError,
      setLoading,
      onSuccess,
      () => setError(true)
    );
  };

  if (loading) {
    return <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />;
  }

  if (error) {
    return <CompleteRequestFailPage back={() => setError(false)} />;
  }

  return (
    <>
      {activeStep === 0 ? (
        <StepUploadDocuments
          requiredDocuments={requiredDocuments}
          documents={documents}
          setDocuments={setDocuments}
          loading={loading}
          forward={() => setActiveStep(1)}
          back={back}
        />
      ) : (
        <UploadedContractsSummary
          requiredDocuments={requiredDocuments}
          documents={documents}
          forward={() => setOpenConfirmationModal(true)}
          back={() => setActiveStep(0)}
        />
      )}
      <ConfirmOnboardingModal
        open={openConfirmationModal}
        productName={productId2ProductTitle(productId)}
        onConfirm={handleConfirmSubmit}
        handleClose={() => setOpenConfirmationModal(false)}
      />
    </>
  );
};

export default UploadDocumentsFlow;
