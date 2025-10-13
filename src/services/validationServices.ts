import { trackEvent } from "@pagopa/selfcare-common-frontend/lib/services/analyticsService";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";
import { InstitutionType, Problem, ProblemUserValidate, UserOnCreate } from "../../types";
import { StepBillingDataHistoryState } from "../components/steps/StepOnboardingFormData";
import { fetchWithLogs } from "../lib/api-utils";
import { getFetchOutcome } from "../lib/error-utils";

export const verifyVatNumber = async (
    institutionType: InstitutionType,
    externalInstitutionId: string,
    formik: any,
    stepHistoryState: StepBillingDataHistoryState,
    setVatVerificationGenericError: Dispatch<SetStateAction<boolean>>,
    setIsVatRegistrated: Dispatch<SetStateAction<boolean>>,
    setOpenVatNumberErrorModal: Dispatch<SetStateAction<boolean>>,
    setRequiredLogin: Dispatch<SetStateAction<boolean>>,
    productId: string | undefined,
) => {
  const onboardingStatus = await fetchWithLogs(
    {
      endpoint: 'VERIFY_ONBOARDING',
    },
    {
      method: 'HEAD',
      params: {
        taxCode: institutionType === 'PA' ? externalInstitutionId : formik.values?.taxCode,
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
  onRedirectToLogin: () => void,
  setLoading: (loading: boolean) => void,
  eventName: string
) => {
  setLoading(true);

  const resultValidation = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_USER_VALIDATION',
    },
    {
      method: 'POST',
      data: {
        name: user.name,
        surname: user.surname,
        taxCode: user.taxCode,
      },
    },
    onRedirectToLogin
  );

  const result = getFetchOutcome(resultValidation);
  const errorBody = (resultValidation as AxiosError<ProblemUserValidate>).response?.data;

  if (
    result === 'error' &&
    (resultValidation as AxiosError<Problem>).response?.status === 409 &&
    errorBody
  ) {
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
  setLoading(false);
};