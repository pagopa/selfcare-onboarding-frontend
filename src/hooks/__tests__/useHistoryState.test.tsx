import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { expect, test } from 'vitest';
import { useHistoryState } from '../useHistoryState';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/onboarding/prod?x=1#h']}>{children}</MemoryRouter>
);

test('Test: consecutive writes of different keys in the same tick are all kept', () => {
  const { result } = renderHook(
    () => ({
      a: useHistoryState<string>('a', ''),
      b: useHistoryState<string>('b', ''),
      c: useHistoryState<string>('c', ''),
      location: useLocation(),
    }),
    { wrapper }
  );

  act(() => {
    result.current.a[2]('1');
    result.current.b[2]('2');
    result.current.c[2]('3');
  });

  expect(result.current.location.state).toEqual({ a: '1', b: '2', c: '3' });
  expect(result.current.location.pathname).toBe('/onboarding/prod');
  expect(result.current.location.search).toBe('?x=1');
  expect(result.current.location.hash).toBe('#h');
});

test('Test: a value stored in the history state is the initial value after a remount', () => {
  const { result } = renderHook(() => useHistoryState<string>('a', 'default'), { wrapper });
  expect(result.current[0]).toBe('default');

  const Probe = () => {
    const [value] = useHistoryState<string>('a', 'default');
    return <span>{value}</span>;
  };
  const { getByText } = render(
    <MemoryRouter initialEntries={[{ pathname: '/', state: { a: 'stored' } }]}>
      <Probe />
    </MemoryRouter>
  );
  getByText('stored');
});
