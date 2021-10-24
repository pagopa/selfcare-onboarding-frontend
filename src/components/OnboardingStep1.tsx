import { useState } from 'react';
import { Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Box } from '@mui/system';
import { IPACatalogParty, StepperStepComponentProps } from '../../types';
import { OnboardingStepActions } from './OnboardingStepActions';
import { AsyncAutocomplete } from './AsyncAutocomplete';
import { StyledIntro } from './StyledIntro';

export function OnboardingStep1({ forward, back }: StepperStepComponentProps) {
  const [selected, setSelected] = useState<IPACatalogParty>();
  const onForwardAction = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { digitalAddress, id } = selected!;
    forward({ institutionId: id }, digitalAddress);
  };
  return (
    <Stack spacing={10}>
      <StyledIntro>
        {{
          title: 'Seleziona il tuo Ente',
          description: (
            <>
              Seleziona dall’indice IPA l’Ente per cui vuoi richiedere l’adesione ai prodotti PagoPA
            </>
          ),
        }}
      </StyledIntro>

      <Grid container justifyContent={'center'}>
        <Grid item xs={12} md={6} lg={6}>
          <AsyncAutocomplete
            selected={selected}
            setSelected={setSelected}
            placeholder="Cerca ente nel catalogo IPA"
            endpoint={{ endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' }}
            transformFn={(data: { items: Array<IPACatalogParty> }) => data.items}
            labelKey="description"
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          fontSize: '14px',
          lineHeight: '24px',
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            lineHeight: '24px',
            textAlign: 'center',
            color: '#17324D',
          }}
        >
          Non trovi il tuo ente nell’indice IPA? <Link to="#">Clicca qui</Link> per maggiori
          informazioni e istruzioni per essere inclusi nell’indice delle Pubbliche Amministrazioni
        </Typography>
      </Box>

      <OnboardingStepActions
        back={{ action: back, label: 'Indietro', disabled: false }}
        forward={{
          action: onForwardAction,
          label: 'Conferma',
          disabled: selected === undefined,
        }}
      />
    </Stack>
  );
}
