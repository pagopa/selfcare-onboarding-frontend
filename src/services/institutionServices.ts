import { Dispatch, SetStateAction } from 'react';
import { AxiosResponse } from 'axios';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';

export const handleSearchByTaxCode = async (
  query: string,
  filterCategories: string | undefined,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setRetrievedIstat: Dispatch<SetStateAction<string | undefined>>,
  setOriginId4Premium: Dispatch<SetStateAction<string | undefined>>
) => {
  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
    {
      method: 'GET',
      params: {
        origin: 'IPA',
        categories: filterCategories,
      },
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    setRetrievedIstat((searchResponse as AxiosResponse).data.istatCode);
    setOriginId4Premium((searchResponse as AxiosResponse).data.originId);
  }
};

export const getUoInfoFromRecipientCode = async (
  recipientCode: string,
  setDisableTaxCodeInvoicing: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  formik: any
) => {
  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_UO_CODE_INFO', endpointParams: { codiceUniUo: recipientCode } },
    {
      method: 'GET',
      params: undefined,
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    formik.setFieldValue(
      'taxCodeInvoicing',
      (searchResponse as AxiosResponse).data?.codiceFiscaleSfe
    );
    setDisableTaxCodeInvoicing(true);
  } else {
    setDisableTaxCodeInvoicing(false);
  }
};
