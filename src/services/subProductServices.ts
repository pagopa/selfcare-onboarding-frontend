import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { Problem, SelfcareParty } from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { HttpError } from '../lib/error-utils';
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
