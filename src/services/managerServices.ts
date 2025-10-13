import { AppError } from '@pagopa/selfcare-common-frontend/lib/model/AppError';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosResponse } from 'axios';
import { uniqueId } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { InstitutionType } from '../../types';
import { UsersObject } from '../components/steps/StepAddManager';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { OnboardingFormData } from '../model/OnboardingFormData';

export const checkManager = async (
  userId: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setIsChangedManager: Dispatch<SetStateAction<boolean>>,
  institutionType: InstitutionType | undefined,
  selectedParty: any,
  onboardingFormData: OnboardingFormData | undefined,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
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
  const request = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_CHECK_MANAGER',
    },
    {
      method: 'POST',
      data: {
        institutionType,
        origin: selectedParty?.origin,
        originId: selectedParty?.originId,
        productId: product?.id,
        subunitCode: onboardingFormData?.aooUniqueCode ?? onboardingFormData?.uoUniqueCode,
        taxCode: selectedParty?.taxCode ?? onboardingFormData?.taxCode,
        userId,
      },
    },
    () => setRequiredLogin(true)
  );

  const result = getFetchOutcome(request);
  const response = (request as AxiosResponse).data.result;

  if (result === 'success') {
    setIsChangedManager(!response);
    if (!response) {
      trackEvent('CHANGE_LEGAL_REPRESENTATIVE', {
        request_id: requestId,
        party_id: externalInstitutionId,
        product_id: product?.id,
        from: 'onboarding',
      });
    }
    if (response) {
      validateUserData(
        people['manager-initial'],
        'manager-initial',
        externalInstitutionId,
        subProduct
      );
    }
  } else {
    addError({
      id: 'CHECK_MANAGER_ERROR',
      blocking: false,
      error: response as Error,
      techDescription: 'Failed to check manager status',
      toNotify: true,
    });
    validateUserData(
      people['manager-initial'],
      'manager-initial',
      externalInstitutionId,
      subProduct
    );
  }
  setLoading(false);
};

export const searchUserId = async (
  taxCode: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
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
  institutionType: InstitutionType | undefined,
  selectedParty: any,
  onboardingFormData: OnboardingFormData | undefined,
  product: any,
) => {
  setLoading(true);
  const requestId = uniqueId();
  const request = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_SEARCH_USER',
    },
    {
      method: 'POST',
      data: {
        taxCode,
      },
    },
    () => setRequiredLogin(true)
  );

  const result = getFetchOutcome(request);
  const response = (request as AxiosResponse).data;
  if (result === 'success') {
    if (response) {
      void checkManager(
        response.id,
        setLoading,
        setIsChangedManager,
        institutionType,
        selectedParty,
        onboardingFormData,
        setRequiredLogin,
        addError,
        validateUserData,
        people,
        externalInstitutionId,
        product,
        subProduct,
        requestId
      );
    }
  } else {
    addError({
      id: 'SEARCH_USER_ERROR',
      blocking: false,
      error: response as Error,
      techDescription: `An error occurred while searching the user with the taxCode ${taxCode}`,
      toNotify: true,
    });
    validateUserData(
      people['manager-initial'],
      'manager-initial',
      externalInstitutionId,
      subProduct
    );
  }
  setLoading(false);
};
