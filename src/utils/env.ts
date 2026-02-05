import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined = env.get('PUBLIC_URL').asString();

export const ENV = {
  ENV: env.get('VITE_ENV').required().asString(),
  PUBLIC_URL: PUBLIC_URL_INNER ? PUBLIC_URL_INNER : '/onboarding',

  URL_INSTITUTION_LOGO: {
    PREFIX: env.get('VITE_URL_INSTITUTION_LOGO_PREFIX').required().asString(),
    SUFFIX: env.get('VITE_URL_INSTITUTION_LOGO_SUFFIX').required().asString(),
  },

  JSON_URL: {
    PLAN_PRICES: env.get('VITE_PLANS_PRICES').required().asString(),
    COUNTRIES: env.get('VITE_COUNTRY_DATA').required().asString(),
  },

  EXAMPLE_CSV: env.get('VITE_AGGREGATES_EXAMPLE_CSV').required().asString(),
  BASE_PATH_CDN_URL: env.get('VITE_URL_CDN').required().asString(),

  ASSISTANCE: {
    ENABLE: env.get('VITE_ENABLE_ASSISTANCE').required().asBool(),
    EMAIL: env.get('VITE_PAGOPA_HELP_EMAIL').required().asString(),
  },

  URL_DOCUMENTATION: 'https://docs.pagopa.it/area-riservata/',

  URL_FE: {
    LOGIN: env.get('VITE_URL_FE_LOGIN').required().asString(),
    LOGOUT: env.get('VITE_URL_FE_LOGOUT').required().asString(),
    DASHBOARD: env.get('VITE_URL_FE_DASHBOARD').required().asString(),
    LANDING: env.get('VITE_URL_FE_LANDING').required().asString(),
    ASSISTANCE: env.get('VITE_URL_FE_ASSISTANCE').required().asString(),
  },

  URL_API: {
    ONBOARDING: env.get('VITE_URL_API_ONBOARDING').required().asString(),
    ONBOARDING_V2: env.get('VITE_URL_API_ONBOARDING_V2').required().asString(),
    PARTY_REGISTRY_PROXY: env.get('VITE_URL_API_PARTY_REGISTRY_PROXY').required().asString(),
    GEOTAXONOMY: env.get('VITE_URL_GEOTAXONOMY').required().asString(),
  },

  MAX_INSTITUTIONS_FETCH: env.get('VITE_MAX_INSTITUTIONS_FETCH').required().asIntPositive(),

  UPLOAD_CONTRACT_MAX_LOOP_ERROR: env
    .get('VITE_UPLOAD_CONTRACT_MAX_LOOP_ERROR')
    .required()
    .asIntPositive(),

  ANALYTCS: {
    ENABLE: env.get('VITE_ANALYTICS_ENABLE').default('false').asBool(),
    MOCK: env.get('VITE_ANALYTICS_MOCK').default('false').asBool(),
    DEBUG: env.get('VITE_ANALYTICS_DEBUG').default('false').asBool(),
    TOKEN: env.get('VITE_MIXPANEL_TOKEN').required().asString(),
    API_HOST: env
      .get('VITE_MIXPANEL_API_HOST')
      .default('https://api-eu.mixpanel.com')
      .asString(),
  },

  GEOTAXONOMY: {
    SHOW_GEOTAXONOMY: env.get('VITE_ENABLE_GEOTAXONOMY').default('false').asBool(),
  },

  AOO_UO: {
    SHOW_AOO_UO: env.get('VITE_ENABLE_AOO_UO').default('false').asBool(),
  },

  PT: {
    SHOW_PT: env.get('VITE_ENABLE_PT').default('false').asBool(),
  },

  AGGREGATOR: {
    SHOW_AGGREGATOR: env.get('VITE_ENABLE_AGGREGATOR').default('false').asBool(),
    ELIGIBLE_PRODUCTS: env
      .get('VITE_AGGREGATOR_ELIGIBLE_PRODUCTS')
      .default('prod-io,prod-pn')
      .asString(),
  },

  SCP_INFOCAMERE: {
    SHOW: env.get('VITE_ENABLE_SCP_INFOCAMERE').default('false').asBool(),
  },

  PRV: {
    SHOW: env.get('VITE_ENABLE_PRV').default('false').asBool(),
  },

  PURE_PRV: {
    SHOW: env.get('VITE_ENABLE_PURE_PRV').default('false').asBool(),
  },

  GPU: {
    SHOW: env.get('VITE_ENABLE_GPU').default('false').asBool(),
  },
};
