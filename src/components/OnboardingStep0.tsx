import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stack, Switch } from '@mui/material';
import { Box } from '@mui/system';
import { StepperStepComponentProps } from '../../types';
import { OnboardingStepActions } from './OnboardingStepActions';
import { StyledIntro } from './StyledIntro';

export function OnboardingStep0({ forward }: StepperStepComponentProps) {
  const [checked, setChecked] = useState<boolean>(false);

  const onForwardAction = () => {
    forward();
  };

  return (
    <Stack spacing={10}>
      <StyledIntro>
        {{
          title: `Benvenuto sul Portale Self-care`,
          description: (
            <>In pochi passaggi il tuo Ente potrà aderire e gestire tutti i prodotti PagoPA.</>
          ),
        }}
      </StyledIntro>
      <Box sx={{ textAlign: 'center' }}>
        <Switch checked={checked} onChange={(_, value) => setChecked(value)} />
        Ho letto e compreso{' '}
        <Link to="#">l’Informativa Privacy e i Termini e Condizioni d’Uso del servizio</Link>
      </Box>

      <OnboardingStepActions
        forward={{ action: onForwardAction, label: 'Conferma', disabled: !checked }}
      />
    </Stack>
  );
}
