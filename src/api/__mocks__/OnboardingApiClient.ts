import { vi } from 'vitest';
import { fetchWithLogs } from '../../lib/api-utils';

const callViaFetchWithLogs = async (
    endpoint: string,
    options: { endpointParams?: any; params?: any; data?: any; method?: string } = {}
) => {
    const r = await fetchWithLogs(
        {
            endpoint: endpoint as any,
            ...(options.endpointParams !== undefined ? { endpointParams: options.endpointParams } : {}),
        },
        { params: options.params, data: options.data, method: options.method ?? 'GET' } as any,
        () => undefined
    );
    if ((r as any).isAxiosError) {
        const error = new Error(`HTTP ${(r as any).response?.status}`);
        // eslint-disable-next-line functional/immutable-data
        (error as any).httpStatus = (r as any).response?.status;
        // eslint-disable-next-line functional/immutable-data
        (error as any).httpBody = (r as any).response?.data;
        throw error;
    }
    return (r as any).data;
};

export const OnboardingApi = {
    retrieveOnboardingRequest: vi.fn((onboardingId: string) =>
        callViaFetchWithLogs('ONBOARDING_GET_INFO', { endpointParams: { onboardingId } })
    ),
    verifyOnboarding: vi.fn((onboardingId: string) =>
        callViaFetchWithLogs('ONBOARDING_TOKEN_VALIDATION', { endpointParams: { onboardingId } })
    ),
    userValidate: vi.fn((body: any) =>
        callViaFetchWithLogs('ONBOARDING_USER_VALIDATION', { data: body, method: 'POST' })
    ),
    verifyRecipientCode: vi.fn((originId: string, recipientCode: string) =>
        callViaFetchWithLogs('ONBOARDING_RECIPIENT_CODE_VALIDATION', {
            params: { recipientCode, originId },
        })
    ),
    checkManager: vi.fn((body: any) =>
        callViaFetchWithLogs('ONBOARDING_CHECK_MANAGER', { data: body, method: 'POST' })
    ),
    searchUserId: vi.fn((body: any) =>
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
    onboardingUsers: vi.fn((body: any) =>
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
    uploadAttachment: vi.fn((onboardingId: string, attachmentName: string, attachment: File) => {
        const formData = new FormData();
        formData.append('attachment', attachment);
        return callViaFetchWithLogs('ONBOARDING_POST_ATTACHMENT', {
            endpointParams: { onboardingId, filename: attachmentName },
            data: formData,
            method: 'POST',
        });
    }),
    onboardingInstitution: vi.fn((body: any) =>
        callViaFetchWithLogs('ONBOARDING_POST_LEGALS', { data: body, method: 'POST' })
    ),
    getInstitutionsByFilters: vi.fn((params: any) =>
        callViaFetchWithLogs('ONBOARDING_GET_INSTITUTIONS', { params })
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
    verifyOnboardingExternal: vi.fn((params: any) =>
        callViaFetchWithLogs('VERIFY_ONBOARDING', { params, method: 'HEAD' })
    ),
};
