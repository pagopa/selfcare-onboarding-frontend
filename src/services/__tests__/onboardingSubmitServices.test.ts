import type { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import type { InstitutionType, RequestOutcomeMessage, RequestOutcomeOptions } from '../../../types';
import type { AdditionalGpuInformations } from '../../model/AdditionalGpuInformations';
import type { AdditionalInformations } from '../../model/AdditionalInformations';
import type { OnboardingFormData } from '../../model/OnboardingFormData';
import { buildProduct, buildUser } from '../../utils/test/builders';
import { it, expect, vi, beforeEach } from 'vitest';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { postOnboardingSubmit, postSubProductOnboardingSubmit } from '../onboardingSubmitServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    onboardingInstitution: vi.fn(),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

const setLoading = vi.fn();
const setOutcome = vi.fn();
const setError = vi.fn();
const setConflictError = vi.fn();
const forward = vi.fn();

const successOutcome: RequestOutcomeMessage = { title: 'SUCCESS', description: [] };
const errorOutcome: RequestOutcomeMessage = { title: 'ERROR', description: [] };
const outcomeContent: RequestOutcomeOptions = { success: successOutcome, error: errorOutcome };
const notAllowedError: RequestOutcomeMessage = { title: 'NOT_ALLOWED', description: [] };
// Only the fields read by the submit payload are provided
const onboardingFormData = {
  businessName: 'ACME',
  digitalAddress: 'a@b.it',
} as OnboardingFormData;
const requestIdRef = { current: 'req-1' };

const submitArgs = (
  onSuccess?: () => void,
  onRequiredDocuments?: () => void
): Parameters<typeof postOnboardingSubmit> => [
  setLoading,
  'prod-1',
  buildProduct({ id: 'prod-1' }),
  setOutcome,
  onboardingFormData,
  requestIdRef,
  'ext-inst-1',
  undefined,
  undefined,
  'PA',
  'IPA',
  outcomeContent,
  notAllowedError,
  undefined,
  [buildUser({ taxCode: 'RSSMRA80A01H501Z' })],
  null,
  undefined,
  onSuccess,
  onRequiredDocuments,
];

const subProductArgs = (): Parameters<typeof postSubProductOnboardingSubmit> => [
  'ext-inst-1',
  buildProduct({ id: 'subprod-1' }),
  [buildUser({ taxCode: 'RSSMRA80A01H501Z' })],
  onboardingFormData,
  'PA',
  'req-1',
  buildProduct({ id: 'prod-1' }),
  setError,
  forward,
  'IPA',
  'origin-id-1',
  'C0',
  setConflictError,
];

beforeEach(() => {
  vi.clearAllMocks();
});

it('test postOnboardingSubmit success tracks success and forwards', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);
  const onSuccess = vi.fn();

  await postOnboardingSubmit(...submitArgs(onSuccess));

  expect(OnboardingApi.onboardingInstitution).toHaveBeenCalled();
  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_SEND_SUCCESS', expect.any(Object));
  expect(setOutcome).toHaveBeenCalledWith(successOutcome);
  expect(onSuccess).toHaveBeenCalled();
  expect(setLoading).toHaveBeenLastCalledWith(false);
});

it('test postOnboardingSubmit success with onRequiredDocuments enters the document flow instead of the outcome', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);
  const onRequiredDocuments = vi.fn();

  await postOnboardingSubmit(...submitArgs(undefined, onRequiredDocuments));

  expect(onRequiredDocuments).toHaveBeenCalled();
  expect(setOutcome).not.toHaveBeenCalled();
});

it('test postOnboardingSubmit 409 tracks conflict failure', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockRejectedValue(
    Object.assign(new Error('conflict'), { httpStatus: 409 })
  );

  await postOnboardingSubmit(...submitArgs());

  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_SEND_CONFLICT_ERROR_FAILURE',
    expect.any(Object)
  );
});

it('test postOnboardingSubmit 403 tracks not-allowed and sets notAllowedError', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockRejectedValue(
    Object.assign(new Error('forbidden'), { httpStatus: 403 })
  );

  await postOnboardingSubmit(...submitArgs());

  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_NOT_ALLOWED_ERROR', expect.any(Object));
  expect(setOutcome).toHaveBeenCalledWith(notAllowedError);
});

it('test postSubProductOnboardingSubmit success tracks premium success and forwards', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);

  await postSubProductOnboardingSubmit(...subProductArgs());

  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_PREMIUM_SEND_SUCCESS', expect.any(Object));
  expect(forward).toHaveBeenCalled();
});

it('test postSubProductOnboardingSubmit 409 sets conflict and tracks reason from detail', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockRejectedValue(
    Object.assign(new Error('conflict'), { httpStatus: 409, httpBody: { detail: 'already there' } })
  );

  await postSubProductOnboardingSubmit(...subProductArgs());

  expect(setConflictError).toHaveBeenCalledWith(true);
  expect(trackEvent).toHaveBeenCalledWith(
    'ONBOARDING_PREMIUM_SEND_CONFLICT_ERROR_FAILURE',
    expect.objectContaining({ reason: 'already there' })
  );
  expect(setError).toHaveBeenCalledWith(true);
});

const payloadFormData = {
  businessName: 'ACME',
  taxCode: '00000000001',
  originId: 'origin-1',
  businessRegisterPlace: 'Roma',
  country: 'FR',
  county: 'RM',
  city: 'Roma',
  istatCode: '058091',
  supportEmail: 'support@acme.it',
  geographicTaxonomies: [],
  userRequester: { name: 'Anna', surname: 'Bianchi', email: 'anna@acme.it' },
} satisfies Partial<OnboardingFormData>;

const submitPayloadArgs = (
  productId: string,
  institutionType: InstitutionType,
  formData: Partial<OnboardingFormData>,
  loggedUserTaxCode: string
) => {
  const args = submitArgs();
  args[1] = productId;
  args[2] = buildProduct({ id: productId });
  args[4] = formData as OnboardingFormData;
  args[7] = {
    agentOfPublicService: true,
    ipa: false,
    otherNote: 'note',
    extra: 'dropped',
  } as unknown as AdditionalInformations; // the unknown extra field must be dropped
  args[8] = { businessRegisterNumber: 'BRN' } as AdditionalGpuInformations;
  args[9] = institutionType;
  args[10] = 'ANAC';
  args[15] = { uid: 'u1', taxCode: loggedUserTaxCode } as User;
  return args;
};

it('test postOnboardingSubmit builds the payload for a non-IPA io-sign subunit', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);

  await postOnboardingSubmit(
    ...submitPayloadArgs(
      'prod-io-sign',
      'PA',
      { ...payloadFormData, uoUniqueCode: 'UO1', aooUniqueCode: 'AOO1', isAggregator: false },
      'LOGGED00A01H501Z'
    )
  );

  expect(OnboardingApi.onboardingInstitution).toHaveBeenCalledWith(
    expect.objectContaining({
      additionalInformations: undefined,
      gpuData: undefined,
      pspData: undefined,
      companyInformations: {
        businessRegisterPlace: 'Roma',
        rea: undefined,
        shareCapital: undefined,
      },
      institutionType: 'PA',
      originId: 'origin-1',
      geographicTaxonomies: [],
      institutionLocationData: { country: 'FR', county: 'RM', city: 'Roma' },
      origin: 'ANAC',
      istatCode: '058091',
      assistanceContacts: { supportEmail: 'support@acme.it' },
      productId: 'prod-io-sign',
      subunitCode: 'UO1',
      subunitType: 'UO',
      taxCode: '00000000001',
      isAggregator: undefined,
      userRequester: { name: 'Anna', surname: 'Bianchi', email: 'anna@acme.it' },
    })
  );
});

it('test postOnboardingSubmit builds the payload for GSP and GPU product specific data', async () => {
  vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);

  await postOnboardingSubmit(
    ...submitPayloadArgs(
      'prod-pagopa',
      'GSP',
      { ...payloadFormData, aooUniqueCode: 'AOO1', isAggregator: true },
      'RSSMRA80A01H501Z'
    )
  );

  const payload = vi.mocked(OnboardingApi.onboardingInstitution).mock.calls[0][0];
  expect(payload.additionalInformations).toEqual({
    agentOfPublicService: true,
    agentOfPublicServiceNote: undefined,
    belongRegulatedMarket: undefined,
    regulatedMarketNote: undefined,
    establishedByRegulatoryProvision: undefined,
    establishedByRegulatoryProvisionNote: undefined,
    ipa: false,
    ipaCode: undefined,
    otherNote: 'note',
  });
  expect(payload.gpuData).toBeUndefined();
  expect(payload.assistanceContacts).toBeUndefined();
  expect(payload.subunitCode).toBe('AOO1');
  expect(payload.subunitType).toBe('AOO');
  expect(payload.isAggregator).toBe(true);
  expect(payload.userRequester).toBeUndefined();
});

it.each([
  ['GPU', 'prod-interop', { businessRegisterNumber: 'BRN' }, 'FR'],
  ['SCP', 'prod-interop', undefined, 'IT'],
  ['SCP', 'prod-io', undefined, 'FR'],
] as Array<[InstitutionType, string, Record<string, string> | undefined, string]>)(
  'test postOnboardingSubmit for %s on %s sets gpuData and location country',
  async (institutionType, productId, gpuData, country) => {
    vi.mocked(OnboardingApi.onboardingInstitution).mockResolvedValue(undefined);

    await postOnboardingSubmit(
      ...submitPayloadArgs(productId, institutionType, payloadFormData, 'RSSMRA80A01H501Z')
    );

    const payload = vi.mocked(OnboardingApi.onboardingInstitution).mock.calls[0][0];
    expect(payload.gpuData).toEqual(gpuData);
    expect(payload.institutionLocationData?.country).toBe(country);
  }
);
