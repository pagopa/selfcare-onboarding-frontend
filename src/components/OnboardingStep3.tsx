import { ChangeEvent, useContext, useState } from 'react';
import { Button, Checkbox, FormControlLabel, IconButton, Stack } from '@mui/material';
import cryptoRandomString from 'crypto-random-string';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { omit } from 'lodash';
import { Box } from '@mui/system';
import { objectIsEmpty } from '../lib/object-utils';
import { StepperStepComponentProps, UserOnCreate } from '../../types';
import { UserContext } from '../lib/context';
import { StyledIntro } from './StyledIntro';
import { OnboardingStepActions } from './OnboardingStepActions';
import { PlatformUserForm, validateUser } from './PlatformUserForm';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };

export function OnboardingStep3({ forward, back }: StepperStepComponentProps) {
  const { user } = useContext(UserContext);
  const [isAuthUser, setIsAuthUser] = useState(false);
  const [people, setPeople] = useState<UsersObject>({});
  const [delegateFormIds, setDelegateFormIds] = useState<Array<string>>([]);

  const addDelegateForm = () => {
    setDelegateFormIds([...delegateFormIds, cryptoRandomString({ length: 8 })]);
  };
  const buildRemoveDelegateForm = (idToRemove: string) => (_: React.SyntheticEvent) => {
    const filteredDelegateFormIds = delegateFormIds.filter((id) => id !== idToRemove);
    setDelegateFormIds(filteredDelegateFormIds);
    setPeople(omit(people, `delegate-${idToRemove}`));
  };

  const onForwardAction = () => {
    forward({ users: Object.values(people) });
  };

  const handleAuthUser = (_: ChangeEvent, value: boolean) => {
    if (value) {
      setPeople({
        ...people,
        ['delegate-initial']: Object.assign({}, user, { email: undefined }),
      });
    }
    setIsAuthUser(value);
  };

  return (
    <Stack spacing={10}>
      <StyledIntro>
        {{
          title: 'Indica il Referente Amministrativo',
          description: (
            <>
              Inserisci i dati del Legale Rappresentante o di un suo delegato.
              <br />
              La persona indicata sarà responsabile della gestione dei prodotti PagoPA.
            </>
          ),
        }}
      </StyledIntro>

      <Box sx={{ textAlign: 'center' }}>
        <FormControlLabel
          control={<Checkbox checked={isAuthUser} onChange={handleAuthUser} />}
          label="Sono io il Referente Amministrativo"
          sx={{ alignSelf: 'center' }}
        />

        <PlatformUserForm
          prefix={'delegate-initial'}
          role="Delegate"
          platformRole="admin"
          people={people}
          setPeople={setPeople}
          readOnly={isAuthUser ? ['name', 'surname', 'taxCode'] : []}
        />
      </Box>

      {delegateFormIds.map((id) => (
        <div style={{ position: 'relative' }} key={id}>
          <StyledIntro priority={3}>
            {{
              title: 'Aggiungi un nuovo Referente Amministrativo',
            }}
          </StyledIntro>
          <PlatformUserForm
            prefix={`delegate-${id}`}
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
        </div>
      ))}

      <Box sx={{ textAlign: 'center' }}>
        <Button color="primary" variant="text" onClick={addDelegateForm}>
          aggiungi nuovo delegato
        </Button>

        <OnboardingStepActions
          back={{ action: back, label: 'Indietro', disabled: false }}
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
      </Box>
    </Stack>
  );
}
