// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './locale/it';
import en from './locale/en';
import de from './locale/de';
import fr from './locale/fr';
import sl from './locale/sl';
import '@testing-library/jest-dom/vitest';
import { mockFetch } from './lib/__mocks__/mockApiRequests';

void i18n.use(initReactI18next).init({
    resources: {
        it: { translation: it },
        en: { translation: en },
        de: { translation: de },
        fr: { translation: fr },
        sl: { translation: sl },
    },
    lng: 'it',
    fallbackLng: 'it',
    initImmediate: false,
    interpolation: { escapeValue: false },
});

// Global mocks for codegen wrappers.
// Each method delegates to mockFetch (from mockApiRequests.ts) using the
// equivalent legacy endpoint string. This preserves component test behavior
// after the migration: tests that exercised flows via fetchWithLogs continue
// to receive the same canned data from mockApiRequests through the new wrappers.
// Service tests override these with their own file-level vi.mock().
const callMock = async (
    endpoint: string,
    options: { endpointParams?: any; params?: any; data?: any; method?: string } = {}
) => {
    const r = await mockFetch(
        { endpoint: endpoint as any, endpointParams: options.endpointParams ?? {} },
        { params: options.params, data: options.data, method: options.method ?? 'GET' } as any
    );
    if ((r as any).isAxiosError) {
        const error = new Error(`HTTP ${(r as any).response?.status}`);
        (error as any).httpStatus = (r as any).response?.status;
        (error as any).httpBody = (r as any).response?.data;
        throw error;
    }
    return (r as any).data;
};

vi.mock('./api/OnboardingApiClient', () => ({
    OnboardingApi: {
        retrieveOnboardingRequest: vi.fn((onboardingId: string) =>
            callMock('ONBOARDING_GET_INFO', { endpointParams: { onboardingId } })
        ),
        verifyOnboarding: vi.fn((onboardingId: string) =>
            callMock('ONBOARDING_TOKEN_VALIDATION', { endpointParams: { onboardingId } })
        ),
        userValidate: vi.fn((body: any) =>
            callMock('ONBOARDING_USER_VALIDATION', { data: body, method: 'POST' })
        ),
        verifyRecipientCode: vi.fn((originId: string, recipientCode: string) =>
            callMock('ONBOARDING_RECIPIENT_CODE_VALIDATION', {
                params: { recipientCode, originId },
            })
        ),
        checkManager: vi.fn((body: any) =>
            callMock('ONBOARDING_CHECK_MANAGER', { data: body, method: 'POST' })
        ),
        searchUserId: vi.fn((body: any) =>
            callMock('ONBOARDING_SEARCH_USER', { data: body, method: 'POST' })
        ),
        deleteOnboardingRequest: vi.fn((onboardingId: string) =>
            callMock('ONBOARDING_COMPLETE_REGISTRATION', {
                endpointParams: { token: onboardingId },
                method: 'DELETE',
            })
        ),
        getInstitutions: vi.fn((productId?: string) =>
            callMock('ONBOARDING_GET_USER_PARTIES', { params: { productId } })
        ),
        getPreviousGeotaxonomies: vi.fn((taxCode: string, subunitCode?: string) =>
            callMock('ONBOARDING_GET_PREVIOUS_GEOTAXONOMIES', {
                params: { taxCode, subunitCode },
            })
        ),
        getOnboardingData: vi.fn((institutionId: string, productId: string) =>
            callMock('ONBOARDING_GET_ONBOARDING_DATA', {
                params: { institutionId, productId },
            })
        ),
        getProduct: vi.fn((id: string, institutionType?: string) =>
            callMock('ONBOARDING_VERIFY_PRODUCT', {
                endpointParams: { productId: id },
                params: { institutionType },
            })
        ),
        onboardingUsers: vi.fn((body: any) =>
            callMock('ONBOARDING_NEW_USER', { data: body, method: 'POST' })
        ),
        getProductsAdmin: vi.fn(() =>
            callMock('ONBOARDING_GET_ALLOWED_ADD_USER_PRODUCTS', {})
        ),
        getOrigins: vi.fn((productId: string) =>
            callMock('ONBOARDING_GET_INSTITUTION_TYPE_BY_PRODUCT', {
                params: { productId },
            })
        ),
    },
}));

vi.mock('./api/PartyRegistryProxyApiClient', () => ({
    PartyRegistryProxyApi: {
        getTaxonomiesByQuery: vi.fn((query: string) =>
            callMock('ONBOARDING_GET_GEOTAXONOMY', { params: { description: query } })
        ),
        getLocationByCode: vi.fn((geotaxId: string) =>
            callMock('ONBOARDING_GET_LOCATION_BY_ISTAT_CODE', {
                endpointParams: { geoTaxId: geotaxId },
            })
        ),
        findInstitution: vi.fn((id: string, origin?: string, categories?: string) =>
            callMock('ONBOARDING_GET_PARTY_FROM_CF', {
                endpointParams: { id },
                params: { origin, categories },
            })
        ),
        getUoInfo: vi.fn((codiceUniUo: string) =>
            callMock('ONBOARDING_GET_UO_CODE_INFO', { endpointParams: { codiceUniUo } })
        ),
    },
}));

beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
});