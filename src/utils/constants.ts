import { RoutesObject } from '../../types';
import CompleteRegistrationComponent from '../views/CompleteRegistrationComponent';
import NoProductPage from '../views/NoProductPage';
import Onboarding from '../views/onboarding/Onboarding';
import OnBoardingSubProduct from '../views/OnBoardingSubProduct/OnBoardingSubProduct';
import RejectRegistration from '../views/RejectRegistration';
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
  ONBOARDING_SUBPRODUCT: {
    PATH: `${BASE_ROUTE}/:productId/:subProductId`,
    LABEL: 'Onboarding SubProduct',
    EXACT: true,
    COMPONENT: OnBoardingSubProduct,
  },
};

export const API = {
  VERIFY_ONBOARDING: {
    URL: ENV.URL_API.ONBOARDING + '/institutions/{{externalInstitutionId}}/products/{{productId}}',
  },

  VERIFY_ONBOARDED_VAT_NUMBER: {
    URL: ENV.URL_API.ONBOARDING + '/institutions/onboarding',
  },

  ONBOARDING_VERIFY_PRODUCT: {
    URL: ENV.URL_API.ONBOARDING + '/product/{{productId}}',
  },

  // institutions present on Ipa
  ONBOARDING_GET_SEARCH_PARTIES: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/institutions',
  },
  ONBOARDING_GET_PARTY: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/institutions/{{externalInstitutionId}}',
  },
  ONBOARDING_GET_PARTY_FROM_CF: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/institutions/{{id}}',
  },
  ONBOARDING_POST_LEGALS: {
    URL: ENV.URL_API.ONBOARDING + '/institutions/onboarding',
  },
  ONBOARDING_COMPLETE_REGISTRATION: {
    URL: ENV.URL_API.ONBOARDING + '/tokens/{{token}}/complete',
  },

  // institutions present on self care db
  ONBOARDING_GET_USER_PARTIES: {
    URL: ENV.URL_API.ONBOARDING + '/institutions',
  },
  ONBOARDING_GET_ONBOARDING_DATA: {
    URL:
      ENV.URL_API.ONBOARDING +
      '/institutions/{{externalInstitutionId}}/products/{{productId}}/onboarded-institution-info',
  },
  ONBOARDING_USER_VALIDATION: {
    URL: ENV.URL_API.ONBOARDING + '/users/validate',
  },
  ONBOARDING_TOKEN_VALIDATION: {
    URL: ENV.URL_API.ONBOARDING + '/tokens/{{token}}/verify',
  },
  ONBOARDING_GET_GEOTAXONOMY: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/geotaxonomies',
  },
  ONBOARDING_GET_PREVIOUS_GEOTAXONOMIES: {
    URL: ENV.URL_API.ONBOARDING + '/institutions/geographicTaxonomies',
  },
  ONBOARDING_GET_UO_CODE_INFO: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/uo/{{codiceUniUo}}',
  },
  ONBOARDING_GET_AOO_CODE_INFO: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/aoo/{{codiceUniAoo}}',
  },
  ONBOARDING_GET_SA_PARTIES_NAME: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/pdnd',
  },
  ONBOARDING_GET_SA_PARTY_FROM_FC: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/station/{{id}}',
  }
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
