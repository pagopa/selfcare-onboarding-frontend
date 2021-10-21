// eslint-disable-next-line spaced-comment
/// <reference types="react-scripts" />
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'uat' | 'production';
    REACT_APP_URL_FE_LOGIN: string;
    REACT_APP_URL_FE_LOGOUT: string;
    REACT_APP_URL_FE_DASHBOARD: string;
    URL_API_PARTY_PROCESS: string;
    URL_API_PARTY_REGISTRY_PROXY: string;
    URL_API_PARTY_MANAGEMENT: string;
  }
}
interface Window {
  Stripe: any;
}
