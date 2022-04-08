import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Endpoint, OnboardingDto, Party } from '../../../types';

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

const mockedProduct = {
  title: 'App IO',
  id: 'prod-io',
};

const mockedSubProduct = {
  title: 'Premium',
  id: 'prod-io-premium',
  parent: 'prod-io',
};

const mockedParties: Array<Party> = [
  {
    id: '0',
    name: 'Comune di Milano',
  },
  {
    id: '1',
    name: 'Comune di Bollate',
  },
];

const mockedOnboardingData0: OnboardingDto = {
  billingData: {
    businessName: 'Comune di Milano',
    registeredOffice: 'Milano, Piazza Colonna 370, CAP 20021',
    mailPEC: 'comune.milano@pec.it',
    taxCode: 'AAAAAA11A11A123K',
    vatNumber: 'AAAAAA11A11A123K',
    recipientCode: 'M5UXCR1',
  },
  manager: {
    email: 'm@ma.it',
    taxCode: 'AAAAAA11A11A123K',
    name: 'Mario',
    surname: 'Rossi',
    role: 'MANAGER',
  },
  organizationType: 'PA',
};

const mockedOnboardingData1: OnboardingDto = {
  billingData: {
    businessName: 'Comune di Bollate',
    registeredOffice: 'Bollate, Piazza Colonna 370, CAP 20021',
    mailPEC: 'comune.bollate@pec.it',
    taxCode: 'BBBBBB11A11A123K',
    vatNumber: 'BBBBBB11A11A123K',
    recipientCode: 'M2UHYR1',
  },
  manager: {
    email: 'm@ma.it',
    taxCode: 'DDDDDD11A11A123K',
    name: 'Maria',
    surname: 'Rosa',
    role: 'MANAGER',
  },
  organizationType: 'GSP',
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

const genericError: Promise<AxiosError> = new Promise((resolve) =>
  resolve({
    isAxiosError: true,
    response: { data: mockedResponseError, status: 503, statusText: '503' },
  } as AxiosError)
);

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
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
            status: 204,
            statusText: 'No Content',
          } as AxiosResponse)
        );
      case 'pending':
        return notFoundError;
      case '0':
      case '1':
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

      default:
        if (endpointParams.productId === 'prod-io') {
          // eslint-disable-next-line sonarjs/no-identical-functions
          return new Promise((resolve) =>
            resolve({
              status: 204,
              statusText: 'No Content',
            } as AxiosResponse)
          );
        }
        return new Promise((resolve) =>
          resolve({
            isAxiosError: true,
            response: { data: '', status: 400, statusText: 'Bad Request' },
          } as AxiosError)
        );
    }
  }

  if (endpoint === 'ONBOARDING_GET_ONBOARDING_DATA') {
    switch (endpointParams.institutionId) {
      case '0':
        return new Promise((resolve) =>
          resolve({ data: mockedOnboardingData0, status: 200, statusText: '200' } as AxiosResponse)
        );
      case '1':
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
    switch (endpointParams.productId) {
      case 'error':
        return genericError;
      case 'prod-io-premium':
        return new Promise((resolve) =>
          resolve({ data: mockedSubProduct, status: 200, statusText: '200' } as AxiosResponse)
        );
      default:
        return new Promise((resolve) =>
          resolve({ data: mockedProduct, status: 200, statusText: '200' } as AxiosResponse)
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

  if (endpoint === 'ONBOARDING_GET_USER_PARTIES') {
    return new Promise((resolve) =>
      resolve({ data: mockedParties, status: 200, statusText: '200' } as AxiosResponse)
    );
  }

  const msg = `NOT MOCKED REQUEST! {endpoint: ${endpoint}, endpointParams: ${JSON.stringify(
    endpointParams
  )}, params: ${JSON.stringify(params)}}`;
  console.error(msg);
  throw new Error(msg);
}
