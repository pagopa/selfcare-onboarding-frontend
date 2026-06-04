import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import {
  getOnboardingData,
  checkProduct,
  addUserRequest,
  getAllowedAddUserProducts,
  getInstiutionTypesByProduct,
} from '../onboardingServices';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    getOnboardingData: vi.fn(),
    getProduct: vi.fn(),
    onboardingUsers: vi.fn(),
    getProductsAdmin: vi.fn(),
    getOrigins: vi.fn(),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

const setLoading = vi.fn();
const setRequiredLogin = vi.fn();
const setOutcome = vi.fn();
const setProduct = vi.fn();
const setProducts = vi.fn();
const setRetrivedInstituionType = vi.fn();
const forward = vi.fn();

const genericError = { code: 'generic' } as any;
const outcomeContent = {
  success: { code: 'success' },
  error: { code: 'error' },
} as any;

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------- getOnboardingData ----------

it('test getOnboardingData success calls forward with mapped fields', async () => {
  vi.mocked(OnboardingApi.getOnboardingData).mockResolvedValue({
    institution: {
      id: 'inst-1',
      origin: 'IPA',
      originId: 'or1',
      institutionType: 'PA',
      country: 'IT',
      city: 'MILANO',
      county: 'MI',
      billingData: { taxCode: 'tc1' },
    },
    geographicTaxonomies: [],
  } as any);

  await getOnboardingData(
    setLoading,
    'prod-1',
    forward,
    undefined,
    setOutcome,
    genericError,
    'party-1'
  );

  expect(OnboardingApi.getOnboardingData).toHaveBeenCalledWith('party-1', 'prod-1');
  expect(forward).toHaveBeenCalled();
  expect(setLoading).toHaveBeenLastCalledWith(false);
});

it('test getOnboardingData on 404 calls forward with undefined', async () => {
  const err404 = Object.assign(new Error('nope'), { httpStatus: 404 });
  vi.mocked(OnboardingApi.getOnboardingData).mockRejectedValue(err404);

  await getOnboardingData(
    setLoading,
    'prod-1',
    forward,
    'PA' as any,
    setOutcome,
    genericError,
    'party-1'
  );

  expect(forward).toHaveBeenCalledWith(undefined, 'PA', undefined);
  expect(setOutcome).not.toHaveBeenCalled();
});

it('test getOnboardingData on generic error sets genericError outcome', async () => {
  const err500 = Object.assign(new Error('boom'), { httpStatus: 500 });
  vi.mocked(OnboardingApi.getOnboardingData).mockRejectedValue(err500);

  await getOnboardingData(
    setLoading,
    'prod-1',
    forward,
    undefined,
    setOutcome,
    genericError,
    'party-1'
  );

  expect(setOutcome).toHaveBeenCalledWith(genericError);
  expect(forward).not.toHaveBeenCalled();
});

// ---------- checkProduct ----------

it('test checkProduct success sets product', async () => {
  vi.mocked(OnboardingApi.getProduct).mockResolvedValue({ id: 'prod-1', status: 'ACTIVE' } as any);
  await checkProduct('prod-1', setProduct);
  expect(setProduct).toHaveBeenCalledWith(expect.objectContaining({ id: 'prod-1' }));
});

it('test checkProduct on PHASE_OUT triggers onPhaseOut', async () => {
  vi.mocked(OnboardingApi.getProduct).mockResolvedValue({
    id: 'prod-1',
    status: 'PHASE_OUT',
  } as any);
  const onPhaseOut = vi.fn();
  await checkProduct('prod-1', setProduct, { onPhaseOut });
  expect(onPhaseOut).toHaveBeenCalled();
});

it('test checkProduct on 404 triggers onNotFound and sets null', async () => {
  const err404 = Object.assign(new Error('nope'), { httpStatus: 404 });
  vi.mocked(OnboardingApi.getProduct).mockRejectedValue(err404);
  const onNotFound = vi.fn();
  await checkProduct('prod-1', setProduct, { onNotFound });
  expect(onNotFound).toHaveBeenCalled();
  expect(setProduct).toHaveBeenCalledWith(null);
});

// ---------- addUserRequest ----------

it('test addUserRequest success sets success outcome and tracks event', async () => {
  vi.mocked(OnboardingApi.onboardingUsers).mockResolvedValue(undefined);

  await addUserRequest(
    [{ taxCode: 'tc1' }] as any,
    setLoading,
    { id: 'prod-1' } as any,
    {} as any,
    { externalId: 'ext-1' } as any,
    'PA' as any,
    setOutcome,
    outcomeContent,
    'req-1'
  );

  expect(setOutcome).toHaveBeenCalledWith(outcomeContent.success);
  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_USER_SUCCESS', expect.any(Object));
});

it('test addUserRequest failure sets error outcome and tracks failure event', async () => {
  vi.mocked(OnboardingApi.onboardingUsers).mockRejectedValue(new Error('boom'));

  await addUserRequest(
    [{ taxCode: 'tc1' }] as any,
    setLoading,
    { id: 'prod-1' } as any,
    {} as any,
    { externalId: 'ext-1' } as any,
    'PA' as any,
    setOutcome,
    outcomeContent,
    'req-1'
  );

  expect(setOutcome).toHaveBeenCalledWith(outcomeContent.error);
  expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_USER_ERROR', expect.any(Object));
});

// ---------- getAllowedAddUserProducts ----------

it('test getAllowedAddUserProducts success sets products', async () => {
  vi.mocked(OnboardingApi.getProductsAdmin).mockResolvedValue([{ id: 'p1' }, { id: 'p2' }] as any);
  await getAllowedAddUserProducts(
    setLoading,
    setProducts,
    setOutcome,
    genericError
  );
  expect(setProducts).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ id: 'p1' })])
  );
});

it('test getAllowedAddUserProducts on error sets genericError outcome', async () => {
  vi.mocked(OnboardingApi.getProductsAdmin).mockRejectedValue(new Error('boom'));
  await getAllowedAddUserProducts(
    setLoading,
    setProducts,
    setOutcome,
    genericError
  );
  expect(setOutcome).toHaveBeenCalledWith(genericError);
});

// ---------- getInstiutionTypesByProduct ----------

it('test getInstiutionTypesByProduct success sets retrieved data', async () => {
  vi.mocked(OnboardingApi.getOrigins).mockResolvedValue({
    origins: [{ institutionType: 'PA', origin: 'IPA' }],
  } as any);

  await getInstiutionTypesByProduct(
    setLoading,
    'prod-1',
    setRetrivedInstituionType,
    setOutcome,
    genericError
  );

  expect(setRetrivedInstituionType).toHaveBeenCalled();
});

it('test getInstiutionTypesByProduct on empty origins sets genericError', async () => {
  vi.mocked(OnboardingApi.getOrigins).mockResolvedValue({ origins: [] } as any);

  await getInstiutionTypesByProduct(
    setLoading,
    'prod-1',
    setRetrivedInstituionType,
    setOutcome,
    genericError
  );

  expect(setOutcome).toHaveBeenCalledWith(genericError);
  expect(setRetrivedInstituionType).not.toHaveBeenCalled();
});

it('test getInstiutionTypesByProduct on error sets genericError', async () => {
  vi.mocked(OnboardingApi.getOrigins).mockRejectedValue(new Error('boom'));
  await getInstiutionTypesByProduct(
    setLoading,
    'prod-1',
    setRetrivedInstituionType,
    setOutcome,
    genericError
  );
  expect(setOutcome).toHaveBeenCalledWith(genericError);
});
