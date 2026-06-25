import { Dispatch, SetStateAction } from 'react';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { PartyRegistryProxyApi } from '../api/PartyRegistryProxyApiClient';
import { UoData } from '../model/UoModel';

export const verifyRecipientCodeIsValid = async (
  recipientCode: string,
  uoSelected: UoData | undefined,
  formik: any,
  setRecipientCodeStatus: Dispatch<SetStateAction<string | undefined>>,
  originId?: string
) => {
  try {
    const result = await OnboardingApi.verifyRecipientCode(originId ?? '', recipientCode);
    if (uoSelected && result && result === 'DENIED_NO_BILLING') {
      formik.setFieldValue('recipientCode', undefined);
    }
    setRecipientCodeStatus(result);
  } catch (_error) {
    setRecipientCodeStatus('DENIED_NO_ASSOCIATION');
  }
};

export const verifyTaxCodeInvoicing = async (
  taxCodeInvoicing: string,
  formik: any,
  setInvalidTaxCodeInvoicing: Dispatch<SetStateAction<boolean>>
) => {
  try {
    const uoList = await PartyRegistryProxyApi.getUoList(taxCodeInvoicing);
    const match = uoList.items.find((uo) => uo.codiceFiscaleEnte === formik.values.taxCode);
    setInvalidTaxCodeInvoicing(!match);
  } catch (_error) {
    // Legacy behaviour: on error the validation flag was left untouched.
  }
};
