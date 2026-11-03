import { AppError } from '@pagopa/selfcare-common-frontend/lib/model/AppError';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { PartyData, Product, UserOnCreate } from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { CheckManagerDto, InstitutionTypeEnum } from '../api/generated/onboarding/CheckManagerDto';
import { UsersObject } from '../components/steps/StepAddManager';
import { OnboardingFormData } from '../model/OnboardingFormData';

type ManagerParty = Pick<PartyData, 'origin' | 'originId' | 'taxCode'>;

type ValidateUserData = (
  userData: UserOnCreate,
  key: string,
  externalInstitutionId: string,
  subProduct?: Product
) => void;

export const checkManager = async (
  userId: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setIsChangedManager: Dispatch<SetStateAction<boolean>>,
  institutionType: InstitutionTypeEnum | undefined,
  selectedParty: ManagerParty | undefined,
  onboardingFormData: OnboardingFormData | undefined,
  addError: (error: AppError) => void,
  validateUserData: ValidateUserData,
  people: UsersObject,
  externalInstitutionId: string,
  product: Pick<Product, 'id'> | null | undefined,
  subProduct: Product | undefined,
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
    } as CheckManagerDto);

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
  validateUserData: ValidateUserData,
  people: UsersObject,
  externalInstitutionId: string,
  subProduct: Product | undefined,
  setIsChangedManager: Dispatch<SetStateAction<boolean>>,
  institutionType: InstitutionTypeEnum | undefined,
  selectedParty: ManagerParty | undefined,
  onboardingFormData: OnboardingFormData | undefined,
  product: Pick<Product, 'id'> | null | undefined
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
    } else {
      validateUserData(
        people['manager-initial'],
        'manager-initial',
        externalInstitutionId,
        subProduct
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
