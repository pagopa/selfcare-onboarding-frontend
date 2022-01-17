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

const mocckedProduct = {
  logo: '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',
  title: 'App IO',
  description: 'App IO description',
  id: 'prod-io',
  authorized: true,
  active: true,
  userRole: 'ADMIN',
  activationDateTime: new Date(2021, 1, 1),
  urlPublic: 'https://io.italia.it/ ',
  urlBO: 'https://io.selfcare.pagopa.it/path/acs?token=<IdentityToken>',
};

const mockedResponseError = {
  detail: 'Request took too long to complete.',
  status: 503,
  title: 'Service Unavailable',
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
            status: 204,
            statusText: 'No Content',
          } as AxiosResponse)
        );
      case 'pending':
        return new Promise((resolve) =>
          resolve({
            isAxiosError: true,
            response: { data: '', status: 404, statusText: 'Not Found' },
          } as AxiosError)
        );
      default:
        return new Promise((resolve) =>
          resolve({
            isAxiosError: true,
            response: { data: '', status: 400, statusText: 'Bad Request' },
          } as AxiosError)
        );
    }
  }
  if (endpoint === 'ONBOARDING_VERIFY_PRODUCT') {
    switch (endpointParams.productId) {
      case 'error':
        return genericError;
      default:
        return new Promise((resolve) =>
          resolve({ data: mocckedProduct, status: 200, statusText: '200' } as AxiosResponse)
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
