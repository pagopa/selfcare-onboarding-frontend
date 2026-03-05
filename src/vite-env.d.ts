/// <reference types="vite/client" />
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'uat' | 'production' | 'test';

    VITE_MOCK_API: string;
  }
}
interface Window {
  Stripe: any;
}
