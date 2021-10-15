import { useState } from 'react';
import { Stack } from '@mui/material';
import { StepperStepComponentProps, UserOnCreate } from '../../types';
import { objectIsEmpty } from '../lib/object-utils';
import { OnboardingStepActions } from './OnboardingStepActions';
import { StyledIntro } from './StyledIntro';
import { PlatformUserForm, validateUser } from './PlatformUserForm';

// Could be an ES6 Set but it's too bothersome for now
export type UsersObject = { [key: string]: UserOnCreate };

export function OnboardingStep2({ forward, back }: StepperStepComponentProps) {
  const [people, setPeople] = useState<UsersObject>({});

  const onForwardAction = () => {
    forward({ users: Object.values(people) });
  };

  return (
    <Stack spacing={10}>
      <StyledIntro>
        {{
          title: 'Indica il Legale Rappresentante',
          description: (
            <>
              Inserisci i dati del Legale Rappresentante.
              <br />
              La persona indicata sarà firmataria del contratto per la gestione dei prodotti PagoPA.
            </>
          ),
        }}
      </StyledIntro>
      <PlatformUserForm
        prefix="admin"
        role="Manager"
        platformRole="admin"
        people={people}
        setPeople={setPeople}
      />
      <OnboardingStepActions
        back={{ action: back, label: 'Indietro', disabled: false }}
        forward={{
          action: onForwardAction,
          label: 'Conferma',
          disabled: objectIsEmpty(people) || !validateUser(people.admin),
        }}
      />
    </Stack>
  );
}
