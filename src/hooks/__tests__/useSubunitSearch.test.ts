import { renderHook } from '@testing-library/react';
import { PRODUCT_IDS } from '../../utils/constants';
import * as services from '../../services/institutionServices';
import { useSubunitSearch } from '../useSubunitSearch';

vi.mock('../../services/institutionServices', () => ({
  getECDataByCF: vi.fn(),
  handleSearchByAooCode: vi.fn(),
  handleSearchByUoCode: vi.fn(),
}));

const mockHistory = vi.hoisted(() => ({ values: {} as Record<string, unknown> }));
vi.mock('../useHistoryState', () => ({
  useHistoryState: (key: string, initial: unknown) => [
    mockHistory.values[key] ?? initial,
    vi.fn(),
    vi.fn(),
  ],
}));

const setApiLoading = vi.fn();
const base = {
  subunitTypeByQuery: '',
  subunitCodeByQuery: 'CODE',
  filterCategories: 'cat',
  setApiLoading,
};

describe('useSubunitSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHistory.values = {};
  });

  test('searches UO by code for SEND', () => {
    renderHook(() =>
      useSubunitSearch({ ...base, productId: PRODUCT_IDS.SEND, subunitTypeByQuery: 'UO' })
    );
    expect(services.handleSearchByUoCode).toHaveBeenCalledTimes(1);
    expect(vi.mocked(services.handleSearchByUoCode).mock.calls[0][0]).toBe('CODE');
    expect(vi.mocked(services.handleSearchByUoCode).mock.calls[0][9]).toBe(PRODUCT_IDS.SEND);
    expect(services.handleSearchByAooCode).not.toHaveBeenCalled();
  });

  test('searches AOO by code for SEND', () => {
    renderHook(() =>
      useSubunitSearch({ ...base, productId: PRODUCT_IDS.SEND, subunitTypeByQuery: 'AOO' })
    );
    expect(services.handleSearchByAooCode).toHaveBeenCalledTimes(1);
    expect(services.handleSearchByUoCode).not.toHaveBeenCalled();
  });

  test.each([
    [PRODUCT_IDS.INTEROP, 'UO'],
    [PRODUCT_IDS.SEND, ''],
  ])('does not search for product %s and subunit type "%s"', (productId, subunitTypeByQuery) => {
    renderHook(() => useSubunitSearch({ ...base, productId, subunitTypeByQuery }));
    expect(services.handleSearchByUoCode).not.toHaveBeenCalled();
    expect(services.handleSearchByAooCode).not.toHaveBeenCalled();
  });

  test('loads EC data from the AOO tax code, preferring AOO over UO', () => {
    mockHistory.values = {
      aooSelected_step1: { codiceFiscaleEnte: 'AOO_CF' },
      uoSelected_step1: { codiceFiscaleEnte: 'UO_CF' },
    };
    renderHook(() => useSubunitSearch({ ...base, productId: PRODUCT_IDS.PAGOPA }));
    expect(services.getECDataByCF).toHaveBeenCalledTimes(1);
    expect(vi.mocked(services.getECDataByCF).mock.calls[0][0]).toBe('AOO_CF');
  });

  test('loads EC data from the UO tax code when no AOO', () => {
    mockHistory.values = { uoSelected_step1: { codiceFiscaleEnte: 'UO_CF' } };
    renderHook(() => useSubunitSearch({ ...base, productId: PRODUCT_IDS.PAGOPA }));
    expect(vi.mocked(services.getECDataByCF).mock.calls[0][0]).toBe('UO_CF');
  });

  test('does not load EC data without AOO/UO result', () => {
    renderHook(() => useSubunitSearch({ ...base, productId: PRODUCT_IDS.PAGOPA }));
    expect(services.getECDataByCF).not.toHaveBeenCalled();
  });
});
