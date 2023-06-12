import { Grid, Link, Typography, useTheme, Alert } from '@mui/material';
import { Box } from '@mui/system';
import { useContext, useEffect, useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useTranslation, Trans } from 'react-i18next';
import { ReactElement } from 'react';
import {
  InstitutionType,
  IPACatalogParty,
  Party,
  Product,
  StepperStepComponentProps,
} from '../../../types';
import { Autocomplete } from '../autocomplete/Autocomplete';
import { getFetchOutcome } from '../../lib/error-utils';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { useHistoryState } from '../useHistoryState';
import { LoadingOverlay } from '../LoadingOverlay';
import { AooData } from '../../model/AooData';
import { UoData } from '../../model/UoModel';

type Props = {
  subTitle: string | ReactElement;
  institutionType?: InstitutionType;
  productAvoidStep?: boolean;
  product?: Product | null;
  externalInstitutionId: string;
} & StepperStepComponentProps;

const handleSearchExternalId = async (
  externalInstitutionId: string,
  onRedirectToLogin: () => void
): Promise<IPACatalogParty | null> => {
  const searchResponse = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_PARTY',
      endpointParams: { externalInstitutionId },
    },
    { method: 'GET' },
    onRedirectToLogin
  );

  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    return (searchResponse as AxiosResponse).data as IPACatalogParty;
  }

  return null;
};
// TODO remove cognitive-complexity
// eslint-disable-next-line sonarjs/cognitive-complexity
export function StepSearchParty({
  subTitle,
  forward,
  back,
  institutionType,
  productAvoidStep,
  product,
  externalInstitutionId,
}: Props) {
  const partyExternalIdByQuery = new URLSearchParams(window.location.search).get('partyExternalId');
  const { setRequiredLogin } = useContext(UserContext);
  const theme = useTheme();

  const [aooResult, setAooResult, setAooResultHistory] = useHistoryState<AooData | undefined>(
    'aooSelected_step1',
    undefined
  );
  const [uoResult, setUoResult, setUoResultHistory] = useHistoryState<UoData | undefined>(
    'uoSelected_step1',
    undefined
  );

  const [isSearchFieldSelected, setIsSearchFieldSelected] = useState<boolean>(true);

  const [loading, setLoading] = useState(!!partyExternalIdByQuery);
  const [selected, setSelected, setSelectedHistory] = useHistoryState<IPACatalogParty | null>(
    'selected_step1',
    null
  );
  const [dataFromAooUo, setDataFromAooUo] = useState<IPACatalogParty | null>();

  const handleSearchTaxCodeFromAooUo = async (query: string) => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
      {
        method: 'GET',
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setDataFromAooUo((searchResponse as AxiosResponse).data);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setDataFromAooUo(undefined);
    }
  };

  useEffect(() => {
    if (aooResult) {
      void handleSearchTaxCodeFromAooUo(aooResult?.codiceFiscaleEnte);
    } else if (uoResult) {
      void handleSearchTaxCodeFromAooUo(uoResult?.codiceFiscaleEnte);
    }
  }, [aooResult, uoResult]);

  const onForwardAction = () => {
    setAooResultHistory(aooResult);
    setUoResultHistory(uoResult);
    setSelectedHistory(selected);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { id } = selected!;
    forward(
      {
        externalId: dataFromAooUo ? dataFromAooUo.id : id,
      },
      aooResult || uoResult
        ? ({ ...dataFromAooUo } as Party)
        : ({ ...selected, externalId: id } as Party),
      aooResult,
      uoResult,
      institutionType
    );
  };

  const { t } = useTranslation();
  const onBackAction = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  useEffect(() => {
    if (partyExternalIdByQuery) {
      handleSearchExternalId(partyExternalIdByQuery, () => setRequiredLogin(true))
        .then((ipaParty) => {
          if (ipaParty) {
            setSelected(ipaParty);
          } else {
            // eslint-disable-next-line functional/immutable-data
            window.location.search = '';
          }
        })
        .catch((reason) => {
          // eslint-disable-next-line functional/immutable-data
          window.location.search = '';
          console.error(reason);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // callback of previous useEffect
  useEffect(() => {
    if (partyExternalIdByQuery && selected) {
      onForwardAction();
    }
  }, [selected]);

  useEffect(() => {
    if (isSearchFieldSelected || selected) {
      setIsSearchFieldSelected(true);
    } else {
      setIsSearchFieldSelected(false);
    }
  }, [isSearchFieldSelected]);

  return loading ? (
    <LoadingOverlay loadingText={t('onboardingStep1.loadingOverlayText')} />
  ) : (
    <Grid container direction="column">
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" color={theme.palette.text.primary}>
            {selected
              ? t('onboardingStep1.onboarding.codyTitleSelected')
              : t('onboardingStep1.onboarding.bodyTitle')}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12}>
          <Typography variant="body1" align="center" color={theme.palette.text.primary}>
            {selected
              ? `Prosegui con l’adesione a ${product?.title} per l’ente selezionato`
              : subTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={4} mb={4}>
        {product?.id === 'prod-pn' && (
          <Grid container item justifyContent="center">
            <Grid item xs={10}>
              <Box display="flex" justifyContent="center" mb={5}>
                <Alert severity="warning" sx={{ width: '100%' }}>
                  <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
                    Al momento possono aderire a Piattaforma Notifiche le
                    <strong> Pubbliche Amministrazioni Locali </strong> presenti in IPA come{' '}
                    <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L45">
                      Città Metropolitane
                    </a>
                    ,{' '}
                    <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L6">
                      Comuni e loro Consorzi e Associazioni
                    </a>{' '}
                    e{' '}
                    <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L4">
                      Regioni, Province Autonome e loro Consorzi e Associazioni
                    </a>
                  </Typography>
                </Alert>
              </Box>
            </Grid>
          </Grid>
        )}

        {product?.id === 'prod-interop' && institutionType === 'GSP' && (
          <Grid container item justifyContent="center">
            <Grid item xs={9}>
              <Box display="flex" justifyContent="center" mb={5}>
                <Alert severity="info" sx={{ width: '100%' }}>
                  <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
                    Al momento i Gestori di Pubblico Servizio possono aderire solo se presenti in
                    IPA, come indicato nelle{' '}
                    <a href="https://trasparenza.agid.gov.it/moduli/downloadFile.php?file=oggetto_allegati/213481832030O__O20211210_LG+Infrastruttura+Interoperabilit%26%23224%3B+PDND_v1_allegato+1.pdf">
                      {' '}
                      linee guida AGID
                    </a>{' '}
                  </Typography>
                </Alert>
              </Box>
            </Grid>
          </Grid>
        )}

        <Grid item xs={8} md={6} lg={5}>
          <Autocomplete
            theme={theme}
            selected={selected}
            setSelected={setSelected}
            endpoint={{ endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' }}
            transformFn={(data: { items: Array<IPACatalogParty> }) =>
              /* removed transformation into lower case in order to send data to BE as obtained from registry
                  // eslint-disable-next-line functional/immutable-data
                  data.items.forEach((i) => (i.description = i.description.toLowerCase()));
                  */
              data.items
            }
            optionKey="id"
            optionLabel="description"
            isSearchFieldSelected={isSearchFieldSelected}
            setIsSearchFieldSelected={setIsSearchFieldSelected}
            product={product}
            aooResult={aooResult}
            uoResult={uoResult}
            setAooResult={setAooResult}
            setUoResult={setUoResult}
            setUoResultHistory={setUoResultHistory}
            setAooResultHistory={setAooResultHistory}
            externalInstitutionId={externalInstitutionId}
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
          back={
            !productAvoidStep
              ? {
                  action: onBackAction,
                  label: t('stepInstitutionType.backLabel'),
                  disabled: false,
                }
              : undefined
          }
          forward={{
            action: onForwardAction,
            label: t('onboardingStep1.onboarding.onboardingStepActions.confirmAction'),
            disabled: !selected,
          }}
        />
      </Grid>
    </Grid>
  );
}
