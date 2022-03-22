import { Grid, Typography } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { StepperStepComponentProps, UserOnCreate } from '../../types';
import { objectIsEmpty } from '../lib/object-utils';
import { OnboardingStepActions } from './OnboardingStepActions';
import { PlatformUserForm, validateUser } from './PlatformUserForm';
import { useHistoryState } from './useHistoryState';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };

export function OnboardingStep2({ product, forward, back }: StepperStepComponentProps) {
  // const [people, setPeople] = useState<UsersObject>({});
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step2', {});
  const { t } = useTranslation();

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
          <Typography variant="h3" component="h2" align="center">
            {t('onboardingStep2.bodyTitle')}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" component="h2" align="center">
            <Trans i18nKey="onboardingStep2.bodyDescription">
              Inserisci i dati del Legale Rappresentante.
              <br />
              {`${product?.title}`}
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={7}>
        <Grid item xs={6} sx={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.06)' }}>
          <PlatformUserForm
            prefix="LEGAL"
            role="MANAGER"
            people={people}
            allPeople={people}
            setPeople={setPeople}
          />
        </Grid>
      </Grid>

      <Grid item my={7}>
        <OnboardingStepActions
          back={{ action: onBackAction, label: t('onboardingStep2.backLabel'), disabled: false }}
          forward={{
            action: onForwardAction,
            label: t('onboardingStep2.confirmLabel'),
            disabled: objectIsEmpty(people) || !validateUser('LEGAL', people.LEGAL, people),
          }}
        />
      </Grid>
    </Grid>
  );
}
