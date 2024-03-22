import { UserRole } from '@pagopa/selfcare-common-frontend/utils/constants';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Endpoint,
  InstitutionOnboardingInfoResource,
  StationResource,
  Product,
  UserOnCreate,
  InsuranceCompaniesResource,
  OnboardingRequestData,
} from '../../../types';
import { BillingDataDto } from '../../model/BillingData';
import { GeographicTaxonomyResource, nationalValue } from '../../model/GeographicTaxonomies';
import { UoData } from '../../model/UoModel';
import { AooData } from './../../model/AooData';

const createPartyRegistryEntity = (
  id: string,
  o: string,
  ou: string,
  aoo: string,
  taxCode: string,
  zipCode: string,
  administrationCode: string,
  managerName: string,
  managerSurname: string,
  description: string,
  digitalAddress: string,
  originId: string,
  origin: string,
  category: string,
  address: string,
  istatCode: string
) => ({
  id,
  o,
  ou,
  aoo,
  taxCode,
  zipCode,
  administrationCode,
  managerName,
  managerSurname,
  description,
  digitalAddress,
  originId,
  origin,
  category,
  address,
  istatCode,
});

const createPartyEntity = (
  externalId: string,
  originId: string,
  id: string,
  description: string,
  urlLogo: string,
  address: string,
  digitalAddress: string,
  taxCode: string,
  zipCode: string,
  istatCode: string,
  userRole: UserRole = 'ADMIN',
  origin: string = 'IPA'
) => ({
  externalId,
  originId,
  id,
  description,
  urlLogo,
  address,
  digitalAddress,
  taxCode,
  zipCode,
  userRole,
  origin,
  istatCode,
});

const mockPartyRegistry = {
  items: [
    createPartyRegistryEntity(
      'id',
      'o',
      'ou',
      'aoo',
      '00000000000',
      '44332',
      '00000000000',
      'Mario',
      'Rossi',
      'AGENCY X',
      'mail@pec.mail.org',
      '991',
      'IPA',
      'g1122',
      'largo torino',
      '082050'
    ),
    createPartyRegistryEntity(
      'error',
      'oerfd',
      'gfgfgf',
      'dfdfdf',
      '11111111111',
      '01345',
      '11111111111',
      'Franco',
      'Bianchi',
      'AGENCY ERROR',
      'mail_ERROR_@pec.mail.org',
      '352',
      'IPA',
      'c723',
      'via lombardia',
      'istat2'
    ),
    createPartyRegistryEntity(
      'onboarded',
      'dfdff',
      'wertg',
      'gggfs',
      '22222222222',
      '12345',
      '22222222222',
      'Francesco',
      'Verdi',
      'AGENCY ONBOARDED',
      'mail_ONBOARDED_@pec.mail.org',
      '442',
      'IPA',
      'c11',
      'piazza rossi',
      'istat3'
    ),
    createPartyRegistryEntity(
      'pending',
      'gg4ed',
      'dss3r',
      'jtyte',
      '33333333333',
      '54321',
      '33333333333',
      'Luca',
      'Verde',
      'AGENCY PENDING',
      'mail_PENDING_@pec.mail.org',
      '221',
      'IPA',
      'c2234',
      'legal_se',
      'istat4'
    ),
    createPartyRegistryEntity(
      'infoError',
      'erer',
      'fdfew',
      'iyjrfggh',
      '99999999999',
      '12122',
      '99999999999',
      'Paolo',
      'Bianchi',
      'AGENCY INFO ERROR',
      'mail_INFOERROR_@pec.mail.org',
      '235',
      'IPA',
      'c14',
      'sede',
      'istat5'
    ),
    createPartyRegistryEntity(
      'notAllowed',
      'fdfdft',
      'bbfdf',
      'kyuehfw',
      '44444444444',
      '070889',
      '44444444444',
      'Mario_NOTALLOWED',
      'Rossi_NOTALLOWED',
      'Not Allowed',
      'mail_NOTALLOWED_@pec.mail.org',
      'originId6',
      'IPA',
      'c17',
      'leg',
      'istat6'
    ),
    createPartyRegistryEntity(
      'notAllowedInSubmit',
      'ererjfdv',
      'nnffse',
      'wewewett',
      '44444444444',
      '07089',
      '44444444444',
      'Maria_NOTALLOWED',
      'Rossa_NOTALLOWED',
      'Not Allowed Error on Submit',
      'mail_NOTALLOWEDINSUBMIT_@pec.mail.org',
      'originId7',
      'IPA',
      'c18',
      'ss',
      'istat7'
    ),
    // use case added for easily test new feature about taxCode equal to vatCode
    createPartyRegistryEntity(
      'idNotIpa',
      'od',
      'oud',
      'aood',
      '98765432123',
      '44382',
      '98765432123',
      'Ugo',
      'Diaz',
      'AGENCY NOT IPA',
      'mail@pec.mail.org',
      'originId1',
      'IPAIPA', // Origin not equal to IPA, enabled field
      'c17',
      'mockaddress',
      'istat8'
    ),
  ],
  count: 8,
};

const mockedParties = [
  createPartyEntity(
    '33445673222',
    '8576',
    '43446',
    'Comune di Milano',
    'logo1',
    'address1',
    'a@aa.com',
    '33445673222',
    '22345',
    '082050'
  ),
  createPartyEntity(
    'externalId2',
    '656653',
    '23231',
    'Comune di Bollate',
    'logo2',
    'address2',
    'a@cd.com',
    '11122233345',
    '22395',
    'istat2'
  ),
  createPartyEntity(
    'externalId3',
    '3232245',
    '76767645',
    'Comune di Venezia',
    'logo',
    'address',
    'a@aa.com',
    '33322268945',
    '02102',
    'istat3'
  ),
  createPartyEntity(
    'externalId4',
    '4545fg',
    '775644',
    'Comune di Gessate',
    'logo',
    '33445673210',
    'address4',
    'b@bb.com',
    '00022',
    'istat4'
  ),
  createPartyEntity(
    '33445673211',
    '57677',
    '5454679',
    'Comune di Udine',
    'logo',
    'address5',
    'b@cc.com',
    '33445673211',
    '33344',
    '082051',
    'ADMIN',
    'INFOCAMERE'
  ),
  createPartyEntity(
    'onboarded_externalId',
    'or2325',
    'p23412',
    'onboarded',
    'logo',
    'address',
    'a@aa.com',
    'BBBBBB22B22B234K',
    '12125',
    'istat6'
  ),
  createPartyEntity(
    'aooId',
    'or2325',
    'p4341',
    'test Aooo',
    'logo',
    'address',
    'a@aa.com',
    'BBBBBB22B22B234K',
    '12125',
    'istat7'
  ),
];

export const mockedGeoTaxonomy: Array<GeographicTaxonomyResource> = [
  {
    code: nationalValue,
    desc: 'ITALIA',
    country_abbreviation: 'IT',
    enabled: true,
    istat_code: '1212343',
    province_abbreviation: 'RM',
    province_id: '058',
    region_id: '12',
    country: 'ITALY',
  },
  {
    code: '2334',
    country: '232',
    country_abbreviation: 'IT',
    desc: 'MILANO - COMUNE',
    enabled: true,
    province_abbreviation: 'MI',
    province_id: '334',
    region_id: '43',
    istat_code: '233',
  },
  // Use case for verify correct elimination of - PROVINCIA geotaxonomies
  {
    code: '55556',
    country: '323',
    country_abbreviation: 'IT',
    desc: 'MILANO - PROVINCIA',
    enabled: true,
    province_abbreviation: 'MI',
    province_id: '2332',
    region_id: '66',
    istat_code: '754',
  },
  {
    code: '545456',
    country: '232',
    country_abbreviation: 'IT',
    desc: 'MILLESIMO - COMUNE',
    enabled: true,
    istat_code: '2233445',
    province_abbreviation: 'SV',
    province_id: '433',
    region_id: '65',
  },
];

export const mockedGeotaxonomies: Array<GeographicTaxonomyResource> = [
  {
    country: '100',
    enabled: true,
    code: '082053',
    desc: 'PALERMO - COMUNE',
    istat_code: '082050',
    province_id: '082',
    province_abbreviation: 'PA',
    region_id: '19',
    country_abbreviation: 'IT',
  },
  {
    country: '100',
    enabled: true,
    code: '082053',
    desc: 'ROMA - COMUNE',
    istat_code: '082051',
    province_id: '082',
    province_abbreviation: 'PA',
    region_id: '19',
    country_abbreviation: 'IT',
  },
];

const mockedAooCode: AooData = {
  codAoo: 'A356E00',
  codiceFiscaleEnte: '92078570527',
  codiceIpa: '03YBQ4C7',
  codiceUniAoo: 'A356E00',
  denominazioneAoo: 'Denominazione Aoo Test',
  denominazioneEnte: 'Comune Test',
  id: 'A356E00',
  mail1: 'test@test.it',
  origin: 'IPA',
  CAP: '53100',
  codiceCatastaleComune: 'I726',
  codiceComuneISTAT: '082050',
  cognomeResponsabile: 'Bielli',
  nomeResponsabile: 'Silvia',
  dataIstituzione: '2023-01-27',
  indirizzo: 'Via Nenni 6',
  mailResponsabile: 'test@gmail.com',
  telefonoResponsabile: '3357080675',
  tipoMail1: 'Pec',
};

const mockedUoCode: UoData = {
  codiceFiscaleEnte: '92078570527',
  codiceIpa: '03YBQ4C7',
  codiceUniUo: 'UF9YK6',
  codiceUniUoPadre: '',
  denominazioneEnte: 'denominazione uo test',
  descrizioneUo: 'Ufficio per la transizione al Digitale',
  id: 'UF9YK6',
  mail1: 'test@fnofi.it',
  origin: 'IPA',
  CAP: '84014',
  codiceCatastaleComune: 'F912',
  codiceComuneISTAT: '065078',
  cognomeResponsabile: 'Ventura',
  dataAggiornamento: '2020-09-22',
  dataIstituzione: '2017-09-29',
  indirizzo: 'Via San Pietro, 10',
  tipoMail1: 'Pec',
};

const mockedOnboardingData: Array<InstitutionOnboardingInfoResource> = [
  {
    institution: {
      id: '55897f04-bafd-4bc9-b646-0fd027620c1b',
      billingData: {
        businessName: 'Comune di Milano',
        registeredOffice: 'Milano, Piazza Colonna 370',
        zipCode: '20021',
        digitalAddress: 'comune.milano@pec.it',
        taxCode: '33445673222',
        vatNumber: '33445673221',
        recipientCode: 'M5UXCR1',
        geographicTaxonomies: [
          {
            code: '058091',
            desc: 'Firenze - Comune',
          },
        ],
        supportEmail: 'comune.bollate@pec.it',
      },
      city: 'Milano',
      country: 'IT',
      county: 'MI',
      institutionType: 'PA',
      origin: 'ANAC',
    },
  },
  {
    institution: {
      id: '999c63d8-554d-4376-233s-4caf2a73822a',
      billingData: {
        businessName: 'Comune di Udine',
        registeredOffice: 'Udine, Piazza Colonna 370',
        zipCode: '21200',
        digitalAddress: 'comune.udine@pectest.it',
        taxCode: '33445673211',
        vatNumber: '33445673211',
        recipientCode: 'M2UHYR1',
        geographicTaxonomies: [
          {
            code: '058091',
            desc: 'Udine - Comune',
          },
        ],
        supportEmail: 'comune.udine@pec.it',
      },
      // Use case not retrieved institution local data
      institutionType: 'GSP',
      origin: 'IPA',
      assistanceContacts: {
        supportEmail: 'supportemail@mockmail.it',
      },
      companyInformations: {
        businessRegisterPlace: 'register Place test',
        rea: 'RM-654321',
        shareCapital: '23456',
      },
    },
  },
  {
    institution: {
      id: '370c63d8-1b76-4376-a725-4caf2a73822a',
      billingData: {
        businessName: 'Comune di Bollate',
        registeredOffice: 'Bollate, Piazza Colonna 370',
        zipCode: '20021',
        digitalAddress: 'comune.bollate@pec.it',
        taxCode: 'BBBBBB11A11A123K',
        vatNumber: '12345678901',
        recipientCode: 'M2UHYR1',
        geographicTaxonomies: [
          {
            code: '058091',
            desc: 'Firenze - Comune',
          },
        ],
        supportEmail: 'comune.bollate@pec.it',
      },
      city: 'Bollate',
      country: 'IT',
      county: 'BO',
      institutionType: 'PA',
      origin: 'IPA',
      assistanceContacts: {
        supportEmail: 'a@a.it',
      },
      companyInformations: {
        businessRegisterPlace: 'register Place test',
        rea: 'RM-123456',
        shareCapital: '123456',
      },
    },
  },
  {
    institution: {
      id: '92078570527',
      billingData: {
        businessName: 'Comune di Bollate AOO',
        registeredOffice: 'Bollate, Piazza Colonna 370',
        zipCode: '20021',
        digitalAddress: 'comune.bollate@pec.it',
        taxCode: '92078570527',
        vatNumber: '92078570523',
        recipientCode: 'M2UHYR1',
        geographicTaxonomies: [
          {
            code: '058091',
            desc: 'Firenze - Comune',
          },
        ],
        supportEmail: 'comune.bollate@pec.it',
      },
      institutionType: 'PA',
      city: 'Bollate',
      country: 'IT',
      county: 'BO',
      origin: 'IPA',
      assistanceContacts: {
        supportEmail: 'a@a.it',
      },
      companyInformations: {
        businessRegisterPlace: 'register Place test',
        rea: 'RM-123456',
        shareCapital: '123456',
      },
    },
  },
];

const statusActive = 'ACTIVE';
const statusTesting = 'TESTING';

const mockedProducts: Array<Product> = [
  {
    id: 'prod-pn',
    title: 'SEND - Servizio Notifiche digitali',
    status: statusActive,
  },
  {
    id: 'prod-pagopa',
    title: 'Piattaforma pagoPA',
    status: statusActive,
  },
  {
    id: 'prod-io',
    title: 'App IO',
    status: statusActive,
  },
  {
    id: 'prod-io-premium',
    title: 'App IO Premium',
    parentId: 'prod-io',
    status: statusActive,
  },
  {
    id: 'prod-io-sign',
    title: 'Firma con IO',
    status: statusTesting, // Use case for not allowed onboarding
  },
  {
    id: 'prod-ciban',
    title: 'Check-IBAN',
    status: statusTesting, // Use case for not allowed onboarding
  },
  {
    id: 'prod-interop',
    title: 'Interoperabilità',
    status: statusActive,
  },
  {
    id: 'prod-idpay',
    title: 'IdPay',
    status: statusActive,
  },
  {
    id: 'prod-cgn',
    title: 'Carta Giovani',
    status: statusActive,
  },
  {
    id: 'prod-fd',
    title: 'Fideiussioni',
    status: statusActive,
  },
  {
    id: 'prod-fd-garantito',
    title: 'Fideiussioni',
    status: statusActive,
  },
  {
    id: 'prod-pn-dev',
    title: 'SEND-DEV',
    status: statusActive,
  },
];

const mockedStationResource: StationResource = {
  count: 0,
  items: [
    {
      anacEnabled: false,
      anacEngaged: false,
      description: 'descriptionAS',
      digitalAddress: 'email@example.com',
      id: 'id2',
      originId: 'string',
      taxCode: '12345678911',
    },
    {
      anacEnabled: false,
      anacEngaged: false,
      description: 'description2',
      digitalAddress: 'email2@example.com',
      id: 'id2',
      originId: 'originI2',
      taxCode: '22245678913',
    },
  ],
};

const mockedInsuranceResource: InsuranceCompaniesResource = {
  count: 3,
  items: [
    {
      address: 'addres',
      description: 'descriptionInsurance',
      digitalAddress: 'email@example.com',
      id: '12345678911',
      origin: 'IVASS',
      originId: '233DC',
      registerType: 'string',
      taxCode: '12345678911',
      workType: 'string',
    },
    {
      address: 'addressd',
      description: 'insur',
      digitalAddress: 'email@mailtest.com',
      id: '11987654321',
      origin: 'IVASS',
      originId: '2323H',
      registerType: 'reg',
      taxCode: '11987654321',
      workType: 'worktype',
    },
    {
      address: 'addressd54',
      description: 'ins',
      digitalAddress: 'email@mock.com',
      id: '66557744831',
      origin: 'IVASS',
      originId: '232DC',
      registerType: 'regG',
      taxCode: '66557744831',
      workType: 'worktype',
    },
  ],
};

const mockedANACParty = {
  anacEnabled: false,
  anacEngaged: false,
  description: 'descriptionAnac',
  digitalAddress: 'email@example.com',
  id: 'id2',
  originId: 'string',
  taxCode: '12345678911',
};

const mockedResponseError = {
  detail: 'Request took too long to complete.',
  status: 503,
  title: 'Service Unavailable',
};

const mockedOnboardingRequestData: Array<OnboardingRequestData> = [
  // Already approved onboarding request not expired
  {
    productId: 'prod-pagopa',
    status: 'COMPLETED',
    expiringDate: '2030-02-31T01:30:00.000-05:00',
  },
  // Already rejected onboarding request not expired
  {
    productId: 'prod-pagopa',
    status: 'REJECTED',
    expiringDate: '2030-02-31T09:30:00.000-08:00',
  },
  // Pending onboarding request not expired
  {
    productId: 'prod-pagopa',
    status: 'PENDING',
    expiringDate: '2024-04-31T01:30:00.000-05:00',
  },
  // Expired onboarding request
  {
    productId: 'prod-pagopa',
    status: 'PENDING',
    expiringDate: '2024-02-31T09:30:00.000-08:00',
  },
];

const noContent: Promise<AxiosResponse> = new Promise((resolve) =>
  resolve({
    status: 204,
    statusText: 'No Content',
  } as AxiosResponse)
);

const notFoundError: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: '', status: 404, statusText: 'Not Found' },
  } as AxiosError)
);

const notAllowedError: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: '', status: 403, statusText: 'Not Found' },
  } as AxiosError)
);

const genericError: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: mockedResponseError, status: 503, statusText: '503' },
  } as AxiosError)
);

const badRequestError: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: '', status: 400, statusText: '400' },
  } as AxiosError)
);

const conflictError: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: '', status: 409, statusText: '409' },
  } as AxiosError)
);

const buildOnboardingUserValidation409 = (
  isNameConflict: boolean,
  isSurnameConflict: boolean
): Promise<AxiosError> =>
  new Promise((resolve) =>
    resolve({
      isAxiosError: true,
      response: {
        data: {
          detail: 'there are values that do not match with the certified data',
          instance: '/users/validate',
          invalidParams: [
            isNameConflict
              ? { name: 'name', reason: 'the value does not match with the certified data' }
              : undefined,
            isSurnameConflict
              ? { name: 'surname', reason: 'the value does not match with the certified data' }
              : undefined,
          ].filter((x) => x),
          status: 409,
          title: 'Conflict',
        },
        status: 409,
        statusText: '409',
      },
    } as AxiosError)
  );

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
export async function mockFetch(
  { endpoint, endpointParams }: Endpoint,
  { params, data }: AxiosRequestConfig
): Promise<AxiosResponse | AxiosError> {
  if (endpoint === 'ONBOARDING_GET_SEARCH_PARTIES') {
    return new Promise((resolve) =>
      resolve({ data: mockPartyRegistry, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_GEOTAXONOMY') {
    return new Promise((resolve) =>
      resolve({ data: mockedGeoTaxonomy, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_PREVIOUS_GEOTAXONOMIES') {
    return new Promise((resolve) =>
      resolve({ data: mockedGeoTaxonomy, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_LOCATION_BY_ISTAT_CODE') {
    const retrievedLocalization = mockedGeotaxonomies.find(
      (l) => endpointParams.geoTaxId === l.istat_code
    );
    return new Promise((resolve) =>
      resolve({ data: retrievedLocalization, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_PARTY_FROM_CF') {
    const matchedParty = mockedParties.find((p) => p.taxCode === endpointParams.id);

    return new Promise((resolve) =>
      resolve({ data: matchedParty, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_AOO_CODE_INFO') {
    return new Promise((resolve) =>
      resolve({ data: mockedAooCode, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_UO_CODE_INFO') {
    return new Promise((resolve) =>
      resolve({ data: mockedUoCode, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'VERIFY_ONBOARDING') {
    switch (params.taxCode) {
      case '99999999999':
      case 'externalId4':
        return genericError;
      case '44444444444':
        return notAllowedError;
      case 'onboarded_externalId':
      case '22222222222':
        return noContent;
      case '33333333333':
        return notFoundError;
      // Use case for test not base adhesion
      case 'externalId3':
        return notFoundError;
      // Use case for test already subscribed premium
      case 'externalId2':
        if (params.productId === 'prod-io' || params.productId === 'prod-io-premium') {
          return noContent;
        } else {
          return notFoundError;
        }
      // Use case for test aoo
      case '92078570527':
        if (params.subunitCode) {
          return notFoundError;
        } else {
          return noContent;
        }
      default:
        if (params.productId !== 'prod-io') {
          return notFoundError;
        } else {
          return noContent;
        }
    }
  }

  if (endpoint === 'ONBOARDING_GET_SA_PARTIES_NAME') {
    return new Promise((resolve) =>
      resolve({ data: mockedStationResource, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_SA_PARTY_FROM_FC') {
    return new Promise((resolve) =>
      resolve({ data: mockedANACParty, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_INSURANCE_COMPANIES_BY_NAME') {
    return new Promise((resolve) =>
      resolve({ data: mockedInsuranceResource, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_INSURANCE_COMPANIES_BY_TAXCODE') {
    const matchedInstitution = mockedInsuranceResource.items.find(
      (i) => i.taxCode === endpointParams.taxId
    );
    return new Promise((resolve) =>
      resolve({ data: matchedInstitution, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_ONBOARDING_DATA') {
    const onboardingData = mockedOnboardingData.find(
      (od) => od.institution.billingData.taxCode === params.taxCode
    );
    if (params.taxCode === '92078570527') {
      return new Promise((resolve) =>
        resolve({ data: onboardingData, status: 200, statusText: '200' } as AxiosResponse)
      );
    }
    if (onboardingData) {
      return new Promise((resolve) =>
        resolve({
          data: onboardingData,
          status: 200,
          statusText: '200',
        } as AxiosResponse)
      );
    } else {
      return notFoundError;
    }
  }

  if (endpoint === 'ONBOARDING_VERIFY_PRODUCT') {
    const selectedProduct = mockedProducts.find((p) => p.id === endpointParams.productId);
    if (selectedProduct) {
      return new Promise((resolve) =>
        resolve({ data: selectedProduct, status: 200, statusText: '200' } as AxiosResponse)
      );
    } else {
      return genericError;
    }
  }

  if (endpoint === 'ONBOARDING_USER_VALIDATION') {
    if (
      ['CRTCTF90B12C123K', 'CRTCTF91B12C123K', 'CRTCTF92B12C123K'].indexOf((data as any)?.taxCode) >
        -1 &&
      ((data as any)?.name !== 'CERTIFIED_NAME' || (data as any)?.surname !== 'CERTIFIED_SURNAME')
    ) {
      return buildOnboardingUserValidation409(
        (data as any)?.name !== 'CERTIFIED_NAME',
        (data as any)?.surname !== 'CERTIFIED_SURNAME'
      );
    } else if ((data as any)?.taxCode === 'CRTCTF93B12C124K') {
      return genericError;
    } else {
      return new Promise((resolve) =>
        resolve({ data: '', status: 200, statusText: '200' } as AxiosResponse)
      );
    }
  }
  if (endpoint === 'ONBOARDING_POST_LEGALS') {
    switch (((data as any).billingData as BillingDataDto).taxCode) {
      case '44444444444':
        return notAllowedError;
      case '11111111111':
      case '33445673211':
        return genericError;
      default:
        const certifiedUser: UserOnCreate | undefined = (
          (data as any).users as Array<UserOnCreate>
        ).find((u) => u.taxCode === 'XXXXXX00A00X000X');
        if (
          certifiedUser &&
          (certifiedUser.name !== 'CERTIFIED_NAME' || certifiedUser.surname !== 'CERTIFIED_SURNAME')
        ) {
          return conflictError;
        } else {
          return new Promise((resolve) =>
            resolve({ data: '', status: 201, statusText: 'Created' } as AxiosResponse)
          );
        }
    }
  }

  if (endpoint === 'ONBOARDING_GET_PARTY') {
    const fetched = mockPartyRegistry.items.find(
      (p) => p.id === endpointParams.externalInstitutionId
    );

    if (fetched) {
      return new Promise((resolve) =>
        resolve({ data: fetched, status: 200, statusText: '200' } as AxiosResponse)
      );
    } else {
      return notFoundError;
    }
  }

  if (endpoint === 'ONBOARDING_COMPLETE_REGISTRATION') {
    switch (endpointParams.token) {
      case 'error':
        return badRequestError;
      case 'pendingRequest':
        return noContent;
    }
  }

  if (endpoint === 'ONBOARDING_GET_USER_PARTIES') {
    return new Promise((resolve) =>
      resolve({ data: mockedParties, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_TOKEN_VALIDATION') {
    switch (endpointParams.onboardingId) {
      case 'expired':
        return new Promise((resolve) =>
          resolve({
            data: mockedOnboardingRequestData[3],
            status: 200,
            statusText: '200',
          } as AxiosResponse)
        );
      case 'alreadyApproved':
        return new Promise((resolve) =>
          resolve({
            data: mockedOnboardingRequestData[0],
            status: 200,
            statusText: '200',
          } as AxiosResponse)
        );
      case 'alreadyRejected':
        return new Promise((resolve) =>
          resolve({
            data: mockedOnboardingRequestData[1],
            status: 200,
            statusText: '200',
          } as AxiosResponse)
        );
      case 'pendingRequest':
      case 'error':
        return new Promise((resolve) =>
          resolve({
            data: mockedOnboardingRequestData[2],
            status: 200,
            statusText: '200',
          } as AxiosResponse)
        );
      default:
        return notFoundError;
    }
  }

  const msg = `NOT MOCKED REQUEST! {endpoint: ${endpoint}, endpointParams: ${JSON.stringify(
    endpointParams
  )}, params: ${JSON.stringify(params)}}`;
  console.error(msg);
  throw new Error(msg);
}
