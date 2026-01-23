import { Alert, FormControlLabel, Grid, Link, Typography, useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/system';
import { SessionModal } from '@pagopa/selfcare-common-frontend/lib';
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { InstitutionType, PartyData, Product, StepperStepComponentProps } from '../../../types';
import { useHistoryState } from '../../hooks/useHistoryState';
import { UserContext } from '../../lib/context';
import { AooData } from '../../model/AooData';
import { SelectionsState } from '../../model/Selection';
import { UoData } from '../../model/UoModel';
import {
  getECDataByCF,
  handleSearchByAooCode,
  handleSearchByUoCode,
  handleSearchExternalId,
} from '../../services/institutionServices';
import { noMandatoryIpaProducts, PRODUCT_IDS } from '../../utils/constants';
import { ENV } from '../../utils/env';
import { selected2OnboardingData } from '../../utils/selected2OnboardingData';
import { Autocomplete } from '../autocomplete/Autocomplete';
import Loading4Api from '../modals/Loading4Api';
import { LoadingOverlay } from '../modals/LoadingOverlay';
import { OnboardingStepActions } from '../registrationSteps/OnboardingStepActions';
import {
  isContractingAuthority,
  isGlobalServiceProvider,
  isInsuranceCompany,
  isInteropProduct,
  isPrivateInstitution,
  isPrivatePersonInstitution,
  isPublicAdministration,
  isPublicServiceCompany,
} from '../../utils/institutionTypeUtils';

type Props = {
  subTitle: string | ReactElement;
  institutionType?: InstitutionType;
  productAvoidStep?: boolean;
  product?: Product | null;
  externalInstitutionId: string;
  subunitTypeByQuery: string;
  subunitCodeByQuery: string;
  selectFilterCategories: () => any;
  setInstitutionType: Dispatch<SetStateAction<InstitutionType | undefined>>;
  addUser: boolean;
} & StepperStepComponentProps;

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
  setInstitutionType,
  addUser,
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

  const [merchantSearchResult, setMerchantSearchResultState] = useState<any>(() => {
    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      try {
        const stored = sessionStorage.getItem('merchantSearchResult');
        return stored ? JSON.parse(stored) : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  const setMerchantSearchResult = (value: any) => {
    setMerchantSearchResultState(value);
    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      if (value === undefined) {
        sessionStorage.removeItem('merchantSearchResult');
      } else {
        sessionStorage.setItem('merchantSearchResult', JSON.stringify(value));
      }
    }
  };

  const [ecData, setEcData] = useState<PartyData | null>(null);
  const [filterCategories, setFilterCategories] = useState<string>();
  const isEnabledProduct2AooUo = product?.id === PRODUCT_IDS.SEND;

  const [isPresentInAtecoWhiteList, setIsPresentInAtecoWhiteListState] = useState<boolean>(() => {
    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      try {
        const stored = sessionStorage.getItem('isPresentInAtecoWhiteList');
        return stored !== null ? JSON.parse(stored) : true;
      } catch {
        return true;
      }
    }
    return false;
  });

  const setIsPresentInAtecoWhiteList = (value: boolean) => {
    setIsPresentInAtecoWhiteListState(value);
    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      sessionStorage.setItem('isPresentInAtecoWhiteList', JSON.stringify(value));
    }
  };

  const disabledStatusCompany = useMemo(
    () =>
      merchantSearchResult?.statusCompanyRI !== undefined ||
      merchantSearchResult?.disabledStateInstitution !== undefined ||
      merchantSearchResult?.descriptionStateInstitution !== undefined ||
      merchantSearchResult?.statusCompanyRD !== undefined,
    [merchantSearchResult]
  );

  const [selections, setSelections] = useState<SelectionsState>({
    businessName: true,
    aooCode: false,
    uoCode: false,
    reaCode: false,
    personalTaxCode: false,
    taxCode: false,
    ivassCode: false,
  });

  useEffect(() => {
    if (isEnabledProduct2AooUo) {
      if (subunitTypeByQuery === 'UO') {
        void handleSearchByUoCode(
          subunitCodeByQuery,
          setUoResult,
          setUoResultHistory,
          setRequiredLogin,
          setApiLoading,
          false,
          'ONBOARDING_GET_UO_CODE_INFO',
          {},
          filterCategories,
          product?.id
        );
      } else if (subunitTypeByQuery === 'AOO') {
        void handleSearchByAooCode(
          subunitCodeByQuery,
          setAooResult,
          setAooResultHistory,
          setRequiredLogin,
          setApiLoading,
          false,
          'ONBOARDING_GET_AOO_CODE_INFO',
          {},
          filterCategories,
          product?.id
        );
      }
    }
  }, [isEnabledProduct2AooUo]);

  useEffect(() => {
    if (aooResult) {
      void getECDataByCF(aooResult?.codiceFiscaleEnte, setApiLoading, setEcData, setRequiredLogin);
    } else if (uoResult) {
      void getECDataByCF(uoResult?.codiceFiscaleEnte, setApiLoading, setEcData, setRequiredLogin);
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
        if (disabledStatusCompany) {
          setDisabled(true);
        } else {
          setDisabled(!(selected && isPresentInAtecoWhiteList));
        }
      } else {
        setDisabled(!selected);
      }
    } else {
      setDisabled(!selected);
    }
  }, [
    selected,
    isPresentInAtecoWhiteList,
    merchantSearchResult,
    product?.id,
    disabledStatusCompany,
  ]);

  const onForwardAction = () => {
    const dataParty = aooResult || uoResult ? ({ ...selected, ...ecData } as PartyData) : selected;
    const actualInstitutionType =
      product?.id === PRODUCT_IDS.IDPAY_MERCHANT &&
      (selections.personalTaxCode ||
        (selections.reaCode && dataParty?.businessTaxId && dataParty.businessTaxId.length > 11))
        ? 'PRV_PF'
        : institutionType;
    setSelectedHistory(selected);
    const onboardingData = selected2OnboardingData(
      dataParty,
      isAggregator,
      actualInstitutionType,
      product?.id
    );

    if (actualInstitutionType !== institutionType) {
      setInstitutionType(actualInstitutionType);
    }

    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      sessionStorage.removeItem('merchantSearchResult');
      sessionStorage.removeItem('isPresentInAtecoWhiteList');
    }

    forward(onboardingData, actualInstitutionType);
  };

  const onBackAction = () => {
    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      sessionStorage.removeItem('merchantSearchResult');
      sessionStorage.removeItem('isPresentInAtecoWhiteList');
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  useEffect(
    () => () => {
      if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
        const shouldClean = !sessionStorage.getItem('onboarding_forward');
        if (shouldClean) {
          sessionStorage.removeItem('merchantSearchResult');
          sessionStorage.removeItem('isPresentInAtecoWhiteList');
        }
      }
    },
    [product?.id]
  );

  useEffect(() => {
    if (product?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      const storedMerchant = sessionStorage.getItem('merchantSearchResult');

      if (selected && !storedMerchant && merchantSearchResult) {
        setMerchantSearchResult(undefined);
        setIsPresentInAtecoWhiteList(true);
        setDisabled(true);
      }
    }
  }, [selected, product?.id]);

  const canAggregateProductList = ENV.AGGREGATOR.ELIGIBLE_PRODUCTS.split(',');

  const alertMerchantAtecoNotValid = () => (
    <Alert severity="error" sx={{ width: '100%' }}>
      <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
        {t('onboardingStep1.onboarding.merchantAtecoNotValid')}
      </Typography>
    </Alert>
  );

  const alertMerchantAtecoValid = () => (
    <Alert severity="info" sx={{ width: '100%' }}>
      <Typography sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}>
        {t('onboardingStep1.onboarding.merchantAtecoValid')}
      </Typography>
    </Alert>
  );

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
                  {`Prosegui con l’adesione a <strong>{{productName}}</strong> per l’ente selezionato`}
                </Trans>
              ) : isContractingAuthority(institutionType) ? (
                <Trans
                  i18nKey="onboardingStep1.onboarding.saSubTitle"
                  values={{
                    productName: product?.title,
                  }}
                  components={{ 1: <br />, 3: <Link />, 5: <strong /> }}
                >
                  {`Se sei tra i gestori privati di piattaforma e-procurement e hai <1 /> già
                  ottenuto la <3> ${(
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
                  )} <3 />, inserisci uno dei dati <1 />
                  richiesti e cerca l’ente per cui vuoi richiedere l’adesione a <1 />
                  <5>{{ productName }}</5>
                `}
                </Trans>
              ) : isInsuranceCompany(institutionType) ? (
                <Trans
                  i18nKey="onboardingStep1.onboarding.asSubTitle"
                  values={{ productName: product?.title }}
                  components={{ 1: <br />, 3: <strong /> }}
                >
                  {`Se sei una società di assicurazione presente nell’Albo delle <1 /> imprese IVASS,
                  inserisci uno dei dati richiesti e cerca l’ente per
                  <1 /> cui vuoi richiedere l’adesione a <3>{{ productName }}.</3>`}
                </Trans>
              ) : isPublicServiceCompany(institutionType) ||
                (isPrivateInstitution(institutionType) && isInteropProduct(product?.id)) ? (
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
              <Grid item xs={8}>
                <Box display="flex" justifyContent="center" mb={5}>
                  {merchantSearchResult ? (
                    disabledStatusCompany ? (
                      <Alert severity="error" sx={{ width: '100%' }}>
                        <Typography
                          sx={{ fontSize: '16px', a: { color: theme.palette.text.primary } }}
                        >
                          {t('onboardingStep1.onboarding.merchantCompanyStatusDisabled')}
                        </Typography>
                      </Alert>
                    ) : isPresentInAtecoWhiteList ? (
                      alertMerchantAtecoValid()
                    ) : (
                      alertMerchantAtecoNotValid()
                    )
                  ) : (
                    alertMerchantAtecoValid()
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {isInteropProduct(product?.id) && isGlobalServiceProvider(institutionType) && (
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
              disabledStatusCompany={disabledStatusCompany}
              selections={selections}
              setSelections={setSelections}
              addUser={addUser}
            />
          </Grid>
          {ENV.AGGREGATOR.SHOW_AGGREGATOR &&
            isPublicAdministration(institutionType) &&
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
        {!isContractingAuthority(institutionType) &&
          !isInsuranceCompany(institutionType) &&
          !isPublicServiceCompany(institutionType) &&
          !isPrivateInstitution(institutionType) &&
          !isPrivatePersonInstitution(institutionType) && (
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
                    {isGlobalServiceProvider(institutionType) &&
                    noMandatoryIpaProducts(product?.id) ? (
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
