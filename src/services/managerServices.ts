import { AppError } from '@pagopa/selfcare-common-frontend/lib/model/AppError';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { InstitutionTypeEnum } from '../api/generated/onboarding/CheckManagerDto';
import { UsersObject } from '../components/steps/StepAddManager';
import { OnboardingFormData } from '../model/OnboardingFormData';

export const checkManager = async (
  userId: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setIsChangedManager: Dispatch<SetStateAction<boolean>>,
  institutionType: InstitutionTypeEnum | undefined,
  selectedParty: any,
  onboardingFormData: OnboardingFormData | undefined,
  addError: (error: AppError) => void,
  validateUserData: (
    userData: any,
    key: string,
    externalInstitutionId: string,
    subProduct?: any
  ) => void,
  people: UsersObject,
  externalInstitutionId: string,
  product: any,
  subProduct: any,
  requestId: string
) => {
  setLoading(true);
  try {
    const { result } = await OnboardingApi.checkManager({
      productId: product?.id,
      userId,
      institutionType,
      origin: selectedParty?.origin,
      originId: selectedParty?.originId,
      subunitCode: onboardingFormData?.aooUniqueCode ?? onboardingFormData?.uoUniqueCode,
      taxCode: selectedParty?.taxCode ?? onboardingFormData?.taxCode,
    });

    setIsChangedManager(!result);
    if (!result) {
      trackEvent('CHANGE_LEGAL_REPRESENTATIVE', {
        request_id: requestId,
        party_id: externalInstitutionId,
        product_id: product?.id,
        from: 'onboarding',
      });
    }
    if (result) {
      validateUserData(
        people['manager-initial'],
        'manager-initial',
        externalInstitutionId,
        subProduct
      );
    }
  } catch (error) {
    addError({
      id: 'CHECK_MANAGER_ERROR',
      blocking: false,
      error: error as Error,
      techDescription: 'Failed to check manager status',
      toNotify: true,
    });
    validateUserData(
      people['manager-initial'],
      'manager-initial',
      externalInstitutionId,
      subProduct
    );
  } finally {
    setLoading(false);
  }
};

export const searchUserId = async (
  taxCode: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  addError: (error: AppError) => void,
  validateUserData: (
    userData: any,
    key: string,
    externalInstitutionId: string,
    subProduct?: any
  ) => void,
  people: UsersObject,
  externalInstitutionId: string,
  subProduct: any,
  setIsChangedManager: Dispatch<SetStateAction<boolean>>,
  institutionType: InstitutionTypeEnum | undefined,
  selectedParty: any,
  onboardingFormData: OnboardingFormData | undefined,
  product: any
) => {
  setLoading(true);

  try {
    const requestId = uniqueId();
    const response = await OnboardingApi.searchUserId({ taxCode });

    if (response) {
      void checkManager(
        response.id,
        setLoading,
        setIsChangedManager,
        institutionType,
        selectedParty,
        onboardingFormData,
        addError,
        validateUserData,
        people,
        externalInstitutionId,
        product,
        subProduct,
        requestId
      );
    }
  } catch (error) {
    addError({
      id: 'SEARCH_USER_ERROR',
      blocking: false,
      error: error as Error,
      techDescription: `An error occurred while searching the user with the taxCode ${taxCode}`,
      toNotify: true,
    });
    validateUserData(
      people['manager-initial'],
      'manager-initial',
      externalInstitutionId,
      subProduct
    );
  } finally {
    setLoading(false);
  }
};
