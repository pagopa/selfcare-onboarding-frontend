export const ENV = {
  ENV: import.meta.env.VITE_ENV,
  PUBLIC_URL: import.meta.env.PUBLIC_URL_INNER ?? '/onboarding',

  URL_INSTITUTION_LOGO: {
    PREFIX: import.meta.env.VITE_URL_INSTITUTION_LOGO_PREFIX,
    SUFFIX: import.meta.env.VITE_URL_INSTITUTION_LOGO_SUFFIX,
  },

  JSON_URL: {
    PLAN_PRICES: import.meta.env.VITE_PLANS_PRICES,
    COUNTRIES: import.meta.env.VITE_COUNTRY_DATA
  },

  EXAMPLE_CSV: import.meta.env.VITE_AGGREGATES_EXAMPLE_CSV,
  BASE_PATH_CDN_URL: import.meta.env.VITE_URL_CDN,

  ASSISTANCE: {
    ENABLE: import.meta.env.VITE_ENABLE_ASSISTANCE,
    EMAIL: import.meta.env.VITE_PAGOPA_HELP_EMAIL
  },

  URL_DOCUMENTATION: 'https://docs.pagopa.it/area-riservata/',

  URL_FE: {
    LOGIN: import.meta.env.VITE_URL_FE_LOGIN,
    LOGOUT: import.meta.env.VITE_URL_FE_LOGOUT,
    DASHBOARD: import.meta.env.VITE_URL_FE_DASHBOARD,
    LANDING: import.meta.env.VITE_URL_FE_LANDING,
    ASSISTANCE: import.meta.env.VITE_URL_FE_ASSISTANCE,
  },

  URL_API: {
    ONBOARDING: import.meta.env.VITE_URL_API_ONBOARDING,
    ONBOARDING_V2: import.meta.env.VITE_URL_API_ONBOARDING_V2,
    PARTY_REGISTRY_PROXY: import.meta.env.VITE_URL_API_PARTY_REGISTRY_PROXY,
    GEOTAXONOMY: import.meta.env.VITE_URL_GEOTAXONOMY,
  },

  MAX_INSTITUTIONS_FETCH: import.meta.env.VITE_MAX_INSTITUTIONS_FETCH,

  UPLOAD_CONTRACT_MAX_LOOP_ERROR: import.meta.env.VITE_UPLOAD_CONTRACT_MAX_LOOP_ERROR,

  ANALYTCS: {
    ENABLE: import.meta.env.VITE_ANALYTICS_ENABLE,
    MOCK: import.meta.env.VITE_ANALYTICS_MOCK,
    DEBUG: import.meta.env.VITE_ANALYTICS_DEBUG,
    TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN,
    API_HOST: import.meta.env.VITE_MIXPANEL_API_HOST
  },

  GEOTAXONOMY: {
    SHOW_GEOTAXONOMY: import.meta.env.VITE_ENABLE_GEOTAXONOMY,
  },

  AOO_UO: {
    SHOW_AOO_UO: import.meta.env.VITE_ENABLE_AOO_UO,
  },

  PT: {
    SHOW_PT: import.meta.env.VITE_ENABLE_PT,
  },

  AGGREGATOR: {
    SHOW_AGGREGATOR: import.meta.env.VITE_ENABLE_AGGREGATOR,
    ELIGIBLE_PRODUCTS: import.meta.env.VITE_AGGREGATOR_ELIGIBLE_PRODUCTS
  },

  SCP_INFOCAMERE: {
    SHOW: import.meta.env.VITE_ENABLE_SCP_INFOCAMERE
  },

  PRV: {
    SHOW: import.meta.env.VITE_ENABLE_PRV
  },

  PURE_PRV: {
    SHOW: import.meta.env.VITE_ENABLE_PURE_PRV
  },

  GPU: {
    SHOW: import.meta.env.VITE_ENABLE_GPU
  },
};
