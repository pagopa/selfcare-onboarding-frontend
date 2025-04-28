import { AxiosError } from 'axios';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { Problem, ProblemUserValidate, UserOnCreate } from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';

export async function userValidate(
  partyId: string,
  user: UserOnCreate,
  userId: string,
  onForwardAction: () => void,
  onValidationError: (userId: string, errors: { [fieldName: string]: Array<string> }) => void,
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
  const errorBody = (resultValidation as AxiosError<ProblemUserValidate>).response?.data;

if (
    result === 'error' &&
    (resultValidation as AxiosError<Problem>).response?.status === 409 &&
    errorBody
  ) {
    trackEvent(`${eventName}_CONFLICT_ERROR`, {
      party_id: partyId,
      reason: errorBody.detail,
    });
    onValidationError(
      userId,
      Object.fromEntries(errorBody?.invalidParams?.map((e: any) => [e.name, ['conflict']]) ?? [])
    );
  } else {
    onForwardAction();
  }
  setLoading(false);
}
