import React, { ChangeEvent, useContext } from 'react';
import { Checkbox, FormControlLabel, IconButton, Link, Grid, Typography } from '@mui/material';
import cryptoRandomString from 'crypto-random-string';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { omit } from 'lodash';
// import { Box } from '@mui/system';
import { objectIsEmpty } from '../lib/object-utils';
import { StepperStepComponentProps, UserOnCreate } from '../../types';
import { UserContext } from '../lib/context';
// import { StyledIntro } from './StyledIntro';
import { OnboardingStepActions } from './OnboardingStepActions';
import { PlatformUserForm, validateUser } from './PlatformUserForm';
import { useHistoryState } from './useHistoryState';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };

export function OnboardingStep3({ forward, back }: StepperStepComponentProps) {
  const { user } = useContext(UserContext);
  const [isAuthUser, setIsAuthUser, setIsAuthUserHistory] = useHistoryState('isAuthUser', false);
  const [people, setPeople, setPeopleHistory] = useHistoryState<UsersObject>('people_step3', {});
  const [delegateFormIds, setDelegateFormIds, setDelegateFormIdsHistory] = useHistoryState<
    Array<string>
  >('delegateFormIds', []);

  const addDelegateForm = () => {
    const newId = `delegate-${cryptoRandomString({ length: 8 })}`;
    setDelegateFormIds([...delegateFormIds, newId]);
    setPeople({
      ...people,
      [newId]: {} as UserOnCreate,
    });
  };
  const buildRemoveDelegateForm = (idToRemove: string) => (_: React.SyntheticEvent) => {
    const filteredDelegateFormIds = delegateFormIds.filter((id) => id !== idToRemove);
    setDelegateFormIds(filteredDelegateFormIds);
    setPeople(omit(people, idToRemove));
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
    setIsAuthUserHistory(isAuthUser);
    setPeopleHistory(people);
    setDelegateFormIdsHistory(delegateFormIds);
  };

  const handleAuthUser = (_: ChangeEvent, value: boolean) => {
    if (value) {
      setPeople({
        ...people,
        ['delegate-initial']: Object.assign({}, user, { email: undefined }),
      });
    } else {
      setPeople({
        ...people,
        ['delegate-initial']: Object.assign({}, null, { email: undefined }),
      });
    }
    setIsAuthUser(value);
  };
  const bodyTitle = 'Indica il Referente Amministrativo';
  const bodyDescription1 = 'Inserisci i dati del Legale Rappresentante o di un suo delegato.';
  const bodyDescription2 =
    'La persona indicata sarà responsabile della gestione dei prodotti PagoPA.';
  return (
    <Grid
      container
      // mt={16}
      direction="column"
    >
      <Grid container item justifyContent="center">
        <Grid item xs={6}>
          <Typography variant="h3" component="h2" sx={{ color: '#17324D' }} align="center">
            {bodyTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" component="h2" align="center">
            {bodyDescription1}
          </Typography>
          <Typography variant="subtitle2" component="h2" align="center">
            {bodyDescription2}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={2}>
        <Grid item xs={4}>
          <FormControlLabel
            control={<Checkbox checked={isAuthUser} onChange={handleAuthUser} />}
            label="Sono io il Referente Amministrativo"
            sx={{ alignSelf: 'center' }}
          />
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={2}>
        <Grid item xs={6} sx={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.06)' }}>
          <PlatformUserForm
            prefix={'delegate-initial'}
            role="Delegate"
            platformRole="admin"
            people={people}
            setPeople={setPeople}
            readOnly={isAuthUser ? ['name', 'surname', 'taxCode'] : []}
          />
        </Grid>

        {delegateFormIds.map((id) => (
          <React.Fragment key={id}>
            {/* <StyledIntro priority={3}>
                  {{
                    title: 'Aggiungi un nuovo Referente Amministrativo',
                  }}
                </StyledIntro> */}
            <Grid item xs={10} justifyContent="center" my={5}>
              <Typography align="center" variant="h4">
                Aggiungi un nuovo Referente Amministrativo
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              sx={{ boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.06)', position: 'relative' }}
            >
              <PlatformUserForm
                prefix={id}
                role="Delegate"
                platformRole="admin"
                people={people}
                setPeople={setPeople}
              />
              <IconButton
                color="primary"
                onClick={buildRemoveDelegateForm(id)}
                style={{ position: 'absolute', top: '2px', right: '2px', zIndex: 100 }}
              >
                <ClearOutlinedIcon />
              </IconButton>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>

      {/* <Box sx={{ textAlign: 'center' }} > */}

      <Grid container item  my={4} display='flex' justifyContent="center">
      <Grid item xs={3} sx={{display: 'flex', justifyContent: 'center'}}>
        {Object.keys(people).length !== 3 && (
          <Link
            component="button"
            disabled={
              objectIsEmpty(people) ||
              Object.keys(people)
                .filter((prefix) => 'admin' !== prefix)
                .some((prefix) => !validateUser(people[prefix])) ||
              Object.keys(people).length === 3
            }
            underline="none"
            color={
              objectIsEmpty(people) ||
              Object.keys(people)
                .filter((prefix) => 'admin' !== prefix)
                .some((prefix) => !validateUser(people[prefix])) ||
              Object.keys(people).length === 3
                ? 'text.disabled'
                : 'primary'
            }
            onClick={addDelegateForm}
          >
            Aggiungi un nuovo Referente
          </Link>
        )}
      </Grid>
      </Grid>
      <OnboardingStepActions
        back={{ action: onBackAction, label: 'Indietro', disabled: false }}
        forward={{
          action: onForwardAction,
          label: 'Conferma',
          disabled:
            objectIsEmpty(people) ||
            Object.keys(people)
              .filter((prefix) => 'admin' !== prefix)
              .some((prefix) => !validateUser(people[prefix])),
        }}
      />
      {/* </Box> */}
    </Grid>
  );
}
