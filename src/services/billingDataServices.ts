import { AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { UoData } from '../model/UoModel';

export const verifyRecipientCodeIsValid = async (
  recipientCode: string,
  uoSelected: UoData | undefined,
  formik: any,
  setRecipientCodeStatus: Dispatch<SetStateAction<string | undefined>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  originId?: string
) => {
  const getRecipientCodeValidation = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_RECIPIENT_CODE_VALIDATION',
    },
    {
      method: 'GET',
      params: {
        recipientCode,
        originId,
      },
    },
    () => setRequiredLogin(true)
  );

  const responseOutcome = getFetchOutcome(getRecipientCodeValidation);

  if (responseOutcome === 'success') {
    const result = (getRecipientCodeValidation as AxiosResponse).data;
    if (uoSelected && result && result === 'DENIED_NO_BILLING') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formik.setFieldValue('recipientCode', undefined);
    }
    setRecipientCodeStatus(result);
  } else {
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

  const responseOutcome = getFetchOutcome(getUoList);

  if (responseOutcome === 'success') {
    const uoList = (getUoList as AxiosResponse).data.items;
    const match = uoList.find((uo: any) => uo.codiceFiscaleEnte === formik.values.taxCode);
    if (match) {
      setInvalidTaxCodeInvoicing(false);
    } else {
      setInvalidTaxCodeInvoicing(true);
    }
  }
};
