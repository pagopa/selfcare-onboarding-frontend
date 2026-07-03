import { AppError } from '@pagopa/selfcare-common-frontend/lib/model/AppError';
import { Dispatch, SetStateAction } from 'react';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { RequiredDocument } from '../model/Documents';

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

