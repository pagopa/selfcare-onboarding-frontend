// eslint-disable-next-line spaced-comment
/// <reference types="react-scripts" />
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'uat' | 'production';

    REACT_APP_URL_FE_LOGIN: string;
    REACT_APP_URL_FE_LOGOUT: string;
    REACT_APP_URL_FE_DASHBOARD: string;
    REACT_APP_URL_FE_LANDING: string;

    REACT_APP_URL_API_PARTY_PROCESS: string;
    REACT_APP_URL_API_PARTY_REGISTRY_PROXY: string;
    REACT_APP_URL_API_PARTY_MANAGEMENT: string;

    REACT_APP_PAGOPA_HELP_EMAIL: string;
  }
}
interface Window {
  Stripe: any;
}
