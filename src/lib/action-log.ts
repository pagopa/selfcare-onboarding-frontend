import { DISPLAY_LOGS } from '../utils/constants';

export function logAction(actionLabel: string, data: unknown) {
  if (!DISPLAY_LOGS) {
    return;
  }

  console.log(actionLabel, data);
}

export function logError(error: unknown) {
  console.error(error);
}
