import { RoutesObject } from '../../types';
import Onboarding from '../views/Onboarding';
import RejectRegistration from '../views/RejectRegistration';
import CompleteRegistrationComponent from '../views/CompleteRegistrationComponent';
import NoProductPage from '../views/NoProductPage';
import {
  PUBLIC_URL,
  URL_API_ONBOARDING,
  URL_API_PARTY_PROCESS,
  URL_API_PARTY_REGISTRY_PROXY,
} from './env';

const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const DISPLAY_LOGS = IS_DEVELOP;
export const MOCK_USER = process.env.REACT_APP_MOCK_USER;

export const BASE_ROUTE = PUBLIC_URL;

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
      URL_API_PARTY_PROCESS + '/onboarding/organization/{{institutionId}}/products/{{productId}}',
  },
  ONBOARDING_GET_SEARCH_PARTIES: {
    URL: URL_API_PARTY_REGISTRY_PROXY + '/institutions',
  },
  ONBOARDING_GET_PARTY: {
    URL: URL_API_PARTY_REGISTRY_PROXY + '/institutions/{{institutionId}}',
  },
  ONBOARDING_POST_LEGALS: {
    URL: URL_API_ONBOARDING + '/institutions/{{institutionId}}/products/{{productId}}/onboarding',
  },
  ONBOARDING_COMPLETE_REGISTRATION: {
    URL: URL_API_PARTY_PROCESS + '/onboarding/complete/{{token}}',
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
