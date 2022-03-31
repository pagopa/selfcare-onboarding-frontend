import { Grid, Link, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useContext, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { IPACatalogParty, StepperStepComponentProps } from '../../../../types';
import { getFetchOutcome } from '../../../lib/error-utils';
import { fetchWithLogs } from '../../../lib/api-utils';
import { UserContext } from '../../../lib/context';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { useHistoryState } from '../../../components/useHistoryState';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { AsyncAutocompleteV2 } from '../../../components/autocomplete/AsyncAutocompleteV2';

const handleSearchInstitutionId = async (
  // TODO Fetch enti utente loggato
  institutionId: string,
  onRedirectToLogin: () => void
): Promise<IPACatalogParty | null> => {
  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_PARTY', endpointParams: { institutionId } },
    { method: 'GET' },
    onRedirectToLogin
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    return (searchResponse as AxiosResponse).data as IPACatalogParty;
  }

  return null;
};

export function OnboardingStep1({ product, forward }: StepperStepComponentProps) {
  const institutionIdByQuery = new URLSearchParams(window.location.search).get('institutionId');
  const { setRequiredLogin } = useContext(UserContext);
  const theme = useTheme();

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

  useEffect(() => {
    if (institutionIdByQuery) {
      handleSearchInstitutionId(institutionIdByQuery, () => setRequiredLogin(true))
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
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" color={theme.palette.text.primary}>
            {bodyTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={2}>
        <Grid item xs={12}>
          <Typography
            variant="subtitle2"
            component="h2"
            align="center"
            color={theme.palette.text.primary}
          >
            Seleziona dall&apos;Indice della Pubblica Amministrazione (IPA) l&apos;ente
            <br />
            per cui vuoi richiedere l&apos;adesione a {{ productTitle: product?.title }}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={7} mb={4}>
        <Grid item xs={5}>
          <AsyncAutocompleteV2
            theme={theme}
            selected={selected}
            setSelected={setSelected}
            // placeholder={t('onboardingStep1.onboarding.asyncAutocomplete.placeholder')}
            endpoint={{ endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' }}
            transformFn={(data: { items: Array<IPACatalogParty> }) => {
              // eslint-disable-next-line functional/immutable-data
              data.items.forEach((i) => (i.description = i.description.toLowerCase()));
              return data.items;
            }}
            optionKey="id"
            optionLabel="description"
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
                textAlign: 'center',
              }}
              variant="caption"
              color={theme.palette.text.primary}
            >
              Non trovi il tuo ente nell&apos;IPA? In
              <Link href="https://indicepa.gov.it/ipa-portale/servizi-enti/accreditamento-ente">
                questa pagina
              </Link>
              trovi maggiori
              <br />
              informazioni sull&apos;indice e su come accreditarsi
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid item mt={4}>
        <OnboardingStepActions
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
