// eslint-disable-next-line spaced-comment
/// <reference types="react-scripts" />
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'uat' | 'production';

    VITE_MOCK_API: string;
  }
}
interface Window {
  Stripe: any;
}
