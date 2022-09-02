import { AxiosError } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { Problem, UserOnCreate } from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';

export async function userValidate(
  user: UserOnCreate,
  userId: string,
  onSuccess: (userId: string) => void,
  onValidationError: (userId: string, errors: { [fieldName: string]: Array<string> }) => void,
  onGenericError: (userId: string) => void,
  onRedirectToLogin: () => void,
  setLoading: (loading: boolean) => void,
  eventName: string
) {
  setLoading(true);

  const resultValidation = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_USER_VALIDATION',
    },
    {
      method: 'POST',
      data: {
        name: user.name,
        surname: user.surname,
        taxCode: user.taxCode,
      },
    },
    onRedirectToLogin
  );

  const result = getFetchOutcome(resultValidation);
  const errorBody = (resultValidation as AxiosError).response?.data;

  if (result === 'success') {
    onSuccess(userId);
  } else if (
    result === 'error' &&
    (resultValidation as AxiosError<Problem>).response?.status === 409 &&
    errorBody
  ) {
    trackEvent(`${eventName}_CONFLICT_ERROR`, {
      user_id: userId,
    });
    onValidationError(
      userId,
      Object.fromEntries(errorBody?.invalidParams?.map((e: any) => [e.name, ['conflict']]) ?? [])
    );
  } else {
    trackEvent(`${eventName}_GENERIC_ERROR`, {
      user_id: userId,
    });
    onGenericError(userId);
  }
  setLoading(false);
}
