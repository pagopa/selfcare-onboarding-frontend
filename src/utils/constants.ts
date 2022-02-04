import { RoutesObject } from '../../types';
import Onboarding from '../views/Onboarding';
import RejectRegistration from '../views/RejectRegistration';
import CompleteRegistrationComponent from '../views/CompleteRegistrationComponent';
import NoProductPage from '../views/NoProductPage';
import { ENV } from './env';

const IS_DEVELOP = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export const DISPLAY_LOGS: boolean = IS_DEVELOP;
export const MOCK_USER: boolean = IS_DEVELOP;

export const BASE_ROUTE = ENV.PUBLIC_URL;

export const ROUTES: RoutesObject = {
  ONBOARDING_ROOT: {
    PATH: `${BASE_ROUTE}/`,
    LABEL: 'Onboarding',
    EXACT: true,
    COMPONENT: NoProductPage,
  },
  REGISTRATION_FINALIZE_COMPLETE: {
    PATH: `${BASE_ROUTE}/confirm`,
    LABEL: 'Completa la procedura di onboarding',
    COMPONENT: CompleteRegistrationComponent,
  },
  REGISTRATION_FINALIZE_REJECT: {
    PATH: `${BASE_ROUTE}/cancel`,
    LABEL: 'Cancella la procedura di onboarding',
    COMPONENT: RejectRegistration,
  },
  ONBOARDING: {
    PATH: `${BASE_ROUTE}/:productId`,
    LABEL: 'Onboarding',
    EXACT: true,
    COMPONENT: Onboarding,
  },
};

export const API = {
  VERIFY_ONBOARDING: {
    URL:
      ENV.URL_API.PARTY_PROCESS +
      '/onboarding/organization/{{institutionId}}/products/{{productId}}',
  },

  ONBOARDING_VERIFY_PRODUCT: {
    URL: ENV.URL_API.ONBOARDING + '/product/{{productId}}',
  },

  ONBOARDING_GET_SEARCH_PARTIES: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/institutions',
  },
  ONBOARDING_GET_PARTY: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/institutions/{{institutionId}}',
  },
  ONBOARDING_POST_LEGALS: {
    URL:
      ENV.URL_API.ONBOARDING + '/institutions/{{institutionId}}/products/{{productId}}/onboarding',
  },
  ONBOARDING_COMPLETE_REGISTRATION: {
    URL: ENV.URL_API.PARTY_PROCESS + '/onboarding/complete/{{token}}',
  },
};

export const USER_ROLE_LABEL = {
  Manager: 'admin', // 'rappresentante legale',
  Delegate: 'delegato',
  Operator: 'operatore',
};

export const USER_PLATFORM_ROLE_LABEL = {
  admin: 'amministratore',
  security: 'operatore di sicurezza',
  api: 'operatore API',
};
