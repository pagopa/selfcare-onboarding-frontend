import { act, renderHook } from '@testing-library/react';
import { PartyData } from '../../../types';
import { PDNDBusinessResource } from '../../model/PDNDBusinessResource';
import { PRODUCT_IDS } from '../../utils/constants';
import { useMerchantSearchResult } from '../useMerchantSearchResult';

const KEY = 'merchantSearchResult';
const MERCHANT = PRODUCT_IDS.IDPAY_MERCHANT;
const OTHER = PRODUCT_IDS.INTEROP;
const result = { businessName: 'ACME', statusCompanyRI: 'CANCELLATA' } as PDNDBusinessResource;

describe('useMerchantSearchResult', () => {
  beforeEach(() => sessionStorage.clear());

  test('initializes from storage only for merchant product', () => {
    sessionStorage.setItem(KEY, JSON.stringify(result));
    const merchant = renderHook(() => useMerchantSearchResult(vi.fn(), MERCHANT));
    expect(merchant.result.current.merchantSearchResult).toEqual(result);
    const other = renderHook(() => useMerchantSearchResult(vi.fn(), OTHER));
    expect(other.result.current.merchantSearchResult).toBeUndefined();
  });

  test('ignores corrupted storage', () => {
    sessionStorage.setItem(KEY, '{bad');
    const { result: r } = renderHook(() => useMerchantSearchResult(vi.fn(), MERCHANT));
    expect(r.current.merchantSearchResult).toBeUndefined();
  });

  test('sets, persists and clears the result', () => {
    const { result: r } = renderHook(() => useMerchantSearchResult(vi.fn(), MERCHANT));
    act(() => r.current.setMerchantSearchResult(result));
    expect(r.current.merchantSearchResult).toEqual(result);
    expect(sessionStorage.getItem(KEY)).toBe(JSON.stringify(result));
    act(() => r.current.setMerchantSearchResult(undefined));
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  test('does not persist for non-merchant product', () => {
    const { result: r } = renderHook(() => useMerchantSearchResult(vi.fn(), OTHER));
    act(() => r.current.setMerchantSearchResult(result));
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  test('computes disabledStatusCompany', () => {
    const { result: r } = renderHook(() => useMerchantSearchResult(vi.fn(), MERCHANT));
    expect(r.current.disabledStatusCompany).toBe(false);
    act(() => r.current.setMerchantSearchResult({ businessName: 'x' } as PDNDBusinessResource));
    expect(r.current.disabledStatusCompany).toBe(false);
    act(() => r.current.setMerchantSearchResult({ statusCompanyRD: 'X' } as PDNDBusinessResource));
    expect(r.current.disabledStatusCompany).toBe(true);
  });

  test('clearMerchantStorage removes the key only for merchant', () => {
    sessionStorage.setItem(KEY, '{}');
    const other = renderHook(() => useMerchantSearchResult(vi.fn(), OTHER));
    other.result.current.clearMerchantStorage();
    expect(sessionStorage.getItem(KEY)).toBe('{}');
    const merchant = renderHook(() => useMerchantSearchResult(vi.fn(), MERCHANT));
    merchant.result.current.clearMerchantStorage();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  test('cleans storage on unmount unless forwarding', () => {
    sessionStorage.setItem(KEY, '{}');
    sessionStorage.setItem('onboarding_forward', 'true');
    renderHook(() => useMerchantSearchResult(vi.fn(), MERCHANT)).unmount();
    expect(sessionStorage.getItem(KEY)).toBe('{}');
    sessionStorage.removeItem('onboarding_forward');
    renderHook(() => useMerchantSearchResult(vi.fn(), MERCHANT)).unmount();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  test('resets stale result and disables when selected without stored data', () => {
    sessionStorage.setItem(KEY, JSON.stringify(result));
    const setDisabled = vi.fn();
    const { result: r, rerender } = renderHook(
      ({ selected }: { selected: PartyData | null }) =>
        useMerchantSearchResult(setDisabled, MERCHANT, selected),
      { initialProps: { selected: null as PartyData | null } }
    );
    sessionStorage.removeItem(KEY);
    rerender({ selected: { id: '1' } as PartyData });
    expect(r.current.merchantSearchResult).toBeUndefined();
    expect(setDisabled).toHaveBeenCalledWith(true);
  });
});
