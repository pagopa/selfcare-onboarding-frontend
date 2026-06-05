import { AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { UoData } from '../model/UoModel';
import { OnboardingApi } from '../api/OnboardingApiClient';

export const verifyRecipientCodeIsValid = async (
  recipientCode: string,
  uoSelected: UoData | undefined,
  formik: any,
  setRecipientCodeStatus: Dispatch<SetStateAction<string | undefined>>,
  originId?: string
) => {
  try {
    const response = await OnboardingApi.verifyRecipientCode(originId ?? '', recipientCode);

    if (uoSelected && response === 'DENIED_NO_BILLING') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formik.setFieldValue('recipientCode', undefined);
    }
    setRecipientCodeStatus(response);
  } catch (error) {
    setRecipientCodeStatus('DENIED_NO_ASSOCIATION');
  }
};

export const verifyTaxCodeInvoicing = async (
  taxCodeInvoicing: string,
  formik: any,
  setInvalidTaxCodeInvoicing: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  const getUoList = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_UO_LIST',
    },
    {
      method: 'GET',
      params: {
        taxCodeInvoicing,
      },
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(getUoList);

  if (outcome === 'success') {
    const uoList = (getUoList as AxiosResponse).data.items;
    const match = uoList.find((uo: any) => uo.codiceFiscaleEnte === formik.values.taxCode);
    if (match) {
      setInvalidTaxCodeInvoicing(false);
    } else {
      setInvalidTaxCodeInvoicing(true);
    }
  }
};
