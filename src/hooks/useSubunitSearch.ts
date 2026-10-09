import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { PartyData } from '../../types';
import { UserContext } from '../lib/context';
import { AooData } from '../model/AooData';
import { UoData } from '../model/UoModel';
import {
  getECDataByCF,
  handleSearchByAooCode,
  handleSearchByUoCode,
} from '../services/institutionServices';
import { isSendProduct } from '../utils/institutionTypeUtils';
import { useHistoryState } from './useHistoryState';

type Params = {
  productId?: string;
  subunitTypeByQuery: string;
  subunitCodeByQuery: string;
  filterCategories?: string;
  setApiLoading: Dispatch<SetStateAction<boolean>>;
};

export const useSubunitSearch = ({
  productId,
  subunitTypeByQuery,
  subunitCodeByQuery,
  filterCategories,
  setApiLoading,
}: Params) => {
  const { setRequiredLogin } = useContext(UserContext);
  const isSend = isSendProduct(productId);

  const [aooResult, setAooResult, setAooResultHistory] = useHistoryState<AooData | undefined>(
    'aooSelected_step1',
    undefined
  );
  const [uoResult, setUoResult, setUoResultHistory] = useHistoryState<UoData | undefined>(
    'uoSelected_step1',
    undefined
  );
  const [ecData, setEcData] = useState<PartyData | null>(null);

  useEffect(() => {
    if (!isSend) {
      return;
    }
    if (subunitTypeByQuery === 'UO') {
      void handleSearchByUoCode(
        subunitCodeByQuery,
        setUoResult,
        setUoResultHistory,
        setRequiredLogin,
        setApiLoading,
        false,
        'ONBOARDING_GET_UO_CODE_INFO',
        {},
        filterCategories,
        productId
      );
    } else if (subunitTypeByQuery === 'AOO') {
      void handleSearchByAooCode(
        subunitCodeByQuery,
        setAooResult,
        setAooResultHistory,
        setRequiredLogin,
        setApiLoading,
        false,
        'ONBOARDING_GET_AOO_CODE_INFO',
        {},
        filterCategories,
        productId
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSend]);

  useEffect(() => {
    if (aooResult) {
      void getECDataByCF(aooResult.codiceFiscaleEnte, setApiLoading, setEcData);
    } else if (uoResult) {
      void getECDataByCF(uoResult.codiceFiscaleEnte, setApiLoading, setEcData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aooResult, uoResult]);

  return { aooResult, setAooResult, uoResult, setUoResult, ecData };
};
