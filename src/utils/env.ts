import * as env from 'env-var';

export const PUBLIC_URL: string = env.get('PUBLIC_URL').default('/onboarding').asString();

export const ENABLE_ASSISTANCE: boolean = env
  .get('REACT_APP_ENABLE_ASSISTANCE')
  .required()
  .asBool();

export const PAGOPA_HELP_EMAIL: string = env
  .get('REACT_APP_PAGOPA_HELP_EMAIL')
  .required()
  .asString();

export const URL_FE_LOGIN: string = env.get('REACT_APP_URL_FE_LOGIN').required().asString();
export const URL_FE_LOGOUT: string = env.get('REACT_APP_URL_FE_LOGOUT').required().asString();
export const URL_FE_DASHBOARD: string = env.get('REACT_APP_URL_FE_DASHBOARD').required().asString();
export const URL_FE_LANDING: string = env.get('REACT_APP_URL_FE_LANDING').required().asString();

export const URL_API_PARTY_PROCESS: string = env
  .get('REACT_APP_URL_API_PARTY_PROCESS')
  .required()
  .asString();

export const URL_API_ONBOARDING: string = env
  .get('REACT_APP_URL_API_ONBOARDING')
  .required()
  .asString();

export const URL_API_PARTY_REGISTRY_PROXY: string = env
  .get('REACT_APP_URL_API_PARTY_REGISTRY_PROXY')
  .required()
  .asString();

export const MAX_INSTITUTIONS_FETCH: number = env
  .get('REACT_APP_MAX_INSTITUTIONS_FETCH')
  .required()
  .asIntPositive();

export const UPLOAD_CONTRACT_MAX_LOOP_ERROR: number = env
  .get('REACT_APP_UPLOAD_CONTRACT_MAX_LOOP_ERROR')
  .required()
  .asIntPositive();
