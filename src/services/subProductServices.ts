import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosError, AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { Problem, SelfcareParty } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import config from '../utils/config.json';
import { buildUrlLogo } from '../utils/constants';
import { ENV } from '../utils/env';

const fetchUserParties = async (
  setRequiredLogin: (required: boolean) => void,
  options?: {
    params?: { productId: string };
    onSuccess?: (parties: Array<SelfcareParty>) => void;
    onSuccessWithParties?: (parties: Array<SelfcareParty>) => void;
    onSuccessEmpty?: () => void;
    onError?: (error: AxiosError<Problem>) => void;
    trackingProductId?: string;
    trackEventOnStart?: string;
  }
) => {
  if (options?.trackEventOnStart) {
    trackEvent(options.trackEventOnStart);
  }

  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_USER_PARTIES' },
    {
      method: 'GET',
      ...(options?.params && { params: options.params }),
    },
    () => setRequiredLogin(true)
  );

  const outcome = getFetchOutcome(searchResponse);
  const parties = (searchResponse as AxiosResponse).data as Array<SelfcareParty>;

  if (outcome === 'success') {
    options?.onSuccess?.(parties);

    if (parties.length > 0) {
      options?.onSuccessWithParties?.(parties);
    } else {
      options?.onSuccessEmpty?.();
    }
  } else {
    const errorBody = (searchResponse as AxiosError<Problem>).response?.data;
    options?.onError?.(searchResponse as AxiosError<Problem>);

    if (options?.trackingProductId) {
      trackEvent('ONBOARDING_REDIRECT_TO_ONBOARDING_FAILURE', {
        product_id: options.trackingProductId,
        reason: errorBody?.detail,
      });
    }
  }
};

export const onExitPremiumFlow = async (
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  productId: string | undefined
) => {
  await fetchUserParties(setRequiredLogin, {
    trackEventOnStart: 'PREMIUM_USER EXIT',
    trackingProductId: productId,
    onSuccessWithParties: () => {
      window.location.assign(ENV.URL_FE.DASHBOARD);
    },
    onSuccessEmpty: () => {
      window.location.assign('https://www.pagopa.it/it/prodotti-e-servizi/app-io');
    },
  });
};

export const getPricingPlan = async (
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setPricingPlanCategory: Dispatch<SetStateAction<any>>
) => {
  const configJsinResponse = await fetchWithLogs(
    {
      endpoint: 'CONFIG_JSON_CDN_URL',
    },
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
    () => setRequiredLogin(true)
  );

  const restOutcome = getFetchOutcome(configJsinResponse);
  if (restOutcome === 'success') {
    const response = (configJsinResponse as AxiosResponse).data;
    setPricingPlanCategory(response);
  } else {
    setPricingPlanCategory(config);
  }
};

export const handleSearchUserParties = async (
  setParties: (parties: Array<SelfcareParty>) => void,
  setRequiredLogin: (required: boolean) => void,
  _productId: string,
  subProductId: string
) => {
  await fetchUserParties(setRequiredLogin, {
    params: { productId: subProductId },
    onSuccess: (parties) => {
      setParties(
        parties.map((p: any) => ({
          ...p,
          urlLogo: buildUrlLogo(p.id),
        }))
      );
    },
    onError: () => {
      setParties([]);
    },
  });
};
