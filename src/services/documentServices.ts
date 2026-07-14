import { AppError } from '@pagopa/selfcare-common-frontend/lib/model/AppError';
import { Dispatch, SetStateAction } from 'react';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { RequiredDocument, UploadedDocument } from '../model/Documents';

export const requiredDocumentsFlow = async (
  productId: string,
  institutionType: string,
  origin: string,
  addError: (error: AppError) => void,
  setRequiredDocumentsEnabled: Dispatch<SetStateAction<boolean | undefined>>
): Promise<void> => {
  try {
    const response = await OnboardingApi.getRequiredDocumentsEnabled(
      productId,
      institutionType,
      origin
    );
    setRequiredDocumentsEnabled(response.requiredDocumentsEnabled);
  } catch (error) {
    addError({
      id: 'REQUIRED_DOCUMENTS_FLOW_ERROR',
      blocking: false,
      error: error as Error,
      techDescription: 'Failed to retrieve required documents status',
      toNotify: true,
    });
    setRequiredDocumentsEnabled(false);
  }
};

export const fetchRequiredDocuments = async (
  productId: string,
  institutionType: string,
  origin: string,
  addError: (error: AppError) => void,
  setRequiredDocuments: Dispatch<SetStateAction<Array<RequiredDocument>>>
): Promise<void> => {
  try {
    setRequiredDocuments(
      await OnboardingApi.getRequiredDocuments(productId, institutionType, origin)
    );
  } catch (error) {
    addError({
      id: 'GET_REQUIRED_DOCUMENTS_ERROR',
      blocking: false,
      error: error as Error,
      techDescription: 'Failed to retrieve required documents list',
      toNotify: true,
    });
    setRequiredDocuments([]);
  }
};

export const submitDocuments = async (
  onboardingId: string,
  requiredDocuments: Array<RequiredDocument>,
  documents: Array<UploadedDocument>,
  addError: (error: AppError) => void,
  setLoading: Dispatch<SetStateAction<boolean>>,
  onSuccess: () => void,
  onError: () => void
  // eslint-disable-next-line sonarjs/cognitive-complexity
): Promise<void> => {
  setLoading(true);
  try {
    for (const rd of requiredDocuments) {
      const docs = documents.filter((d) => d.documentCode === rd.id);
      const isMulti = (rd.maxDocumentsRequired ?? 1) > 1;
      for (const [i, doc] of docs.entries()) {
        if (!doc.file) {
          continue;
        }
        const attachmentName = isMulti
          ? i === 0
            ? `${rd.id}.pdf`
            : `${rd.id}-${i + 1}.pdf`
          : `${rd.id}.pdf`;
        // eslint-disable-next-line no-await-in-loop
        await OnboardingApi.uploadAttachment(
          onboardingId,
          attachmentName,
          doc.file,
          rd.id, // attachmentId (= documentCode)
          doc.title || undefined // attachmentDescription (facoltativo)
        );
      }
    }
    await OnboardingApi.triggerOnboarding(onboardingId); // PUT idempotente
    setLoading(false);
    onSuccess();
  } catch (error) {
    setLoading(false);
    addError({
      id: 'SUBMIT_DOCUMENTS_ERROR',
      blocking: false,
      error: error as Error,
      techDescription: 'Failed to upload documents / trigger onboarding',
      toNotify: true,
    });
    onError();
  }
};
