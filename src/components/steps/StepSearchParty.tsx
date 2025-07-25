import {
  Alert,
  AlertTitle,
  FormControlLabel,
  Grid,
  Link,
  Typography,
  useTheme,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/system';
import { SessionModal } from '@pagopa/selfcare-common-frontend/lib';
import { AxiosError, AxiosResponse } from 'axios';
import { ReactElement, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { InstitutionType, PartyData, Product, StepperStepComponentProps } from '../../../types';
import { fetchWithLogs } from '../../lib/api-utils';
import { UserContext } from '../../lib/context';
import { getFetchOutcome } from '../../lib/error-utils';
import { AooData } from '../../model/AooData';
import { UoData } from '../../model/UoModel';
import { noMandatoryIpaProducts, PRODUCT_IDS } from '../../utils/constants';
import { ENV } from '../../utils/env';
import { selected2OnboardingData } from '../../utils/selected2OnboardingData';
import { LoadingOverlay } from '../LoadingOverlay';
import { OnboardingStepActions } from '../OnboardingStepActions';
import { Autocomplete } from '../autocomplete/Autocomplete';
import { useHistoryState } from '../useHistoryState';
import Loading4Api from '../Loading4Api';

type Props = {
  subTitle: string | ReactElement;
  institutionType?: InstitutionType;
  productAvoidStep?: boolean;
  product?: Product | null;
  externalInstitutionId: string;
  subunitTypeByQuery: string;
  subunitCodeByQuery: string;
  selectFilterCategories: () => any;
} & StepperStepComponentProps;

const handleSearchExternalId = async (
  externalInstitutionId: string,
  onRedirectToLogin: () => void
): Promise<PartyData | null> => {
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
    return (searchResponse as AxiosResponse).data;
  }

  return null;
};

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
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
  selectFilterCategories,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setRequiredLogin } = useContext(UserContext);

  const partyExternalIdByQuery = new URLSearchParams(window.location.search).get('partyExternalId');
  const [isSearchFieldSelected, setIsSearchFieldSelected] = useState<boolean>(true);
  const [loading, setLoading] = useState(!!partyExternalIdByQuery);
  const [apiLoading, setApiLoading] = useState(false);
  const [selected, setSelected, setSelectedHistory] = useHistoryState<PartyData | null>(
    'selected_step1',
    null
  );
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isAggregator, setIsAggregator] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [aooResult, setAooResult, setAooResultHistory] = useHistoryState<AooData | undefined>(
    'aooSelected_step1',
    undefined
  );
  const [uoResult, setUoResult, setUoResultHistory] = useHistoryState<UoData | undefined>(
    'uoSelected_step1',
    undefined
  );
  const [merchantSearchResult, setMerchantSearchResult] = useState();
  const [ecData, setEcData] = useState<PartyData | null>(null);
  const [filterCategories, setFilterCategories] = useState<string>();
  const isEnabledProduct2AooUo = product?.id === PRODUCT_IDS.SEND;
  const [isPresentInAtecoWhiteList, setIsPresentInAtecoWhiteList] = useState<boolean>(
    product?.id === PRODUCT_IDS.IDPAY_MERCHANT ? true : false
  );
  const getECDataByCF = async (query: string) => {
    setApiLoading(true);
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_PARTY_FROM_CF', endpointParams: { id: query } },
      {
        method: 'GET',
      },
      () => setRequiredLogin(true)
    );

    const outcome = getFetchOutcome(searchResponse);

    if (outcome === 'success') {
      setEcData((searchResponse as AxiosResponse).data);
    } else if ((searchResponse as AxiosError).response?.status === 404) {
      setEcData(null);
    }
    setApiLoading(false);
  };

  const handleSearchByAooCode = async (query: string) => {
    setApiLoading(true);
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_AOO_CODE_INFO', endpointParams: { codiceUniAoo: query } },
      {
        method: 'GET',
        params: {
          ...(product?.id === PRODUCT_IDS.SEND && {
            categories: filterCategories,
            origin: 'IPA',
          }),
        },
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
    setApiLoading(false);
  };

  const handleSearchByUoCode = async (query: string) => {
    setApiLoading(true);
    const searchResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_GET_UO_CODE_INFO', endpointParams: { codiceUniUo: query } },
      {
        method: 'GET',
        params: {
          ...(product?.id === PRODUCT_IDS.SEND && {
            categories: filterCategories,
            origin: 'IPA',
          }),
        },
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
    setApiLoading(false);
  };

  useEffect(() => {
    if (isEnabledProduct2AooUo) {
      if (subunitTypeByQuery === 'UO') {
        void handleSearchByUoCode(subunitCodeByQuery);
      } else if (subunitTypeByQuery === 'AOO') {
        void handleSearchByAooCode(subunitCodeByQuery);
      }
    }
  }, [isEnabledProduct2AooUo]);

  useEffect(() => {
    if (aooResult) {
      void getECDataByCF(aooResult?.codiceFiscaleEnte);
    } else if (uoResult) {
      void getECDataByCF(uoResult?.codiceFiscaleEnte);
    }
  }, [aooResult, uoResult]);

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
        ((aooResult || uoResult) && isEnabledProduct2AooUo))
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

  useEffect(() => {
    setFilterCategories(selectFilterCategories());
  }, [selectFilterCategories]);

  useEffect(() => {
    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      if (merchantSearchResult) {
        setDisabled(!(selected && isPresentInAtecoWhiteList));
      } else {
        setDisabled(!selected);
      }
    } else {
      setDisabled(!selected);
    }
  }, [selected, isPresentInAtecoWhiteList, merchantSearchResult, product?.id]);

  const onForwardAction = () => {
    const dataParty = aooResult || uoResult ? ({ ...selected, ...ecData } as PartyData) : selected;
    setSelectedHistory(selected);
    const onboardingData = selected2OnboardingData(
      dataParty,
      isAggregator,
      institutionType,
      product?.id
    );
    forward(onboardingData, institutionType);
  };

  const onBackAction = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  const canAggregateProductList = ENV.AGGREGATOR.ELIGIBLE_PRODUCTS.split(',');

  return loading ? (
    <LoadingOverlay loadingText={t('onboardingStep1.loadingOverlayText')} />
  ) : (
    <>
      <Loading4Api open={apiLoading} />
      <Grid container direction="column">
        <Grid container item justifyContent="center">
          <Grid item xs={12}>
            <Typography
              variant="h3"
              component="h2"
              align="center"
              color={theme.palette.text.primary}
            >
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
                  Se sei tra i gestori privati di piattaforma e-procurement e hai <br /> già
                  ottenuto la
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
                <Trans
                  i18nKey="onboardingStep1.onboarding.asSubTitle"
                  values={{ productName: product?.title }}
                >
                  {`Se sei una società di assicurazione presente nell’Albo delle <br /> imprese IVASS,
                  inserisci uno dei dati richiesti e cerca l’ente per
                  <br /> cui vuoi richiedere l’adesione a <strong>{{ productName }}.</strong>`}
                </Trans>
              ) : institutionType === 'SCP' ||
                (institutionType === 'PRV' && product?.id === 'prod-interop') ? (
                <Trans
                  i18nKey="onboardingStep1.onboarding.scpSubtitle"
                  components={{ 3: <br />, 5: <strong /> }}
                  values={{ productName: product?.title }}
                >
                  {`Inserisci uno dei dati richiesti e cerca da Infocamere l’ente <br />
                  per cui vuoi richiedere l’adesione a <strong>{{ productName }}.</strong>`}
                </Trans>
              ) : product?.id === 'prod-idpay-merchant' ? (
                <Trans
                  i18nKey="onboardingStep1.onboarding.merchantSubtitle"
                  components={{ 3: <br />, 5: <strong /> }}
                  values={{ productName: product?.title }}
                >
                  {`Inserisci uno dei dati richiesti per cercare su InfoCamere l’ente <br />
                  per cui vuoi richiedere l’adesione a <strong>{{ productName }}.</strong>`}
                </Trans>
              ) : (
                subTitle
              )}
            </Typography>
          </Grid>
        </Grid>

        <Grid container item sx={{ alignItems: 'center', flexDirection: 'column' }} mt={4} mb={4}>
          {product?.id === PRODUCT_IDS.SEND && (
            <Grid container item justifyContent="center">
              <Grid item display="flex" justifyContent="center" mb={5}>
                <Alert
                  severity="info"
                  sx={{
                    width: '100%',
                    paddingRight: '56px !important',
                  }}
                >
                  <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
                    <Trans
                      i18nKey={'onboardingStep1.onboarding.disclaimer.description'}
                      components={{
                        1: <strong />,
                        3: <br />,
                        5: (
                          <a
                            href="https://docs.pagopa.it/area-riservata/area-riservata/come-aderire"
                            target="_blank"
                            rel="noreferrer"
                          />
                        ),
                      }}
                    >
                      {`Al momento possono aderire a SEND tramite Area Riservata solo le <1>Pubbliche <3>Amministrazioni Locali </1> presenti su IPA che trovi a <5>questo link</5>.`}
                    </Trans>
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          {product?.id === PRODUCT_IDS.IDPAY_MERCHANT && (
            <Grid container item justifyContent="center">
              <Grid item xs={9}>
                <Box display="flex" justifyContent="center" mb={5}>
                  {merchantSearchResult ? (
                    isPresentInAtecoWhiteList ? (
                      <Alert severity="info" sx={{ width: '100%' }}>
                        <Typography
                          sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}
                        >
                          se l&#39;esercente fa parte di una catena è la società padre a dover
                          aderire
                        </Typography>
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ width: '100%' }}>
                        <AlertTitle>Il tuo codice ATECO non è idoneo</AlertTitle>
                        <Typography
                          sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}
                        >
                          Il codice ATECO al quale sei abilitato non corrisponde con quelli idonei
                          al Bonus Elettrodomestici
                        </Typography>
                      </Alert>
                    )
                  ) : (
                    <Alert severity="info" sx={{ width: '100%' }}>
                      <Typography
                        sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}
                      >
                        se l&#39;esercente fa parte di una catena è la società padre a dover aderire
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {product?.id === PRODUCT_IDS.INTEROP && institutionType === 'GSP' && (
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
              selected={selected}
              setSelected={setSelected}
              setDisabled={setDisabled}
              setApiLoading={setApiLoading}
              apiLoading={apiLoading}
              endpoint={{ endpoint: 'ONBOARDING_GET_SEARCH_PARTIES' }}
              transformFn={(data: { items: any }) => data.items}
              optionKey="id"
              optionLabel="description"
              isSearchFieldSelected={isSearchFieldSelected}
              setIsSearchFieldSelected={setIsSearchFieldSelected}
              product={product}
              aooResult={aooResult}
              uoResult={uoResult}
              setAooResult={setAooResult}
              setUoResult={setUoResult}
              externalInstitutionId={externalInstitutionId}
              institutionType={institutionType}
              filterCategories={filterCategories}
              setIsPresentInAtecoWhiteList={setIsPresentInAtecoWhiteList}
              setMerchantSearchResult={setMerchantSearchResult}
            />
          </Grid>
          {ENV.AGGREGATOR.SHOW_AGGREGATOR &&
            institutionType === 'PA' &&
            canAggregateProductList.includes(product?.id ?? '') && (
              <Grid item mt={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="aggregator-party"
                      role="checkbox"
                      size="small"
                      onChange={() => setIsAggregator(!isAggregator)}
                    />
                  }
                  label={t('onboardingStep1.onboarding.aggregator')}
                />
              </Grid>
            )}
        </Grid>
        {institutionType !== 'SA' &&
          institutionType !== 'AS' &&
          institutionType !== 'SCP' &&
          institutionType !== 'PRV' && (
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
                    variant="body1"
                    color={theme.palette.text.secondary}
                  >
                    {institutionType === 'GSP' && noMandatoryIpaProducts(product?.id) ? (
                      <Trans
                        i18nKey="onboardingStep1.onboarding.gpsDescription"
                        components={{
                          1: <br />,
                          2: (
                            <Link
                              id="no_ipa"
                              sx={{
                                textDecoration: 'underline',
                                color: theme.palette.primary.main,
                                cursor: 'pointer',
                              }}
                              onClick={onForwardAction}
                            />
                          ),
                        }}
                      >
                        {`Non trovi il tuo ente nell'IPA?<1 /><2>Inserisci manualmente i dati del tuo ente.</2>`}
                      </Trans>
                    ) : (
                      <Trans
                        i18nKey="onboardingStep1.onboarding.ipaDescription"
                        components={{
                          1: (
                            <Link
                              sx={{
                                textDecoration: 'none',
                                color: theme.palette.primary.main,
                                cursor: 'pointer',
                              }}
                              href="https://indicepa.gov.it/ipa-portale/servizi-enti/accreditamento-ente"
                            />
                          ),
                          3: <br />,
                        }}
                      >
                        {`Non trovi il tuo ente nell'IPA? <1>In questa pagina</1> trovi maggiori <3/> informazioni sull'indice e su come accreditarsi `}
                      </Trans>
                    )}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        <Grid item mt={2}>
          <OnboardingStepActions
            back={
              !productAvoidStep && product?.id !== PRODUCT_IDS.IDPAY_MERCHANT
                ? {
                    action: onBackAction,
                    label: t('stepInstitutionType.backLabel'),
                    disabled: false,
                  }
                : undefined
            }
            forward={{
              action: () => {
                if (isAggregator) {
                  setOpen(true);
                } else {
                  onForwardAction();
                }
              },
              label: t('onboardingStep1.onboarding.onboardingStepActions.confirmAction'),
              disabled,
            }}
          />
        </Grid>
        <SessionModal
          open={open}
          title={t('onboardingStep1.onboarding.aggregatorModal.title')}
          message={
            <Trans
              i18nKey={'onboardingStep1.onboarding.aggregatorModal.message'}
              components={{ 1: <strong />, 3: <br /> }}
              values={{ partyName: selected?.description }}
            >
              {`Stai richiedendo l’adesione come ente aggregatore per <1>{{partyName}}</1>.<3 />Per completare l’adesione, dovrai indicare gli enti da aggregare.`}
            </Trans>
          }
          onCloseLabel={t('onboardingStep1.onboarding.aggregatorModal.back')}
          onConfirmLabel={t('onboardingStep1.onboarding.aggregatorModal.forward')}
          handleClose={() => setOpen(false)}
          onConfirm={onForwardAction}
        />
      </Grid>
    </>
  );
}
