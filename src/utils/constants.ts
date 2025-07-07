import { InstitutionType, RoutesObject } from '../../types';
import NoProductPage from '../views/NoProductPage';
import OnboardingPremium from '../views/onboardingPremium/OnboardingPremium';
import OnboardingProduct from '../views/onboardingProduct/OnboardingProduct';
import CancelRequest from '../views/onboardingRequest/cancel/CancelRequest';
import CompleteRequest from '../views/onboardingRequest/complete/CompleteRequest';
import DownloadCsvFile from '../views/onboardingRequest/download/DownloadCsvFile';
import OnboardingUser from '../views/onboardingUser/OnboardingUser';
import { ENV } from './env';

const IS_DEVELOP = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export const DISPLAY_LOGS: boolean = IS_DEVELOP;
export const MOCK_USER: boolean = IS_DEVELOP;
export const LOG_REDUX_ACTIONS = IS_DEVELOP;
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
    LABEL: 'Complete onboarding request',
    COMPONENT: CompleteRequest,
  },
  REGISTRATION_FINALIZE_REJECT: {
    PATH: `${BASE_ROUTE}/cancel`,
    LABEL: 'Cancel onboarding request',
    COMPONENT: CancelRequest,
  },
  ONBOARDING_FILE_DOWNLOAD: {
    PATH: `${BASE_ROUTE}/:onboardingId/products/:productId/aggregates`,
    LABEL: 'Csv file download',
    COMPONENT: DownloadCsvFile,
  },
  ONBOARDING_USER: {
    PATH: `${BASE_ROUTE}/user`,
    LABEL: 'Onboarding user',
    EXACT: true,
    COMPONENT: OnboardingUser,
  },
  ONBOARDING_PRODUCT: {
    PATH: `${BASE_ROUTE}/:productId`,
    LABEL: 'Onboarding product',
    EXACT: true,
    COMPONENT: OnboardingProduct,
  },
  ONBOARDING_PREMIUM: {
    PATH: `${BASE_ROUTE}/:productId/:subProductId`,
    LABEL: 'Onboarding premium',
    EXACT: true,
    COMPONENT: OnboardingPremium,
  },
};

export const API = {
  VERIFY_ONBOARDING: {
    URL: ENV.URL_API.ONBOARDING + '/institutions/onboarding',
  },

  ONBOARDING_VERIFY_PRODUCT: {
    URL: ENV.URL_API.ONBOARDING + '/product/{{productId}}',
  },

  // configuration file on cdn

  CONFIG_JSON_CDN_URL: {
    URL: ENV.BASE_PATH_CDN_URL + '/assets/config.json',
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
  ONBOARDING_NEW_USER: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v1/users/onboarding',
  },
  ONBOARDING_COMPLETE_REGISTRATION: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/tokens/{{token}}/complete',
  },
  USER_COMPLETE_REGISTRATION: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/tokens/{{token}}/complete-onboarding-users',
  },

  // institutions present on self care db
  ONBOARDING_GET_USER_PARTIES: {
    URL: ENV.URL_API.ONBOARDING + '/institutions',
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
  ONBOARDING_RECIPIENT_CODE_VALIDATION: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/institutions/onboarding/recipient-code/verification',
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
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/stations/{{taxId}}',
  },
  ONBOARDING_GET_INSURANCE_COMPANIES_FROM_BUSINESSNAME: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/insurance-companies',
  },
  ONBOARDING_GET_INSURANCE_COMPANIES_FROM_IVASSCODE: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/insurance-companies/{{taxId}}',
  },
  ONBOARDING_GET_PARTY_BY_CF_FROM_INFOCAMERE: {
    URL: ENV.URL_API.PARTY_REGISTRY_PROXY + '/infocamere-pdnd/institution/{{id}}',
  },
  ONBOARDING_GET_PRODUCTS: {
    URL: ENV.URL_API.ONBOARDING + '/products',
  },
  ONBOARDING_GET_ALLOWED_ADD_USER_PRODUCTS: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v1/products/admin',
  },
  ONBOARDING_GET_INSTITUTIONS: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/institutions',
  },
  ONBOARDING_SEARCH_USER: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v1/users/search-user',
  },
  ONBOARDING_CHECK_MANAGER: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v1/users/check-manager',
  },
  ONBOARDING_VERIFY_AGGREGATES: {
    URL: ENV.URL_API.ONBOARDING_V2 + '/v2/institutions/onboarding/aggregation/verification',
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

export const PRODUCT_IDS = {
  PAGOPA: 'prod-pagopa',
  IO: 'prod-io',
  SEND: 'prod-pn',
  INTEROP: 'prod-interop',
  IDPAY: 'prod-idpay',
  IO_SIGN: 'prod-io-sign',
  FD: 'prod-fd',
  DASHBOARD_PSP: 'prod-dashboard-psp',
  IDPAY_MERCHANT: 'prod-idpay-merchant',
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

export const canInvoice = (institutionType?: string, productId?: string) =>
  institutionType !== 'SA' &&
  institutionType !== 'PT' &&
  institutionType !== 'AS' &&
  productId !== 'prod-interop';

export const noMandatoryIpaProducts = (productId?: string) =>
  productId !== 'prod-interop' &&
  productId !== 'prod-io' &&
  productId !== 'prod-io-sign' &&
  productId !== 'prod-idpay' &&
  !productId?.includes('prod-pn');

export const addUserFlowProducts = (productId: string) =>
  productId === 'prod-interop' ||
  productId === 'prod-pn' ||
  productId === 'prod-io' ||
  productId === 'prod-io-sign' ||
  productId === 'prod-pagopa';

export const institutionTypes: Array<{ labelKey: string; value: InstitutionType }> = [
  { labelKey: 'pa', value: 'PA' },
  { labelKey: 'gsp', value: 'GSP' },
  { labelKey: 'scp', value: 'SCP' },
  { labelKey: 'pt', value: 'PT' },
  { labelKey: 'psp', value: 'PSP' },
  { labelKey: 'sa', value: 'SA' },
  { labelKey: 'as', value: 'AS' },
  { labelKey: 'prv', value: 'PRV' },
  /* both are private entities but for two different products:
    prv -> "Enti Privati" (prod-interop), oth -> "Altro" (prod-pagopa) */
  { labelKey: 'oth', value: 'PRV' },
  { labelKey: 'gpu', value: 'GPU' },
];

// eslint-disable-next-line sonarjs/cognitive-complexity
export const institutionType4Product = (productId: string | undefined) => {
  switch (productId) {
    case PRODUCT_IDS.INTEROP:
      return institutionTypes.filter(
        (it) =>
          it.labelKey === 'pa' ||
          it.labelKey === 'gsp' ||
          it.labelKey === 'sa' ||
          (ENV.SCP_INFOCAMERE.SHOW && it.labelKey === 'scp') ||
          it.labelKey === 'as' ||
          (ENV.PRV.SHOW && it.labelKey === 'prv')
      );
    case PRODUCT_IDS.SEND:
      return institutionTypes.filter((it) => it.labelKey === 'pa');
    case PRODUCT_IDS.IDPAY:
      return institutionTypes.filter((it) => it.labelKey === 'pa');
    case PRODUCT_IDS.IO:
      return institutionTypes.filter(
        (it) =>
          it.labelKey === 'pa' ||
          it.labelKey === 'gsp' ||
          (ENV.PT.SHOW_PT ? it.labelKey === 'pt' : '')
      );
    case PRODUCT_IDS.PAGOPA:
      // Temporary re-enabled psp radiobutton for prod-pagopa only for dev environment.
      return institutionTypes.filter(
        (it) =>
          it.labelKey === 'pa' ||
          it.labelKey === 'gsp' ||
          (ENV.GPU.SHOW && it.labelKey === 'gpu') ||
          (ENV.ENV !== 'PROD' && it.labelKey === 'psp') ||
          (ENV.PT.SHOW_PT ? it.labelKey === 'pt' : '') ||
          (ENV.PURE_PRV.SHOW ? it.labelKey === 'oth' : '')
      );
    case PRODUCT_IDS.IO_SIGN:
      return institutionTypes.filter((it) => it.labelKey === 'pa' || it.labelKey === 'gsp');
    case PRODUCT_IDS.IDPAY_MERCHANT:
      return institutionTypes.filter((it) => it.labelKey === 'prv');
    default:
      return institutionTypes.filter(
        (it) => it.labelKey === 'pa' || it.labelKey === 'gsp' || it.labelKey === 'scp'
      );
  }
};

export const description4InstitutionType = (institutionType: {
  labelKey: string;
  value: InstitutionType;
}) => {
  switch (institutionType.value) {
    case 'PT':
      return 'stepInstitutionType.institutionTypes.pt.description';
    case 'PA':
      return 'stepInstitutionType.institutionTypes.pa.description';
    case 'GSP':
      return 'stepInstitutionType.institutionTypes.gsp.description';
    case 'SCP':
      return 'stepInstitutionType.institutionTypes.scp.description';
    case 'GPU':
      return 'stepInstitutionType.institutionTypes.gpu.description';
    case 'PSP':
    case 'SA':
    case 'AS':
    case 'PRV':
      return institutionType.labelKey === 'oth'
        ? 'stepInstitutionType.institutionTypes.oth.description'
        : '';
    default:
      return '';
  }
};

export const buildUrlLogo = (partyId: string) =>
  `${ENV.URL_INSTITUTION_LOGO.PREFIX}${partyId}${ENV.URL_INSTITUTION_LOGO.SUFFIX}`;
