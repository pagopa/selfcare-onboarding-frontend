import { Grid, Typography } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useContext, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Product, StepperStepComponentProps, UserOnCreate } from '../../../types';
import { UserContext } from '../../lib/context';
import { objectIsEmpty } from '../../lib/object-utils';
import { userValidate } from '../../utils/api/userValidate';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { PlatformUserForm, validateUser } from '../PlatformUserForm';
import { useHistoryState } from '../useHistoryState';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };
export type UsersError = { [key: string]: { [userField: string]: Array<string> } };

type Props = StepperStepComponentProps & {
  readOnly?: boolean;
  subProduct?: Product;
};

export function StepAddManager({ readOnly, product, forward, back, subProduct }: Props) {
  const { setRequiredLogin } = useContext(UserContext);
  const [_loading, setLoading] = useState(true);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step2', {});
  const [peopleErrors, setPeopleErrors] = useState<UsersError>();
  const [genericError, setGenericError] = useState<boolean>(false);
  const { t } = useTranslation();

  const onUserValidateSuccess = () => {
    setGenericError(false);
    onForwardAction();
  };

  const onUserValidateError = (userId: string, errors: { [fieldName: string]: Array<string> }) => {
    setPeopleErrors({
      [userId]: errors,
    });
  };

  const onUserValidateGenericError = () => {
    setGenericError(true);
  };

  const validateUserData = (user: UserOnCreate, prefix: string) => {
    userValidate(
      user,
      prefix,
      onUserValidateSuccess,
      onUserValidateError,
      onUserValidateGenericError,
      () => setRequiredLogin(true),
      setLoading,
      'STEP_ADD_MANAGER'
    ).catch((reason) => {
      trackEvent('STEP_ADD_MANAGER', {
        message: `Something gone wrong while validating user having id: ${prefix}`,
        reason,
      });
    });
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

  const handleCloseGenericErrorModal = () => {
    setGenericError(false);
  };

  return (
    <Grid container direction="column">
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
            <Trans
              i18nKey={
                subProduct
                  ? 'onboardingStep2.premiumBodyDescription'
                  : 'onboardingStep2.bodyDescription'
              }
            >
              Inserisci i dati del Legale Rappresentante.
              <br />
              La persona che indicherai sar?? firmataria del contratto per
              <br />
              {`${product?.title}`}.
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={4}>
        <Grid item xs={8} sx={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.06)' }}>
          <PlatformUserForm
            prefix="LEGAL"
            role="MANAGER"
            people={people}
            peopleErrors={peopleErrors}
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
            action: () => {
              validateUserData(people.LEGAL, 'LEGAL');
            },
            label: t('onboardingStep2.confirmLabel'),
            disabled: objectIsEmpty(people) || !validateUser('LEGAL', people.LEGAL, people),
          }}
        />
      </Grid>
      <SessionModal
        open={genericError}
        title={t('onboarding.outcomeContent.error.title')}
        message={
          <Trans i18nKey="onboarding.outcomeContent.error.description">
            {'A causa di un errore del sistema non ?? possibile completare la procedura.'} <br />
            {'Ti chiediamo di riprovare pi?? tardi.'}
          </Trans>
        }
        onCloseLabel={t('onboarding.outcomeContent.error.backActionLabel')}
        handleClose={handleCloseGenericErrorModal}
      ></SessionModal>
    </Grid>
  );
}
