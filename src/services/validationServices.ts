import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";
import { fetchWithLogs } from "../lib/api-utils";
import { getFetchOutcome } from "../lib/error-utils";
import { InstitutionType } from "../../types";
import { StepBillingDataHistoryState } from "../components/steps/StepOnboardingFormData";

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
