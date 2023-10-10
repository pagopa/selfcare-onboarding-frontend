import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  Endpoint,
  InstitutionOnboardingInfoResource,
  StationResource,
  Product,
  SelfcareParty,
  UserOnCreate,
} from '../../../types';
import { nationalValue } from '../../model/GeographicTaxonomies';
import { UoData } from '../../model/UoModel';
import { AooData } from './../../model/AooData';

const mockPartyRegistry = {
  items: [
    {
      id: 'id',
      o: 'o',
      ou: 'ou',
      aoo: 'aoo',
      taxCode: '00000000000',
      zipCode: '44332',
      administrationCode: '00000000000',
      category: 'c7',
      managerName: 'Mario',
      managerSurname: 'Rossi',
      description: 'AGENCY X',
      digitalAddress: 'mail@pec.mail.org',
      origin: 'IPA',
      originId: 'originId1',
      address: 'sede legale',
    },
    {
      id: 'error',
      o: 'errorO',
      ou: 'errorUu',
      aoo: 'errorAoo',
      taxCode: '11111111111',
      zipCode: '01345',
      administrationCode: '11111111111',
      category: 'c7',
      managerName: 'Mario:ERROR',
      managerSurname: 'Rossi_ERROR',
      description: 'AGENCY ERROR',
      digitalAddress: 'mail_ERROR_@pec.mail.org',
      origin: 'IPA',
      originId: 'originId2',
      address: 'sede legale',
    },
    {
      id: 'onboarded',
      o: 'onboardedO',
      ou: 'onboardedUu',
      aoo: 'onboardedAoo',
      taxCode: '22222222222',
      zipCode: '12345',
      administrationCode: '22222222222',
      category: 'c7',
      managerName: 'Mario_ONBOARDED',
      managerSurname: 'Rossi_ONBOARDED',
      description: 'AGENCY ONBOARDED',
      digitalAddress: 'mail_ONBOARDED_@pec.mail.org',
      origin: 'IPA',
      originId: 'originId3',
      address: 'sede legale',
    },
    {
      id: 'pending',
      o: 'pendingO',
      ou: 'pendingUu',
      aoo: 'pendingAoo',
      taxCode: '33333333333',
      zipCode: '54321',
      administrationCode: '33333333333',
      category: 'c7',
      managerName: 'Mario_PENDING',
      managerSurname: 'Rossi_PENDING',
      description: 'AGENCY PENDING',
      digitalAddress: 'mail_PENDING_@pec.mail.org',
      origin: 'IPA',
      originId: 'originId4',
      address: 'sede legale',
    },
    {
      id: 'infoError',
      o: 'infoErrorO',
      ou: 'infoErrorUu',
      aoo: 'infoErrorAoo',
      taxCode: '99999999999',
      zipCode: '12122',
      administrationCode: '99999999999',
      category: 'c7',
      managerName: 'Mario_INFOERROR',
      managerSurname: 'Rossi_INFOERROR',
      description: 'AGENCY INFO ERROR',
      digitalAddress: 'mail_INFOERROR_@pec.mail.org',
      origin: 'IPA',
      originId: 'originId5',
      address: 'sede legale',
    },
    {
      id: 'notAllowed',
      o: 'notAllowedO',
      ou: 'notAllowedUu',
      aoo: 'notAllowedAoo',
      taxCode: '44444444444',
      zipCode: '070889',
      administrationCode: '44444444444',
      category: 'c7',
      managerName: 'Mario_NOTALLOWED',
      managerSurname: 'Rossi_NOTALLOWED',
      description: 'Not Allowed',
      digitalAddress: 'mail_NOTALLOWED_@pec.mail.org',
      origin: 'IPA',
      originId: 'originId6',
      address: 'sede legale',
    },
    {
      id: 'notAllowedInSubmit',
      o: 'notAllowedO',
      ou: 'notAllowedUDu',
      aoo: 'notAllowedAooe',
      taxCode: '44444444444',
      zipCode: '07089',
      administrationCode: '44444444444',
      category: 'c7',
      managerName: 'Maria_NOTALLOWED',
      managerSurname: 'Rossa_NOTALLOWED',
      description: 'Not Allowed Error on Submit',
      digitalAddress: 'mail_NOTALLOWEDINSUBMIT_@pec.mail.org',
      origin: 'IPA',
      originId: 'originId7',
      address: 'sede legale',
    },
    // use case added for easily test new feature about taxCode equal to vatCode
    {
      id: 'idNotIpa',
      o: 'od',
      ou: 'oud',
      aoo: 'aood',
      taxCode: '98765432123',
      zipCode: '44382',
      administrationCode: '98765432123',
      category: 'c432',
      managerName: 'Ugo',
      managerSurname: 'Diaz',
      description: 'AGENCY NOT IPA',
      digitalAddress: 'mail@pec.mail.org',
      origin: 'IPAIPA', // origin not IPA for fields editability
      originId: 'originId1',
      address: 'sede legale',
    },
  ],
  count: 8,
};

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
  // {
  //   code: '015146',
  //   desc: 'Milano - Comune',
  //   region: '03',
  //   province: '015',
  //   provinceAbbreviation: 'MI',
  //   country: 'ITA',
  //   countryAbbreviation: 'IT',
  //   startDate: '1861-03-18',
  //   endDate: null,
  //   enable: true
  // }, {
  //   code: "015456",
  //   desc: "Napoli - Comune",
  //   region: "08",
  //   province: "018",
  //   provinceAbbreviation: "NA",
  //   country: "100",
  //   countryAbbreviation: "IT",
  //   startDate: "1861-03-18",
  //   endDate: null,
  //   enable: true
  //   },
  //   {
  //     code: "015456",
  //     desc: "Milazzo - Comune",
  //     region: "08",
  //     province: "016",
  //     provinceAbbreviation: "GE",
  //     country: "100",
  //     countryAbbreviation: "IT",
  //     startDate: "1861-03-18",
  //     endDate: null,
  //     enable: true
  // }
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

const mockedParties: Array<SelfcareParty> = [
  {
    externalId: 'externalId1',
    originId: 'originId1',
    id: 'partyId1',
    description: 'Comune di Milano',
    urlLogo: 'logo',
    address: 'address',
    digitalAddress: 'a@aa.com',
    taxCode: '33344455567',
    zipCode: 'zipCode',
    origin: 'IPA',
    userRole: 'ADMIN',
  },
  {
    externalId: 'externalId2',
    originId: 'originId2',
    id: 'partyId2',
    description: 'Comune di Bollate',
    urlLogo: 'logo',
    address: 'address',
    digitalAddress: 'a@aa.com',
    taxCode: '11122233345',
    zipCode: 'zipCode',
    origin: 'IPA',
    userRole: 'ADMIN',
  },
  {
    externalId: 'externalId3',
    originId: 'originId3',
    id: 'partyId3',
    description:
      'Commissario straordinario per la realizzazione di approdi temporanei e di interventi complementari per la salvaguardia di Venezia e della sua laguna e ulteriori interventi per la salvaguardia della laguna di Venezia',
    urlLogo: 'logo',
    address: 'address',
    digitalAddress: 'a@aa.com',
    taxCode: '33322268945',
    zipCode: '02102',
    origin: 'IPA',
    userRole: 'LIMITED',
  },
  {
    externalId: 'onboarded_externalId',
    originId: 'onboarded_originId',
    id: 'onboarded_partyId',
    description: 'onboarded',
    urlLogo: 'logo',
    address: 'address',
    digitalAddress: 'a@aa.com',
    taxCode: 'BBBBBB22B22B234K',
    zipCode: '12125',
    origin: 'IPA',
    userRole: 'LIMITED',
  },
];

const mockedOnboardingData0: InstitutionOnboardingInfoResource = {
  institution: {
    id: '55897f04-bafd-4bc9-b646-0fd027620c1b',
    billingData: {
      businessName: 'Comune di Milano',
      registeredOffice: 'Milano, Piazza Colonna 370',
      zipCode: '20021',
      digitalAddress: 'comune.milano@pec.it',
      taxCode: 'AAAAAA11A11A123K',
      vatNumber: 'AAAAAA11A11A123K',
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
};

const mockedOnboardingData1: InstitutionOnboardingInfoResource = {
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
};

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
    const selectedProductInTesting = mockedProducts.find(
      (p) => p.id === endpointParams.productId && p.status === 'TESTING'
    );

    switch (endpointParams.externalInstitutionId) {
      case 'infoError':
        return genericError;
      case 'onboarded':
        return new Promise((resolve) =>
          resolve({
            status: 204,
            statusText: 'No Content',
          } as AxiosResponse)
        );
      case 'pending':
        return notFoundError;
      case 'externalId1':
      case 'externalId2':
        if (endpointParams.productId === 'prod-io') {
          // eslint-disable-next-line sonarjs/no-identical-functions
          return new Promise((resolve) =>
            resolve({
              status: 204,
              statusText: 'No Content',
            } as AxiosResponse)
          );
        } else {
          return notFoundError;
        }
      case 'notAllowed':
        return notAllowedError;
      default:
        if (endpointParams.productId === 'prod-pagopa') {
          // eslint-disable-next-line sonarjs/no-identical-functions
          return new Promise((resolve) =>
            resolve({
              status: 204,
              statusText: 'No Content',
            } as AxiosResponse)
          );
        }
    }

    if (selectedProductInTesting) {
      return notAllowedError;
    }
    return new Promise((resolve) =>
      resolve({
        isAxiosError: true,
        response: { data: '', status: 400, statusText: 'Bad Request' },
      } as AxiosError)
    );
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

  if (endpoint === 'VERIFY_ONBOARDED_VAT_NUMBER') {
    switch (params.vatNumber) {
      case '12345678901':
        return new Promise((resolve) => {
          resolve({ data: '', status: 204, statusText: 'No Content' } as AxiosResponse);
        });
      case '12345678902':
        return new Promise((resolve) => {
          resolve({
            isAxiosError: true,
            response: { status: 404, statusText: 'Not Found' },
          } as AxiosError);
        });
    }
  }

  if (endpoint === 'ONBOARDING_GET_ONBOARDING_DATA') {
    switch (endpointParams.externalInstitutionId) {
      case 'externalId1':
        return new Promise((resolve) =>
          resolve({ data: mockedOnboardingData0, status: 200, statusText: '200' } as AxiosResponse)
        );
      case 'externalId2':
      case 'id':
      case 'error':
        return new Promise((resolve) =>
          resolve({ data: mockedOnboardingData1, status: 200, statusText: '200' } as AxiosResponse)
        );
      default:
        return new Promise((resolve) =>
          resolve({
            isAxiosError: true,
            response: { status: 404, statusText: 'Not Found' },
          } as AxiosError)
        );
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
    switch (mockedOnboardingData1.institution.billingData.taxCode) {
      case 'error':
        return genericError;
      case 'notAllowedInSubmit':
        return notAllowedError;
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
            resolve({ data: '', status: 200, statusText: '200' } as AxiosResponse)
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
      // eslint-disable-next-line sonarjs/no-identical-functions
      return new Promise((resolve) =>
        resolve({
          isAxiosError: true,
          response: { status: 404, statusText: 'Not Found' },
        } as AxiosError)
      );
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
      return notFoundError;
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
