import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { InstitutionType, ProblemUserValidate, UserOnCreate } from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { StepBillingDataHistoryState } from '../components/steps/StepOnboardingFormData';
import { fetchWithLogs } from '../lib/api-utils';
import { getErrorStatus, getFetchOutcome, HttpError } from '../lib/error-utils';
import { isPublicAdministration } from '../utils/institutionTypeUtils';

export const verifyVatNumber = async (
  institutionType: InstitutionType,
  externalInstitutionId: string,
  formik: any,
  stepHistoryState: StepBillingDataHistoryState,
  setVatVerificationGenericError: Dispatch<SetStateAction<boolean>>,
  setIsVatRegistrated: Dispatch<SetStateAction<boolean>>,
  setOpenVatNumberErrorModal: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  productId: string | undefined
) => {
  const onboardingStatus = await fetchWithLogs(
    {
      endpoint: 'VERIFY_ONBOARDING',
    },
    {
      method: 'HEAD',
      params: {
        taxCode: isPublicAdministration(institutionType)
          ? externalInstitutionId
          : formik.values?.taxCode,
        productId,
        verifyType: 'EXTERNAL',
        vatNumber: stepHistoryState.isTaxCodeEquals2PIVA
          ? formik.values.taxCode
          : formik.values.vatNumber,
      },
    },
    () => setRequiredLogin(true)
  );

  const restOutcome = getFetchOutcome(onboardingStatus);

  if (restOutcome === 'success') {
    setVatVerificationGenericError(false);
    setIsVatRegistrated(true);
  } else if ((onboardingStatus as AxiosError).response?.status === 404) {
    setIsVatRegistrated(false);
    setVatVerificationGenericError(false);
  } else {
    setOpenVatNumberErrorModal(true);
    setVatVerificationGenericError(true);
  }
};

export const userValidate = async (
  partyId: string,
  user: UserOnCreate,
  userId: string,
  onForwardAction: () => void,
  onValidationError: (userId: string, errors: { [fieldName: string]: Array<string> }) => void,
  setLoading: (loading: boolean) => void,
  eventName: string
) => {
  setLoading(true);

  try {
    await OnboardingApi.userValidate(user.name ?? '', user.surname ?? '', user.taxCode ?? '');
    onForwardAction();
  } catch (error) {
    const status = getErrorStatus(error);
    if (status === 409 && (error as HttpError).httpBody) {
      const errorBody = (error as HttpError).httpBody as ProblemUserValidate;
      trackEvent(`${eventName}_CONFLICT_ERROR`, {
        party_id: partyId,
        reason: errorBody.detail,
      });
      onValidationError(
        userId,
        Object.fromEntries(errorBody?.invalidParams?.map((e: any) => [e.name, ['conflict']]) ?? [])
      );
    } else {
      onForwardAction();
    }
  } finally {
    setLoading(false);
  }
};
