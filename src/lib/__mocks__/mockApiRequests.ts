import { UserRole } from '@pagopa/selfcare-common-frontend/utils/constants';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Endpoint,
  InstitutionOnboardingInfoResource,
  StationResource,
  Product,
  UserOnCreate,
  InsuranceCompaniesResource,
} from '../../../types';
import { BillingDataDto } from '../../model/BillingData';
import { nationalValue } from '../../model/GeographicTaxonomies';
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
  address: string
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
      'largo torino'
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
      'via lombardia'
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
      'piazza rossi'
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
      'legal_se'
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
      'sede'
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
      'leg'
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
      'ss'
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
      'mockaddress'
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
    '33344455567',
    '22345'
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
    '22395'
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
    '02102'
  ),
  createPartyEntity(
    'externalId4',
    '4545fg',
    '775644',
    'Comune di Gessate',
    'logo',
    'address4',
    'b@bb.com',
    '33445673210',
    '00022'
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
    '33344'
  ),
  createPartyEntity(
    'onboarded_externalId',
    'or2325',
    'p4341',
    'onboarded',
    'logo',
    'address',
    'a@aa.com',
    'BBBBBB22B22B234K',
    '12125'
  ),
];

const mockedGeoTaxonomy = [
  {
    code: nationalValue,
    desc: 'ITALIA',
    region: '12',
    province: '058',
    provinceAbbreviation: 'RM',
    country: 'ITA',
    countryAbbreviation: 'IT',
    startDate: '1871-01-15',
    endDate: null,
    enable: true,
  },
];

const mockedAooCode: AooData = {
  codAoo: 'ND',
  codiceFiscaleEnte: '92078570527',
  codiceIpa: '03YBQ4C7',
  codiceUniAoo: 'A356E00',
  denominazioneAoo: 'Denominazione Aoo Test',
  denominazioneEnte: 'Comune Test',
  id: 'A356E00',
  mail1: 'test.it',
  origin: 'IPA',
  CAP: '53100',
  codiceCatastaleComune: 'I726',
  codiceComuneISTAT: '052032',
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
      institutionType: 'PA',
      origin: 'IPA',
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
      institutionType: 'PA',
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
];

const statusActive = 'ACTIVE';
const statusTesting = 'TESTING';

const mockedProducts: Array<Product> = [
  {
    id: 'prod-pn',
    title: 'Piattaforma Notifiche',
    status: statusActive,
  },
  {
    id: 'prod-pagopa',
    title: 'Pagamenti PagoPA',
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
      description: 'description',
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
  count: 0,
  items: [
    {
      address: 'addres',
      description: 'description',
      digitalAddress: 'email@example.com',
      id: '12345678911',
      origin: 'IVASS',
      originId: 'codice IVASS',
      registerType: 'string',
      taxCode: '12345678911',
      workType: 'string',
    },
  ],
};

const mockedANACParty = {
  anacEnabled: false,
  anacEngaged: false,
  description: 'description',
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

const noContent: Promise<AxiosResponse> = new Promise((resolve) =>
  resolve({
    status: 204,
    statusText: 'No Content',
  } as AxiosResponse)
);

const notFound: Promise<AxiosError> = new Promise((resolve) =>
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

const error409: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: '', status: 409, statusText: '409' },
  } as AxiosError)
);
const error400: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: '', status: 400, statusText: '400' },
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

  if (endpoint === 'ONBOARDING_GET_PARTY_FROM_CF') {
    return new Promise((resolve) =>
      resolve({ data: mockedParties[0], status: 200, statusText: '200' } as AxiosResponse)
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
    switch (endpointParams.externalInstitutionId) {
      case 'infoError':
      case 'externalId4':
        return genericError;
      case 'notAllowed':
        return notAllowedError;
      case 'onboarded_externalId':
      case 'onboarded':
        return noContent;
      case 'pending':
        return notFound;
      // Use case for test not base adhesion
      case 'externalId3':
        return notFound;
      // Use case for test already subscribed premium
      case 'externalId2':
        if (
          endpointParams.productId === 'prod-io' ||
          endpointParams.productId === 'prod-io-premium'
        ) {
          return noContent;
        } else {
          return notFound;
        }
      default:
        if (endpointParams.productId !== 'prod-io') {
          return notFound;
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

  if (endpoint === 'ONBOARDING_GET_INSURANCE_COMPANIES_BY_NAME') {
    return new Promise((resolve) =>
      resolve({ data: mockedInsuranceResource, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_GET_SA_PARTY_FROM_FC') {
    return new Promise((resolve) =>
      resolve({ data: mockedANACParty, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'VERIFY_ONBOARDED_VAT_NUMBER') {
    switch (params.vatNumber) {
      case '12345678901':
        return noContent;
      case '12345678902':
        return notFound;
    }
  }

  if (endpoint === 'ONBOARDING_GET_ONBOARDING_DATA') {
    const onboardingData = mockedOnboardingData.find(
      (od) => od.institution.billingData.taxCode === endpointParams.externalInstitutionId
    );
    if (onboardingData) {
      return new Promise((resolve) =>
        resolve({
          data: onboardingData,
          status: 200,
          statusText: '200',
        } as AxiosResponse)
      );
    } else {
      return notFound;
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
          return error409;
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
      return notFound;
    }
  }

  if (endpoint === 'ONBOARDING_COMPLETE_REGISTRATION') {
    switch (endpointParams.token) {
      case 'error':
        return genericError;
      default:
        return new Promise((resolve) =>
          resolve({ data: undefined, status: 200, statusText: '200' } as AxiosResponse)
        );
    }
  }

  if (endpoint === 'ONBOARDING_GET_USER_PARTIES') {
    return new Promise((resolve) =>
      resolve({ data: mockedParties, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'ONBOARDING_TOKEN_VALIDATION') {
    if (window.location.search === '?jwt=tokenNotFound') {
      return notFound;
    } else if (window.location.search === '?jwt=tokenAlreadyConsumed') {
      return error409;
    } else if (window.location.search === '?jwt=tokenNotValid') {
      return error400;
    } else {
      return new Promise((resolve) =>
        resolve({ data: '', status: 200, statusText: '200' } as AxiosResponse)
      );
    }
  }

  const msg = `NOT MOCKED REQUEST! {endpoint: ${endpoint}, endpointParams: ${JSON.stringify(
    endpointParams
  )}, params: ${JSON.stringify(params)}}`;
  console.error(msg);
  throw new Error(msg);
}
