import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { RequestOutcomeMessage } from '../../../../types';
import { useOnboardingProductWizard } from '../useOnboardingProductWizard';

const outcome: RequestOutcomeMessage = { title: 'ko', description: [] };

describe('useOnboardingProductWizard', () => {
  test('starts from the initial state, with optional overrides', () => {
    const { result } = renderHook(() => useOnboardingProductWizard({ activeStep: 'manager' }));
    expect(result.current.state).toMatchObject({
      activeStep: 'manager',
      loading: true,
      externalInstitutionId: '',
      openExitModal: false,
      uploadDocumentsContext: null,
    });
    expect(result.current.requestIdRef.current).toBeUndefined();
    expect(result.current.createdOnboardingRef.current).toBeNull();
  });

  test('dispatch updates the state', () => {
    const { result } = renderHook(() => useOnboardingProductWizard());
    act(() =>
      result.current.dispatch({
        type: 'INSTITUTION_TYPE_SELECTED',
        institutionType: 'PA',
        productId: 'prod-io',
      })
    );
    expect(result.current.state).toMatchObject({
      institutionType: 'PA',
      activeStep: 'searchParty',
    });
  });

  test('setters accept a value', () => {
    const { result } = renderHook(() => useOnboardingProductWizard());
    act(() => {
      result.current.setLoading(false);
      result.current.setOutcome(outcome);
      result.current.setOpenExitModal(true);
      result.current.setSelectedProduct({ id: 'prod-io' } as any);
      result.current.setInstitutionType('GSP');
      result.current.setOrigin('IPA');
      result.current.setFilterCategoriesResponse({ product: {} });
    });
    expect(result.current.state).toMatchObject({
      loading: false,
      outcome,
      openExitModal: true,
      selectedProduct: { id: 'prod-io' },
      institutionType: 'GSP',
      origin: 'IPA',
      filterCategoriesResponse: { product: {} },
    });
  });

  test('setters accept an updater applied to the latest state', () => {
    const { result } = renderHook(() => useOnboardingProductWizard());
    act(() => {
      result.current.setLoading((prev) => !prev);
      result.current.setLoading((prev) => !prev);
      result.current.setLoading((prev) => !prev);
      result.current.setOrigin((prev) => `${prev ?? ''}IPA`);
      result.current.setInstitutionType((prev) => prev ?? 'PT');
    });
    expect(result.current.state).toMatchObject({
      loading: false,
      origin: 'IPA',
      institutionType: 'PT',
    });
  });

  test('setOnExitAction stores the returned function without calling it', () => {
    const goBack = vi.fn();
    const { result } = renderHook(() => useOnboardingProductWizard());
    act(() => result.current.setOnExitAction(() => goBack));
    expect(result.current.state.onExitAction).toBe(goBack);
    expect(goBack).not.toHaveBeenCalled();

    act(() => result.current.state.onExitAction?.());
    expect(goBack).toHaveBeenCalledTimes(1);

    act(() => result.current.setOnExitAction(undefined));
    expect(result.current.state.onExitAction).toBeUndefined();
  });

  test('dispatch, setters and refs keep their identity across renders', () => {
    const { result, rerender } = renderHook(() => useOnboardingProductWizard());
    const first = result.current;
    act(() => first.setLoading(false));
    rerender();
    const second = result.current;
    expect(second.state).not.toBe(first.state);
    (
      [
        'dispatch',
        'setLoading',
        'setOutcome',
        'setOpenExitModal',
        'setOnExitAction',
        'setSelectedProduct',
        'setInstitutionType',
        'setOrigin',
        'setFilterCategoriesResponse',
        'requestIdRef',
        'createdOnboardingRef',
      ] as const
    ).forEach((key) => expect(second[key]).toBe(first[key]));
  });
});
