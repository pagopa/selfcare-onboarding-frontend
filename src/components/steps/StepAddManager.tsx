import { Grid, Typography } from '@mui/material';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { AxiosError, AxiosResponse } from 'axios';
import { useContext, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { StepperStepComponentProps, UserOnCreate } from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { getFetchOutcome } from '../../lib/error-utils';
import { objectIsEmpty } from '../../lib/object-utils';
import { ValidateErrorType } from '../../views/onboarding/Onboarding';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { PlatformUserForm, validateUser } from '../PlatformUserForm';
import { useHistoryState } from '../useHistoryState';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };

type Props = StepperStepComponentProps & {
  readOnly?: boolean;
};

export function StepAddManager({ readOnly, product, forward, back }: Props) {
  // const [people, setPeople] = useState<UsersObject>({});
  const { setRequiredLogin } = useContext(UserContext);
  const [_loading, setLoading] = useState(true);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step2', {});
  const [errorField, setErrorField] = useState<UsersError>();
  const [_validateError, setValidateError] = useState<ValidateErrorType>();
  const { t } = useTranslation();

  const validateUserData = async (taxCode: string, name?: string, surname?: string) => {
    setLoading(true);
    const resultValidation = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_USER_VALIDATION',
        endpointParams: { taxCode },
      },
      {
        method: 'POST',
        data: {
          name,
          surname,
        },
      },
      () => setRequiredLogin(true)
    );

    const result = getFetchOutcome(resultValidation);

    if (result === 'success') {
      setValidateError(undefined);
      onForwardAction();
    } else if (result === 'error' && (resultValidation as AxiosError).response?.status === 409) {
      setValidateError('conflictError');
      const error = (resultValidation as AxiosResponse).data;
      setErrorField(error);
      trackEvent('STEP_ADD_MANAGER_CONFLICT_ERROR', {
        product_id: product?.id,
        error_field: errorField,
      });
    } else {
      onForwardAction();
      setValidateError(undefined);
    }
  };

  const onForwardAction = () => {
    savePageState();
    forward({ users: Object.values(people) });
  };

  const onBackAction = () => {
    savePageState();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  const savePageState = () => {
    setPeopleHistory(people);
  };
  return (
    <Grid
      container
      // mt={16}
      direction="column"
    >
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
            <Trans i18nKey="onboardingStep2.bodyTitle">
              Indica il Legale <br /> Rappresentante
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12}>
          <Typography sx={{ fontWeight: 400 }} variant="body1" component="h2" align="center">
            <Trans i18nKey="onboardingStep2.bodyDescription">
              Inserisci i dati del Legale Rappresentante.
              <br />
              La persona che indicherai sarà firmataria del contratto per
              <br />
              {`${product?.title}`}.
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      {console.log(people.LEGAL.taxCode)}
      <Grid container item justifyContent="center" mt={4}>
        <Grid item xs={8} sx={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.06)' }}>
          <PlatformUserForm
            prefix="LEGAL"
            role="MANAGER"
            people={people}
            peopleErrors={errorField}
            allPeople={people}
            setPeople={setPeople}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>

      <Grid item mb={10} mt={4}>
        <OnboardingStepActions
          back={{
            action: onBackAction,
            label: t('onboardingStep2.backLabel'),
            disabled: false,
          }}
          forward={{
            action: () =>
              validateUserData(people.LEGAL?.taxCode, people.LEGAL?.name, people.LEGAL?.surname),
            label: t('onboardingStep2.confirmLabel'),
            disabled: objectIsEmpty(people) || !validateUser('LEGAL', people.LEGAL, people),
          }}
        />
      </Grid>
    </Grid>
  );
}
