import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined = env.get('PUBLIC_URL').asString();

export const ENV = {
  ENV: env.get('REACT_APP_ENV').required().asString(),
  PUBLIC_URL: PUBLIC_URL_INNER ? PUBLIC_URL_INNER : '/onboarding',

  URL_INSTITUTION_LOGO: {
    PREFIX: env.get('REACT_APP_URL_INSTITUTION_LOGO_PREFIX').required().asString(),
    SUFFIX: env.get('REACT_APP_URL_INSTITUTION_LOGO_SUFFIX').required().asString(),
  },

  ASSISTANCE: {
    ENABLE: env.get('REACT_APP_ENABLE_ASSISTANCE').required().asBool(),
    EMAIL: env.get('REACT_APP_PAGOPA_HELP_EMAIL').required().asString(),
  },

  URL_FE: {
    LOGIN: env.get('REACT_APP_URL_FE_LOGIN').required().asString(),
    LOGOUT: env.get('REACT_APP_URL_FE_LOGOUT').required().asString(),
    DASHBOARD: env.get('REACT_APP_URL_FE_DASHBOARD').required().asString(),
    LANDING: env.get('REACT_APP_URL_FE_LANDING').required().asString(),
    ASSISTANCE: env.get('REACT_APP_URL_FE_ASSISTANCE').required().asString(),
  },

  URL_API: {
    PARTY_PROCESS: env.get('REACT_APP_URL_API_PARTY_PROCESS').required().asString(),
    ONBOARDING: env.get('REACT_APP_URL_API_ONBOARDING').required().asString(),
    PARTY_REGISTRY_PROXY: env.get('REACT_APP_URL_API_PARTY_REGISTRY_PROXY').required().asString(),
    // GEOTAXONOMY: env.get('REACT_APP_URL_GEOTAXONOMY').required().asString(),
    GEOTAXONOMY:'https://api.dev.selfcare.pagopa.it/external/geotaxonomy'
  },

  MAX_INSTITUTIONS_FETCH: env.get('REACT_APP_MAX_INSTITUTIONS_FETCH').required().asIntPositive(),

  UPLOAD_CONTRACT_MAX_LOOP_ERROR: env
    .get('REACT_APP_UPLOAD_CONTRACT_MAX_LOOP_ERROR')
    .required()
    .asIntPositive(),

  ANALYTCS: {
    ENABLE: env.get('REACT_APP_ANALYTICS_ENABLE').default('false').asBool(),
    MOCK: env.get('REACT_APP_ANALYTICS_MOCK').default('false').asBool(),
    DEBUG: env.get('REACT_APP_ANALYTICS_DEBUG').default('false').asBool(),
    TOKEN: env.get('REACT_APP_MIXPANEL_TOKEN').required().asString(),
    API_HOST: env
      .get('REACT_APP_MIXPANEL_API_HOST')
      .default('https://api-eu.mixpanel.com')
      .asString(),
  },
};
