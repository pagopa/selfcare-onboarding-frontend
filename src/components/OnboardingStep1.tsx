import { Grid, Link, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { IPACatalogParty, StepperStepComponentProps } from '../../types';
import { getFetchOutcome } from '../lib/error-utils';
import { fetchWithLogs } from '../lib/api-utils';
import { OnboardingStepActions } from './OnboardingStepActions';
import { AsyncAutocomplete } from './AsyncAutocomplete';
import { useHistoryState } from './useHistoryState';
import { LoadingOverlay } from './LoadingOverlay';

const handleSearchInstitutionId = async (
  institutionId: string
): Promise<IPACatalogParty | null> => {
  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_PARTY', endpointParams: { institutionId } },
    { method: 'GET' }
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    return (searchResponse as AxiosResponse).data as IPACatalogParty;
  }

  return null;
};

export function OnboardingStep1({ forward }: StepperStepComponentProps) {
  const institutionIdByQuery = new URLSearchParams(window.location.search).get('institutionId');

  const [loading, setLoading] = useState(!!institutionIdByQuery);
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
    "Seleziona dall'Indice della Pubblica Amministrazione (IPA) l'Ente per cui vuoi richiedere l'adesione ai prodotti PagoPA";

  useEffect(() => {
    if (institutionIdByQuery) {
      handleSearchInstitutionId(institutionIdByQuery)
        .then((ipaParty) => {
          if (ipaParty) {
            setSelected(ipaParty);
          } else {
            // eslint-disable-next-line functional/immutable-data
            window.location.search = '';
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // callback of previous useEffect
  useEffect(() => {
    if (institutionIdByQuery && selected) {
      onForwardAction();
    }
  }, [selected]);

  return loading ? (
    <LoadingOverlay loadingText="Stiamo verificando i tuoi dati" />
  ) : (
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
              {"Non trovi il tuo ente nell'IPA? In "}
              <Link href="https://indicepa.gov.it/ipa-portale/servizi-enti/accreditamento-ente">
                questa pagina
              </Link>
              {" trovi maggiori informazioni sull'indice e su come accreditarsi."}
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
