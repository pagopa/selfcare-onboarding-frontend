import { Grid, Typography } from '@mui/material';
import { StepperStepComponentProps, UserOnCreate } from '../../types';
import { objectIsEmpty } from '../lib/object-utils';
import { OnboardingStepActions } from './OnboardingStepActions';
// import {StyledIntro} from './StyledIntro';
import { PlatformUserForm, validateUser } from './PlatformUserForm';
import { useHistoryState } from './useHistoryState';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };

export function OnboardingStep2({ forward, back }: StepperStepComponentProps) {
  // const [people, setPeople] = useState<UsersObject>({});
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step2', {});

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
  const bodyTitle = 'Indica il Legale Rappresentante';
  const bodyDescription1 = ' Inserisci i dati del Legale Rappresentante.';
  const bodyDescription2 =
    'La persona indicata sarà firmataria del contratto per la gestione dei prodotti PagoPA.';
  return (
    <Grid
      container
      // mt={16}
      direction="column"
    >
      <Grid container item justifyContent="center">
        <Grid item xs={4}>
          <Typography variant="h3" component="h2" align="center">
            {bodyTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" component="h2" align="center" sx={{lineHeight:'1.5'}}>
            {bodyDescription1}
            <br />
            {bodyDescription2}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={7}>
        <Grid item xs={6} sx={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.06)' }}>
          <PlatformUserForm
            prefix="LEGAL"
            role="MANAGER"
            platformRole="ADMIN_REF"
            people={people}
            setPeople={setPeople}
          />
        </Grid>
      </Grid>

      <Grid item my={7}>
        <OnboardingStepActions
          back={{ action: onBackAction, label: 'Indietro', disabled: false }}
          forward={{
            action: onForwardAction,
            label: 'Conferma',
            disabled: objectIsEmpty(people) || !validateUser(people.LEGAL),
          }}
        />
      </Grid>
    </Grid>
  );
}
