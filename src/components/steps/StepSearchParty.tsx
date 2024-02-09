import { Alert, Grid, Link, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { AxiosError, AxiosResponse } from 'axios';
import { ReactElement, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  IPACatalogParty,
  InstitutionType,
  Party,
  Product,
  StepperStepComponentProps,
} from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { getFetchOutcome } from '../../lib/error-utils';
import { AooData } from '../../model/AooData';
import { UoData } from '../../model/UoModel';
import { LoadingOverlay } from '../LoadingOverlay';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { Autocomplete } from '../autocomplete/Autocomplete';
import { useHistoryState } from '../useHistoryState';

type Props = {
  subTitle: string | ReactElement;
  institutionType?: InstitutionType;
  productAvoidStep?: boolean;
  product?: Product | null;
  externalInstitutionId: string;
  subunitTypeByQuery: string;
  subunitCodeByQuery: string;
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
  subunitTypeByQuery,
  subunitCodeByQuery,
}: Props) {
  const partyExternalIdByQuery = new URLSearchParams(window.location.search).get('partyExternalId');

  const { setRequiredLogin } = useContext(UserContext);
  const theme = useTheme();

  const productAllowed = product?.id === 'prod-pn';
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
  const prodPn = product?.id === 'prod-pn';
  const handleSearchByAooCode = async (query: string) => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_AOO_CODE_INFO', endpointParams: { codiceUniAoo: query } },
      {
        method: 'GET',
        params: { ...(prodPn && { categories: 'L6,L4,L45,L35,L5,L17', origin: 'IPA' }) },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setAooResult((searchResponse as AxiosResponse).data);
      setAooResultHistory((searchResponse as AxiosResponse).data);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setAooResult(undefined);
    }
  };
  const handleSearchByUoCode = async (query: string) => {
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_UO_CODE_INFO', endpointParams: { codiceUniUo: query } },
      {
        method: 'GET',
        params: { ...(prodPn && { categories: 'L6,L4,L45,L35,L5,L17', origin: 'IPA' }) },
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setUoResult((searchResponse as AxiosResponse).data);
      setUoResultHistory((searchResponse as AxiosResponse).data);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setUoResult(undefined);
    }
  };

  useEffect(() => {
    if (productAllowed) {
      if (subunitTypeByQuery === 'UO') {
        void handleSearchByUoCode(subunitCodeByQuery);
      } else if (subunitTypeByQuery === 'AOO') {
        void handleSearchByAooCode(subunitCodeByQuery);
      }
    }
  }, [productAllowed]);

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
    if (
      selected &&
      partyExternalIdByQuery &&
      ((subunitCodeByQuery === '' && subunitTypeByQuery === '') ||
        ((aooResult || uoResult) && productAllowed))
    ) {
      onForwardAction();
    }
  }, [selected, aooResult, uoResult]);

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
            {selected ? (
              <Trans
                i18nKey="onboardingStep1.onboarding.selectedInstitution"
                values={{ productName: product?.title }}
                components={{ 1: <strong /> }}
              >
                {`Prosegui con l’adesione a <strong>{{ productName }}</strong> per l’ente selezionato`}
              </Trans>
            ) : institutionType === 'SA' ? (
              <Trans i18nKey="onboardingStep1.onboarding.saSubTitle">
                Se sei tra i gestori privati di piattaforma e-procurement e hai <br /> già ottenuto
                la
                <Link
                  sx={{
                    color: theme.palette.text.primary,
                    textDecorationColor: theme.palette.text.primary,
                  }}
                  href="https://www.agid.gov.it/it/piattaforme/procurement/certificazione-componenti-piattaforme"
                  target="_blank"
                >
                  certificazione da AgID
                </Link>
                , inserisci uno dei dati
                <br /> richiesti e cerca l’ente per cui vuoi richiedere l’adesione a <br />
                <strong>Interoperabilità.</strong>
              </Trans>
            ) : institutionType === 'AS' ? (
              <Trans i18nKey="onboardingStep1.onboarding.asSubTitle">
                Se sei una società di assicurazione presente nell’Albo delle <br /> imprese IVASS,
                inserisci uno dei dati richiesti e cerca l’ente per
                <br /> cui vuoi richiedere l’adesione a <strong>Interoperabilità.</strong>
              </Trans>
            ) : (
              subTitle
            )}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={4} mb={4}>
        {product?.id === 'prod-pn' && (
          <Grid container item justifyContent="center">
            <Grid item display="flex" justifyContent="center" mb={5}>
              <Alert
                severity="warning"
                sx={{
                  width: '100%',
                  paddingRight: '56px !important',
                  paddingBottom: '0px !important',
                }}
              >
                <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
                  <Trans
                    i18nKey={'onboardingStep1.onboarding.disclaimer.description'}
                    components={{
                      1: <strong />,
                      3: (
                        <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L45" />
                      ),
                      5: <br />,
                      6: (
                        <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L6" />
                      ),
                      8: (
                        <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L4" />
                      ),
                      9: (
                        <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L35" />
                      ),
                      10: (
                        <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L5" />
                      ),
                      11: (
                        <a href="https://www.indicepa.gov.it/ipa-portale/consultazione/indirizzo-sede/ricerca-ente?categoria=L17" />
                      ),
                      12: (
                        <ul
                          style={{
                            listStyleType: 'square',
                            paddingLeft: '28px',
                          }}
                        />
                      ),
                      13: <li />,
                    }}
                  >
                    {`Al momento possono aderire a SEND tramite Area Riservata solo le seguenti <1>Pubbliche <5 />Amministrazioni Locali</1> presenti in IPA: <5 /><12><13><3>Città Metropolitane</3></13><13><6>Comuni e loro Consorzi e Associazioni</6></13><13><8>Regioni, Province Autonome e loro Consorzi e Associazioni</8></13><13><9>Camere di Commercio, Industria, Artigianato e Agricoltura e loro Unioni Regionali</9></13><13><10>Province</10></13><13><11>Università</11></13></12>`}
                  </Trans>
                </Typography>
              </Alert>
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
            institutionType={institutionType}
          />
        </Grid>
      </Grid>
      {institutionType !== 'SA' && institutionType !== 'AS' && (
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
      )}
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
