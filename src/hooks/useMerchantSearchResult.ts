import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { PartyData } from '../../types';
import { PDNDBusinessResource } from '../model/PDNDBusinessResource';
import { isIdpayMerchantProduct } from '../utils/institutionTypeUtils';

const STORAGE_KEY = 'merchantSearchResult';
const FORWARD_KEY = 'onboarding_forward';

const readStoredResult = (): PDNDBusinessResource | undefined => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : undefined;
  } catch {
    return undefined;
  }
};

export const useMerchantSearchResult = (
  setDisabled: Dispatch<SetStateAction<boolean>>,
  productId?: string,
  selected?: PartyData | null
) => {
  const isMerchant = isIdpayMerchantProduct(productId);
  const [merchantSearchResult, setMerchantSearchResultState] = useState<
    PDNDBusinessResource | undefined
  >(() => (isMerchant ? readStoredResult() : undefined));

  const clearMerchantStorage = useCallback(() => {
    if (isMerchant) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [isMerchant]);

  const setMerchantSearchResult = useCallback(
    (value?: PDNDBusinessResource) => {
      setMerchantSearchResultState(value);
      if (!isMerchant) {
        return;
      }
      if (value === undefined) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    },
    [isMerchant]
  );

  const disabledStatusCompany =
    merchantSearchResult?.statusCompanyRI !== undefined ||
    merchantSearchResult?.disabledStateInstitution !== undefined ||
    merchantSearchResult?.descriptionStateInstitution !== undefined ||
    merchantSearchResult?.statusCompanyRD !== undefined;

  useEffect(
    () => () => {
      if (isMerchant && !sessionStorage.getItem(FORWARD_KEY)) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    },
    [isMerchant]
  );

  useEffect(() => {
    if (isMerchant && selected && !sessionStorage.getItem(STORAGE_KEY) && merchantSearchResult) {
      setMerchantSearchResult(undefined);
      setDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, isMerchant]);

  return {
    merchantSearchResult,
    setMerchantSearchResult,
    disabledStatusCompany,
    clearMerchantStorage,
  };
};
