// eslint-disable-next-line spaced-comment
/// <reference types="react-scripts" />
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'uat' | 'production';
        REACT_APP_LOGIN_URL: string;
        REACT_APP_LOGOUT_URL: string;
        }
    }
    interface Window {
        Stripe: any;
    }