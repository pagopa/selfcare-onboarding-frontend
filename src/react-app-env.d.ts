// eslint-disable-next-line spaced-comment
/// <reference types="react-scripts" />
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'uat' | 'production';
    REACT_APP_URL_FE_LOGIN: string;
    REACT_APP_URL_FE_LOGOUT: string;
    REACT_APP_URL_FE_DASHBOARD: string;
    REACT_APP_URL_API_ONBOARDING: string;
  }
}
interface Window {
  Stripe: any;
}
