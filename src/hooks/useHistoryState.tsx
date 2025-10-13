import { useHistory } from 'react-router-dom';
import { Dispatch, SetStateAction, useState } from 'react';
import { logAction } from '../lib/action-log';

export function useHistoryState<T>(
  key: string,
  initialValue?: T
): [T, Dispatch<SetStateAction<T>>, (t: T) => void] {
  const history = useHistory();
  const [rawState, rawSetState] = useState<T>(() => {
    const value = (history.location.state as any)?.[key];
    return value ?? initialValue;
  });
  function setHistory(value: T) {
    logAction('useHistory', { value });
    history.replace({
      ...history.location,
      state: {
        ...(history.location.state as any),
        [key]: value,
      },
    });
  }
  return [rawState, rawSetState, setHistory];
}
