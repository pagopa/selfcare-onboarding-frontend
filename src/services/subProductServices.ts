import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { Problem, SelfcareParty } from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome, HttpError } from '../lib/error-utils';
import config from '../utils/config.json';
import { buildUrlLogo } from '../utils/constants';
import { ENV } from '../utils/env';

const fetchUserParties = async (
  options?: {
    params?: { productId: string };
    onSuccess?: (parties: Array<SelfcareParty>) => void;
    onSuccessWithParties?: (parties: Array<SelfcareParty>) => void;
    onSuccessEmpty?: () => void;
    onError?: (error: unknown) => void;
    trackingProductId?: string;
    trackEventOnStart?: string;
  }
) => {
  if (options?.trackEventOnStart) {
    trackEvent(options.trackEventOnStart);
  }

  try {
    const parties = (await OnboardingApi.getInstitutions(
      options?.params?.productId
    )) as Array<SelfcareParty>;
    options?.onSuccess?.(parties);

    if (parties.length > 0) {
      options?.onSuccessWithParties?.(parties);
    } else {
      options?.onSuccessEmpty?.();
    }
  } catch (error) {
    options?.onError?.(error);
    if (options?.trackingProductId) {
      const errorBody = (error as HttpError)?.httpBody as Problem | undefined;
      trackEvent('ONBOARDING_REDIRECT_TO_ONBOARDING_FAILURE', {
        product_id: options.trackingProductId,
        reason: errorBody?.detail,
      });
    }
  }
};

export const onExitPremiumFlow = async (
  productId: string | undefined
) => {
  await fetchUserParties({
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

// NOTE: getPricingPlan stays on fetchWithLogs because CONFIG_JSON_CDN_URL is a
// CDN file fetch, not a backend API call - no codegen client applies.
export const getPricingPlan = async (
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  setPricingPlanCategory: Dispatch<SetStateAction<any>>
) => {
  const configJsinResponse = await fetchWithLogs(
    { endpoint: 'CONFIG_JSON_CDN_URL' },
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
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
  _productId: string,
  subProductId: string
) => {
  await fetchUserParties({
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
