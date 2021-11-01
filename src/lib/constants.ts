import {RoutesObject} from '../../types';
import {Onboarding} from '../views/Onboarding';
import CompleteRegistrationComponent from "../views/CompleteRegistrationComponent";
/* 
import { CompleteRegistration } from '../views/CompleteRegistration'
import { RejectRegistration } from '../views/RejectRegistration'
import { TempSPIDUser } from '../components/TempSPIDUser'
import { IPAGuide } from '../views/IPAGuide' */

const IS_DEVELOP = process.env.NODE_ENV === 'development';

export const DISPLAY_LOGS = IS_DEVELOP;

export const BASE_ROUTE = '/onboarding';

export const URL_FE_LOGIN: string = process.env.REACT_APP_URL_FE_LOGIN;
export const URL_FE_LOGOUT: string = process.env.REACT_APP_URL_FE_LOGOUT;
export const URL_FE_DASHBOARD: string = process.env.REACT_APP_URL_FE_DASHBOARD;

export const URL_API_PARTY_PROCESS: string = process.env.REACT_APP_URL_API_PARTY_PROCESS;
export const URL_API_PARTY_REGISTRY_PROXY: string =
    process.env.REACT_APP_URL_API_PARTY_REGISTRY_PROXY;
export const URL_API_PARTY_MANAGEMENT: string = process.env.REACT_APP_URL_API_PARTY_MANAGEMENT;

export const ROUTES: RoutesObject = {
    ONBOARDING: {
        PATH: `${BASE_ROUTE}`,
        LABEL: 'Onboarding',
        EXACT: true,
        COMPONENT: Onboarding,
    },

  // IPA_GUIDE: { PATH: `${BASE_ROUTE}/guida-ipa`, LABEL: 'Accreditarsi su IPA', COMPONENT: IPAGuide },
  // TEMP_SPID_USER: {
  //   PATH: `${BASE_ROUTE}/temp-spid`,
  //   LABEL: 'Genera utente SPID di test',
  //   COMPONENT: TempSPIDUser,
  // },
    REGISTRATION_FINALIZE_COMPLETE: {
        PATH: `${BASE_ROUTE}/confirm`,
        LABEL: 'Completa la procedura di onboarding',
        COMPONENT: CompleteRegistrationComponent,
    }
    /*
  REGISTRATION_FINALIZE_REJECT: {
    PATH: `${BASE_ROUTE}/cancella-registrazione`,
    LABEL: 'Cancella la procedura di onboarding',
    COMPONENT: RejectRegistration,
  }, */,
};

export const API = {
    BASE: {
        URL: '',
    },
    ONBOARDING_GET_AVAILABLE_PARTIES: {
        URL: URL_API_PARTY_PROCESS + '/onboarding/info/{{taxCode}}',
    },
    ONBOARDING_GET_SEARCH_PARTIES: {
        URL: URL_API_PARTY_REGISTRY_PROXY + '/institutions',
    },
    ONBOARDING_POST_LEGALS: {
        URL: URL_API_PARTY_PROCESS + '/onboarding/legals',
    },
    ONBOARDING_COMPLETE_REGISTRATION: {
        URL: URL_API_PARTY_PROCESS + '/onboarding/complete/{{token}}',
    },
    PARTY_GET_PARTY_ID: {
        URL: URL_API_PARTY_MANAGEMENT + '/organizations/{{institutionId}}',
    },
    MOCK_UPLOAD:{
        URL: 'https://petstore.swagger.io/v2/pet/1/uploadImage',
    }
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
