import { Grid, Link, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useContext, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { useTranslation, Trans } from 'react-i18next';
import { IPACatalogParty, StepperStepComponentProps } from '../../types';
import { getFetchOutcome } from '../lib/error-utils';
import { fetchWithLogs } from '../lib/api-utils';
import { UserContext } from '../lib/context';
import { OnboardingStepActions } from './OnboardingStepActions';
import { useHistoryState } from './useHistoryState';
import { LoadingOverlay } from './LoadingOverlay';
import { AsyncAutocompleteV2 } from './autocomplete/AsyncAutocompleteV2';

const handleSearchInstitutionId = async (
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
  const { t } = useTranslation();
  const bodyTitle = t('onboardingStep1.onboarding.bodyTitle');

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
    <LoadingOverlay loadingText={t('onboardingStep1.loadingOverlayText')} />
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

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12}>
          <Typography
            variant="subtitle2"
            component="h2"
            align="center"
            color={theme.palette.text.primary}
          >
            <Trans i18nKey="onboardingStep1.onboarding.bodyDescription">
              Seleziona dall&apos;Indice della Pubblica Amministrazione (IPA) l&apos;ente
              <br />
              per cui vuoi richiedere l&apos;adesione a {{ productTitle: product?.title }}
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={4} mb={4}>
        <Grid item xs={8} md={6} lg={5}>
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
              <Trans i18nKey="onboardingStep1.onboarding.ipaDescription">
                Non trovi il tuo ente nell&apos;IPA? In
                <Link
                  sx={{ textDecoration: 'none', color: theme.palette.primary.main }}
                  href="https://indicepa.gov.it/ipa-portale/servizi-enti/accreditamento-ente"
                >
                  questa pagina
                </Link>
                trovi maggiori
                <br />
                informazioni sull&apos;indice e su come accreditarsi
              </Trans>
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid item mt={4}>
        <OnboardingStepActions
          // back={{action: goBackToLandingPage, label: 'Indietro', disabled: false}}
          forward={{
            action: onForwardAction,
            label: t('onboardingStep1.onboarding.onboardingStepActions.confirmAction'),
            disabled: selected === undefined || selected === null,
          }}
        />
      </Grid>
    </Grid>
  );
}
