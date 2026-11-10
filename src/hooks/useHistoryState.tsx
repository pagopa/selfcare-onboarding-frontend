import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { Location, useLocation, useNavigate } from 'react-router';
import { logAction } from '../lib/action-log';

type HistoryStateRecord = Record<string, unknown> | null | undefined;

/**
 * `useLocation` returns a snapshot taken at render time: several writes performed before the next
 * render (e.g. one setter per key in the same handler) would overwrite each other.
 * The last state written for a given location object is kept here so that consecutive writes accumulate.
 */
// eslint-disable-next-line functional/no-let
let lastWrite: { location: Location; state: HistoryStateRecord } | undefined;

const currentState = (location: Location): HistoryStateRecord =>
  lastWrite?.location === location ? lastWrite.state : (location.state as HistoryStateRecord);

export function useReplaceHistoryState() {
  const location = useLocation();
  const navigate = useNavigate();
  return useCallback(
    (update: (previous: HistoryStateRecord) => HistoryStateRecord) => {
      const state = update(currentState(location));
      lastWrite = { location, state };
      void navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        { replace: true, state }
      );
    },
    [location, navigate]
  );
}

export function useHistoryState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, (t: T) => void] {
  const location = useLocation();
  const replaceState = useReplaceHistoryState();
  const [rawState, rawSetState] = useState<T>(() => {
    const value = (currentState(location) as Partial<Record<string, T>> | null | undefined)?.[key];
    return value ?? initialValue;
  });
  function setHistory(value: T) {
    logAction('useHistory', { value });
    replaceState((previous) => ({ ...previous, [key]: value }));
  }
  return [rawState, rawSetState, setHistory];
}

