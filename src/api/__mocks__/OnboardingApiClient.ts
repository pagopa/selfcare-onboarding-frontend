import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { vi } from 'vitest';
import { ApiEndpointKey } from '../../../types';
import { fetchMockedData, MockedCallOptions } from '../../lib/mocked-api-utils';

// OnboardingApi passes these results to extractResponse in place of the generated client response.
type MockedClientResponse = Parameters<typeof extractResponse>[0];

const callViaFetchWithLogs = (endpoint: ApiEndpointKey, options?: MockedCallOptions) =>
  fetchMockedData<MockedClientResponse>(endpoint, options);

export const ApiClientMocked = {
  retrieveOnboardingRequest: vi.fn((onboardingId: string) =>
    callViaFetchWithLogs('ONBOARDING_GET_INFO', { endpointParams: { onboardingId } })
  ),
  verifyOnboarding: vi.fn((onboardingId: string) =>
    callViaFetchWithLogs('ONBOARDING_TOKEN_VALIDATION', { endpointParams: { onboardingId } })
  ),
  userValidate: vi.fn((body: unknown) =>
    callViaFetchWithLogs('ONBOARDING_USER_VALIDATION', { data: body, method: 'POST' })
  ),
  verifyRecipientCode: vi.fn((originId: string, recipientCode: string) =>
    callViaFetchWithLogs('ONBOARDING_RECIPIENT_CODE_VALIDATION', {
      params: { recipientCode, originId },
    })
  ),
  checkManager: vi.fn((body: unknown) =>
    callViaFetchWithLogs('ONBOARDING_CHECK_MANAGER', { data: body, method: 'POST' })
  ),
  searchUserId: vi.fn((body: unknown) =>
    callViaFetchWithLogs('ONBOARDING_SEARCH_USER', { data: body, method: 'POST' })
  ),
  deleteOnboardingRequest: vi.fn((onboardingId: string) =>
    callViaFetchWithLogs('ONBOARDING_COMPLETE_REGISTRATION', {
      endpointParams: { token: onboardingId },
      method: 'DELETE',
    })
  ),
  getInstitutions: vi.fn((productId?: string) =>
    callViaFetchWithLogs('ONBOARDING_GET_USER_PARTIES', { params: { productId } })
  ),
  getPreviousGeotaxonomies: vi.fn((taxCode: string, subunitCode?: string) =>
    callViaFetchWithLogs('ONBOARDING_GET_PREVIOUS_GEOTAXONOMIES', {
      params: { taxCode, subunitCode },
    })
  ),
  getOnboardingData: vi.fn((institutionId: string, productId: string) =>
    callViaFetchWithLogs('ONBOARDING_GET_ONBOARDING_DATA', {
      params: { institutionId, productId },
    })
  ),
  getProduct: vi.fn((id: string, institutionType?: string) =>
    callViaFetchWithLogs('ONBOARDING_VERIFY_PRODUCT', {
      endpointParams: { productId: id },
      params: { institutionType },
    })
  ),
  onboardingUsers: vi.fn((body: unknown) =>
    callViaFetchWithLogs('ONBOARDING_NEW_USER', { data: body, method: 'POST' })
  ),
  getProductsAdmin: vi.fn(() =>
    callViaFetchWithLogs('ONBOARDING_GET_ALLOWED_ADD_USER_PRODUCTS', {})
  ),
  getOrigins: vi.fn((productId: string) =>
    callViaFetchWithLogs('ONBOARDING_GET_INSTITUTION_TYPE_BY_PRODUCT', {
      params: { productId },
    })
  ),
  completeOnboardingContract: vi.fn((onboardingId: string, contract: File) => {
    const formData = new FormData();
    formData.append('contract', contract);
    return callViaFetchWithLogs('ONBOARDING_COMPLETE_REGISTRATION', {
      endpointParams: { token: onboardingId },
      data: formData,
      method: 'POST',
    });
  }),
  completeUsersOnboardingContract: vi.fn((onboardingId: string, contract: File) => {
    const formData = new FormData();
    formData.append('contract', contract);
    return callViaFetchWithLogs('USER_COMPLETE_REGISTRATION', {
      endpointParams: { token: onboardingId },
      data: formData,
      method: 'POST',
    });
  }),
  getOnboardings: vi.fn((taxCode: string, status: string) =>
    callViaFetchWithLogs('ONBOARDING_GET_ONBOARDINGS', { params: { taxCode, status } })
  ),
  getRequiredDocumentsEnabled: vi.fn((productId: string, institutionType: string, origin: string) =>
    callViaFetchWithLogs('REQUIRED_DOCUMENTS_ENABLED', {
      endpointParams: { productId },
      params: { institutionType, origin },
    })
  ),
  getRequiredDocuments: vi.fn((productId: string, institutionType: string, origin: string) =>
    callViaFetchWithLogs('GET_REQUIRED_DOCUMENTS', {
      endpointParams: { productId },
      params: { institutionType, origin },
    })
  ),
  getAttachmentStatus: vi.fn((onboardingId: string, name: string) =>
    callViaFetchWithLogs('GET_ATTACHMENT_STATUS', { endpointParams: { onboardingId, name } })
  ),
  triggerOnboarding: vi.fn((onboardingId: string) =>
    callViaFetchWithLogs('TRIGGER_ONBOARDING', {
      endpointParams: { onboardingId },
      method: 'PUT',
    })
  ),
  uploadAttachment: vi.fn(
    (
      onboardingId: string,
      attachmentName: string,
      attachment: File,
      attachmentId?: string,
      attachmentDescription?: string
    ) => {
      const formData = new FormData();
      formData.append('attachment', attachment);
      if (attachmentId) {
        formData.append('attachmentId', attachmentId);
      }
      if (attachmentDescription) {
        formData.append('attachmentDescription', attachmentDescription);
      }
      return callViaFetchWithLogs('ONBOARDING_POST_ATTACHMENT', {
        endpointParams: { onboardingId, filename: attachmentName },
        data: formData,
        method: 'POST',
      });
    }
  ),
  onboardingInstitution: vi.fn((body: unknown) =>
    callViaFetchWithLogs('ONBOARDING_POST_LEGALS', { data: body, method: 'POST' })
  ),
  getInstitutionsByFilters: vi.fn((params: MockedCallOptions['params']) =>
    callViaFetchWithLogs('ONBOARDING_GET_INSTITUTIONS', { params })
  ),
  searchInstitutionsIpa: vi.fn((params: MockedCallOptions['params']) =>
    callViaFetchWithLogs('ONBOARDING_GET_SEARCH_PARTIES', { params })
  ),
  searchInstitutionIpaByTaxCode: vi.fn((taxCode: string, category?: string) =>
    callViaFetchWithLogs('ONBOARDING_GET_PARTY_FROM_CF', {
      endpointParams: { id: taxCode },
      params: { category },
    })
  ),
  verifyAggregatesCsv: vi.fn((aggregates: File, productId: string, institutionType?: string) => {
    const formData = new FormData();
    formData.append('aggregates', aggregates);
    return callViaFetchWithLogs('ONBOARDING_VERIFY_AGGREGATES', {
      params: { institutionType, productId },
      data: formData,
      method: 'POST',
    });
  }),
  verifyOnboardingExternal: vi.fn((params: MockedCallOptions['params']) =>
    fetchMockedData<void>('VERIFY_ONBOARDING', { params, method: 'HEAD' })
  ),
};

export const OnboardingApi = ApiClientMocked;
