import { DISPLAY_LOGS } from './constants';

export function logAction(actionLabel: string, data: any) {
  if (!DISPLAY_LOGS) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log(actionLabel, data);
}

export function logError(error: any) {
  console.error(error);
}
