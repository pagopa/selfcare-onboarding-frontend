import { RoutesObject } from '../../types';
import CompleteRequestComponent from '../views/uploadContract/complete/CompleteRequestComponent';
import NoProductPage from '../views/NoProductPage';
import Onboarding from '../views/onboarding/Onboarding';
import OnBoardingSubProduct from '../views/OnBoardingSubProduct/OnBoardingSubProduct';
import CancelRequestComponent from '../views/uploadContract/cancel/CancelRequestComponent';
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
    COMPONENT: CompleteRequestComponent,
  },
  REGISTRATION_FINALIZE_REJECT: {
    PATH: `${BASE_ROUTE}/cancel`,
    LABEL: 'Cancella la procedura di onboarding',
    COMPONENT: CancelRequestComponent,
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
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/institutions/onboarding',
  },
  ONBOARDING_COMPLETE_REGISTRATION: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/tokens/{{token}}/complete',
  },

  // institutions present on self care db
  ONBOARDING_GET_USER_PARTIES: {
    URL: ENV.URL_API.partyExternalId + '/institutions',
  },
  ONBOARDING_GET_ONBOARDING_DATA: {
    URL: ENV.URL_API.ONBOARDING + '/institutions/onboarding/',
  },
  ONBOARDING_USER_VALIDATION: {
    URL: ENV.URL_API.ONBOARDING + '/users/validate',
  },
  ONBOARDING_TOKEN_VALIDATION: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/tokens/{{onboardingId}}/verify',
  },
  ONBOARDING_GET_CONTRACT: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/tokens/{{onboardingId}}/contract',
  },
  ONBOARDING_GET_GEOTAXONOMY: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/geotaxonomies',
  },
  ONBOARDING_GET_PREVIOUS_GEOTAXONOMIES: {
    URL: ENV.URL_API.ONBOARDING + '/institutions/geographicTaxonomies',
  },
  ONBOARDING_GET_LOCATION_BY_ISTAT_CODE: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/geotaxonomies/{{geoTaxId}}',
  },
  ONBOARDING_GET_UO_CODE_INFO: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/uo/{{codiceUniUo}}',
  },
  ONBOARDING_GET_UO_LIST: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/uo',
  },
  ONBOARDING_GET_AOO_CODE_INFO: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/aoo/{{codiceUniAoo}}',
  },
  ONBOARDING_GET_SA_PARTIES_NAME: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/stations',
  },
  ONBOARDING_GET_SA_PARTY_FROM_FC: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/stations/{{id}}',
  },
  ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/insurance-companies',
  },
  ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/insurance-companies/origin/{{code}}',
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

export const requiredError = 'Required';

export const fiscalAndVatCodeRegexp = new RegExp(
  /^(?:[A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST][0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z][0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]|[0-9]{11})$/
);
export const fiveCharactersAllowed = new RegExp('^\\d{5}$');
export const reaValidation = new RegExp('^[A-Za-z]{2}');
export const commercialRegisterNumberRegexp = new RegExp('^\\d{11}$');
export const numericField = new RegExp('^[0-9]*$');
export const currencyField = new RegExp(/^(0|[1-9][0-9]*(?:(,[0-9]*)*|[0-9]*))((\\.|,)[0-9]+)*$/);
export const onlyCharacters = new RegExp(/^[A-Za-z\s]*$/);

export const filterByCategory = (institutionType?: string, productId?: string) =>
  productId === 'prod-pn'
    ? 'L6,L4,L45,L35,L5,L17,L15,C14'
    : institutionType === 'GSP'
    ? 'L37,SAG'
    : 'C17,C16,L10,L19,L13,L2,C10,L20,L21,L22,L15,L1,C13,C5,L40,L11,L39,L46,L8,L34,L7,L35,L45,L47,L6,L12,L24,L28,L42,L36,L44,C8,C3,C7,C14,L16,C11,L33,C12,L43,C2,L38,C1,L5,L4,L31,L18,L17,S01,SA';
