import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined = env.get('PUBLIC_URL').asString();

export const ENV = {
  PUBLIC_URL: PUBLIC_URL_INNER ? PUBLIC_URL_INNER : '/onboarding',

  ASSISTANCE: {
    ENABLE: env.get('REACT_APP_ENABLE_ASSISTANCE').required().asBool(),
    EMAIL: env.get('REACT_APP_PAGOPA_HELP_EMAIL').required().asString(),
  },

  URL_FE: {
    LOGIN: env.get('REACT_APP_URL_FE_LOGIN').required().asString(),
    LOGOUT: env.get('REACT_APP_URL_FE_LOGOUT').required().asString(),
    DASHBOARD: env.get('REACT_APP_URL_FE_DASHBOARD').required().asString(),
    LANDING: env.get('REACT_APP_URL_FE_LANDING').required().asString(),
  },

  URL_API: {
    PARTY_PROCESS: env.get('REACT_APP_URL_API_PARTY_PROCESS').required().asString(),
    ONBOARDING: env.get('REACT_APP_URL_API_ONBOARDING').required().asString(),
    PARTY_REGISTRY_PROXY: env.get('REACT_APP_URL_API_PARTY_REGISTRY_PROXY').required().asString(),
  },

  MAX_INSTITUTIONS_FETCH: env.get('REACT_APP_MAX_INSTITUTIONS_FETCH').required().asIntPositive(),

  UPLOAD_CONTRACT_MAX_LOOP_ERROR: env
    .get('REACT_APP_UPLOAD_CONTRACT_MAX_LOOP_ERROR')
    .required()
    .asIntPositive(),
};
