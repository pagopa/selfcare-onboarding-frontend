import { Grid, Link, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { IPACatalogParty, StepperStepComponentProps } from '../../types';
import { OnboardingStepActions } from './OnboardingStepActions';
import { AsyncAutocomplete } from './AsyncAutocomplete';
import { useHistoryState } from './useHistoryState';

export function OnboardingStep1({ forward }: StepperStepComponentProps) {
  const [selected, setSelected, setSelectedHistory] = useHistoryState<IPACatalogParty | null>(
    'selected_step1',
    null
  );
  const onForwardAction = () => {
    setSelectedHistory(selected);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { id } = selected!;
    forward({ institutionId: id }, id);
  };
  const bodyTitle = 'Seleziona il tuo Ente';
  const bodyDescription =
    'Seleziona dall’indice IPA l’Ente per cui vuoi richiedere l’adesione ai prodotti PagoPA';
  return (
    <Grid
      container
      //  mt={16}
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
          <Typography variant="subtitle2" component="h2" align="center">
            {bodyDescription}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={7}>
        <Grid item xs={4} sx={{ minHeight: '180px' }}>
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

      <Grid container item justifyContent="center">
        <Grid item xs={6}>
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
                textAlign: 'center',
                color: 'text.primary',
              }}
              variant="body2"
            >
              Non trovi il tuo ente nell’indice IPA?
              <Link href="https://indicepa.gov.it/ipa-portale/servizi-enti/accreditamento-ente">
                Clicca qui
              </Link>
              per maggiori informazioni e istruzioni per essere inclusi nell’indice delle Pubbliche
              Amministrazioni
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid item mt={4}>
        <OnboardingStepActions
          // back={{action: goBackToLandingPage, label: 'Indietro', disabled: false}}
          forward={{
            action: onForwardAction,
            label: 'Conferma',
            disabled: selected === undefined || selected === null,
          }}
        />
      </Grid>
    </Grid>
  );
}
