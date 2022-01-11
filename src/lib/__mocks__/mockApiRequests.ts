import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Endpoint } from '../../../types';

const mockPartyRegistry = {
  items: [
    {
      id: 'id',
      o: 'o',
      ou: 'ou',
      aoo: 'aoo',
      taxCode: '00000000000',
      administrationCode: '00000000000',
      category: 'c7',
      managerName: 'Mario',
      managerSurname: 'Rossi',
      description: 'AGENCY X',
      digitalAddress: 'mail@pec.mail.org',
    },
    {
      id: 'error',
      o: 'errorO',
      ou: 'errorUu',
      aoo: 'errorAoo',
      taxCode: '11111111111',
      administrationCode: '11111111111',
      category: 'c7',
      managerName: 'Mario:ERROR',
      managerSurname: 'Rossi_ERROR',
      description: 'AGENCY ERROR',
      digitalAddress: 'mail_ERROR_@pec.mail.org',
    },
    {
      id: 'onboarded',
      o: 'onboardedO',
      ou: 'onboardedUu',
      aoo: 'onboardedAoo',
      taxCode: '22222222222',
      administrationCode: '22222222222',
      category: 'c7',
      managerName: 'Mario_ONBOARDED',
      managerSurname: 'Rossi_ONBOARDED',
      description: 'AGENCY ONBOARDED',
      digitalAddress: 'mail_ONBOARDED_@pec.mail.org',
    },
    {
      id: 'pending',
      o: 'pendingO',
      ou: 'pendingUu',
      aoo: 'pendingAoo',
      taxCode: '33333333333',
      administrationCode: '33333333333',
      category: 'c7',
      managerName: 'Mario_PENDING',
      managerSurname: 'Rossi_PENDING',
      description: 'AGENCY PENDING',
      digitalAddress: 'mail_PENDING_@pec.mail.org',
    },
    {
      id: 'infoError',
      o: 'infoErrorO',
      ou: 'infoErrorUu',
      aoo: 'infoErrorAoo',
      taxCode: '99999999999',
      administrationCode: '99999999999',
      category: 'c7',
      managerName: 'Mario_INFOERROR',
      managerSurname: 'Rossi_INFOERROR',
      description: 'AGENCY INFO ERROR',
      digitalAddress: 'mail_INFOERROR_@pec.mail.org',
    },
  ],
  count: 5,
};

const mockedResponseError = {
  detail: 'Request took too long to complete.',
  status: 503,
  title: 'Service Unavailable',
};

const mockedOnboardingOnboarded = {
  person: {
    name: 'name',
    surname: 'surname',
    taxCode: 'AAAAAA00A00A000A',
  },
  institutions: [
    {
      institutionId: 'onboarded',
      description: 'AGENCY ONBOARDED',
      taxCode: 'onboardedFiscalCode',
      digitalAddress: 'digitalAddress',
      state: 'ACTIVE',
      role: 'MANAGER',
      productInfo: {
        id: 'prod-io',
        role: 'ADMIN',
        createdAt: '2021-12-02T16:57:02.300Z',
      },
      attributes: [
        {
          id: 'attId',
          name: 'attName',
          description: 'attDescription',
        },
      ],
    },
  ],
};

const mockedOnBoardingPending = {
  person: {
    name: 'name',
    surname: 'surname',
    taxCode: 'AAAAAA00A00A000A',
  },
  institutions: [
    {
      institutionId: 'pending',
      description: 'AGENCY PENDING',
      taxCode: 'pendingFiscalCode',
      digitalAddress: 'digitalAddress',
      state: 'PENDING',
      role: 'MANAGER',
      productInfo: {
        id: 'pagoPA',
        role: 'LIMITED',
        createdAt: '2021-12-02T16:57:02.300Z',
      },
      attributes: [
        {
          id: 'attId',
          name: 'attName',
          description: 'attDescription',
        },
      ],
    },
  ],
};

const mockedOnBoardingInfo = {
  person: {
    name: 'name',
    surname: 'surname',
    taxCode: 'AAAAAA00A00A000A',
  },
  institutions: [
    {
      role: 'MANAGER',
      description: 'Comune di Bari',
      taxCode: 'ComunediBariFiscalCode',
      state: 'PENDING',
      institutionId: '1',
      attributes: [
        {
          id: 'attId1',
          name: 'attName1',
          description: 'category1',
        },
      ],
      digitalAddress: '',
      productInfo: {
        id: 'pagoPA',
        role: 'ADMIN',
        createdAt: '2021-12-02T16:57:02.300Z',
      },
    },
    {
      role: 'MANAGER',
      description: 'Comune di Milano',
      taxCode: 'ComunediMilanoFiscalCode',
      state: 'PENDING',
      institutionId: '2',
      attributes: [
        {
          id: 'attId2',
          name: 'attName2',
          description: 'category2',
        },
      ],
      digitalAddress: '',
      productInfo: {
        id: 'pagoPA',
        role: 'LIMITED',
        createdAt: '2021-12-02T16:57:02.300Z',
      },
    },
    {
      role: 'MANAGER',
      description: 'Comune di Roma',
      taxCode: 'ComunediRomaFiscalCode',
      state: 'ACTIVE',
      institutionId: '3',
      attributes: [
        {
          id: 'attId3',
          name: 'attName3',
          description: 'category3',
        },
      ],
      digitalAddress: '',
      productInfo: {
        id: 'pagoPA',
        role: 'ADMIN',
        createdAt: '2021-12-02T16:57:02.300Z',
      },
    },
    {
      role: 'MANAGER',
      description: 'Comune di Napoli',
      taxCode: 'ComunediNapoliFiscalCode',
      state: 'ACTIVE',
      institutionId: '4',
      attributes: [
        {
          id: 'attId4',
          name: 'attName4',
          description: 'category4',
        },
      ],
      digitalAddress: '',
      productInfo: {
        id: 'pagoPA',
        role: 'LIMITED',
        createdAt: '2021-12-02T16:57:02.300Z',
      },
    },
    {
      role: 'OPERATOR',
      description: 'Comune di Napoli',
      taxCode: 'ComunediNapoliFiscalCode',
      state: 'PENDING',
      institutionId: '5',
      attributes: [
        {
          id: 'attId5',
          name: 'attName5',
          description: 'category5',
        },
      ],
      digitalAddress: '',
      productInfo: {
        id: 'PDND',
        role: 'LIMITED',
        createdAt: '2021-12-02T16:57:02.300Z',
      },
    },
    {
      institutionId: 'onboarded',
      description: 'AGENCY ONBOARDED',
      taxCode: 'onboardedFiscalCode',
      digitalAddress: 'digitalAddress',
      state: 'ACTIVE',
      role: 'MANAGER',
      productInfo: {
        id: 'pagoPA',
        role: 'ADMIN',
        createdAt: '2021-12-02T16:57:02.300Z',
      },
      attributes: [
        {
          id: 'attId',
          name: 'attName',
          description: 'category',
        },
      ],
    },
  ],
};

const genericError: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: mockedResponseError, status: 503, statusText: '503' },
  } as AxiosError)
);

export async function mockFetch(
  { endpoint, endpointParams }: Endpoint,
  { params }: AxiosRequestConfig
): Promise<AxiosResponse | AxiosError> {
  if (endpoint === 'ONBOARDING_GET_SEARCH_PARTIES') {
    return new Promise((resolve) =>
      resolve({ data: mockPartyRegistry, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  if (endpoint === 'VERIFY_ONBOARDING') {
    switch (endpointParams.institutionId) {
      case 'infoError':
        return genericError;
      case 'onboarded':
        return new Promise((resolve) =>
          resolve({
            data: mockedOnboardingOnboarded,
            status: 200,
            statusText: '200',
          } as AxiosResponse)
        );
      case 'pending':
        return new Promise((resolve) =>
          resolve({
            data: mockedOnBoardingPending,
            status: 200,
            statusText: '200',
          } as AxiosResponse)
        );
      default:
        return new Promise((resolve) =>
          resolve({ data: mockedOnBoardingInfo, status: 200, statusText: '200' } as AxiosResponse)
        );
    }
  }

  if (endpoint === 'ONBOARDING_POST_LEGALS') {
    switch (endpointParams.institutionId) {
      case 'error':
        return genericError;
      default:
        return new Promise((resolve) =>
          resolve({ data: undefined, status: 200, statusText: '200' } as AxiosResponse)
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

  const msg = `NOT MOCKED REQUEST! {endpoint: ${endpoint}, endpointParams: ${JSON.stringify(
    endpointParams
  )}, params: ${JSON.stringify(params)}}`;
  console.error(msg);
  throw new Error(msg);
}
