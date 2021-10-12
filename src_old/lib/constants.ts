import { RoutesObject } from '../../types';
/* import { Onboarding } from '../views/Onboarding'
import { CompleteRegistration } from '../views/CompleteRegistration'
import { RejectRegistration } from '../views/RejectRegistration'
import { TempSPIDUser } from '../components/TempSPIDUser'
import { IPAGuide } from '../views/IPAGuide' */

const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const USE_MOCK_SPID_USER = IS_DEVELOP;
export const DISPLAY_LOGS = IS_DEVELOP;

export const BASE_ROUTE = '';
/*
export const ROUTES: RoutesObject = {
  IPA_GUIDE: { PATH: `${BASE_ROUTE}/guida-ipa`, LABEL: 'Accreditarsi su IPA', COMPONENT: IPAGuide },
  TEMP_SPID_USER: {
    PATH: `${BASE_ROUTE}/temp-spid`,
    LABEL: 'Genera utente SPID di test',
    COMPONENT: TempSPIDUser,
  },
  ONBOARDING: {
    PATH: `${BASE_ROUTE}`,
    LABEL: 'Onboarding',
    EXACT: true,
    COMPONENT: Onboarding,
  },
  REGISTRATION_FINALIZE_COMPLETE: {
    PATH: `${BASE_ROUTE}/conferma-registrazione`,
    LABEL: 'Completa la procedura di onboarding',
    COMPONENT: CompleteRegistration,
  },
  REGISTRATION_FINALIZE_REJECT: {
    PATH: `${BASE_ROUTE}/cancella-registrazione`,
    LABEL: 'Cancella la procedura di onboarding',
    COMPONENT: RejectRegistration,
  },
} */

export const API = {
  BASE: {
    URL: '',
  },
  ONBOARDING_GET_AVAILABLE_PARTIES: {
    URL: 'pdnd-interop-uservice-party-process/0.0.1/onboarding/info/{{taxCode}}',
  },
  ONBOARDING_GET_SEARCH_PARTIES: {
    URL: 'pdnd-interop-uservice-party-registry-proxy/0.0.1/institutions',
  },
  ONBOARDING_POST_LEGALS: {
    URL: 'pdnd-interop-uservice-party-process/0.0.1/onboarding/legals',
  },
  ONBOARDING_COMPLETE_REGISTRATION: {
    URL: 'pdnd-interop-uservice-party-process/0.0.1/onboarding/complete/{{token}}',
  },
  PARTY_GET_PARTY_ID: {
    URL: 'pdnd-interop-uservice-party-management/0.0.1/organizations/{{institutionId}}',
  },
};

export const USER_ROLE_LABEL = {
  Manager: 'admin', // 'rappresentante legale',
  Delegate: 'delegato',
  Operator: 'operatore',
};

export const USER_PLATFORM_ROLE_LABEL = {
  admin: 'amministratore',
  security: 'operatore di sicurezza',
  api: 'operatore API',
};
