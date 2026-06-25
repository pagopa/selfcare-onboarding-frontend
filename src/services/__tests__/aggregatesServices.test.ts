import { it, expect, vi, beforeEach } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { verifyAggregates } from '../aggregatesServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: { verifyAggregatesCsv: vi.fn() },
}));

vi.mock('../../views/onboardingProduct/components/StepVerifyOnboarding', () => ({
  genericError: { title: 'error' },
}));

const setLoading = vi.fn();
const parseJson2Csv = vi.fn();
const setDisabled = vi.fn();
const forward = vi.fn();
const setFoundErrors = vi.fn();
const setOutcome = vi.fn();
const setRequiredLogin = vi.fn();
const file = new File(['x'], 'a.csv', { type: 'text/csv' });

beforeEach(() => {
  vi.clearAllMocks();
});

it('test verifyAggregates success without errors forwards the aggregates', async () => {
  vi.mocked(OnboardingApi.verifyAggregatesCsv).mockResolvedValue({
    aggregates: [{ taxCode: 't1' }],
    errors: [],
  } as any);

  await verifyAggregates(
    file,
    setLoading,
    'PA' as any,
    'prod-1',
    setRequiredLogin,
    parseJson2Csv,
    setDisabled,
    forward,
    setFoundErrors,
    setOutcome
  );

  expect(OnboardingApi.verifyAggregatesCsv).toHaveBeenCalledWith(file, 'prod-1', 'PA');
  expect(setDisabled).toHaveBeenCalledWith(false);
  expect(forward).toHaveBeenCalledWith(undefined, [{ taxCode: 't1' }]);
});

it('test verifyAggregates success with errors sets foundErrors', async () => {
  vi.mocked(OnboardingApi.verifyAggregatesCsv).mockResolvedValue({
    aggregates: [],
    errors: [{ riga: 1, 'codice fiscale': 'CF', errore: 'bad' }],
  } as any);

  await verifyAggregates(
    file,
    setLoading,
    undefined,
    'prod-1',
    setRequiredLogin,
    parseJson2Csv,
    setDisabled,
    forward,
    setFoundErrors,
    setOutcome
  );

  expect(parseJson2Csv).toHaveBeenCalled();
  expect(setDisabled).toHaveBeenCalledWith(true);
  expect(setFoundErrors).toHaveBeenCalledWith([{ riga: 1, 'codice fiscale': 'CF', errore: 'bad' }]);
});

it('test verifyAggregates on error sets generic outcome', async () => {
  vi.mocked(OnboardingApi.verifyAggregatesCsv).mockRejectedValue(new Error('boom'));

  await verifyAggregates(
    file,
    setLoading,
    undefined,
    'prod-1',
    setRequiredLogin,
    parseJson2Csv,
    setDisabled,
    forward,
    setFoundErrors,
    setOutcome
  );

  expect(setOutcome).toHaveBeenCalledWith({ title: 'error' });
});
