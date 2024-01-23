import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Grid } from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import { uniqueId } from 'lodash';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { withLogin } from '../../components/withLogin';
import { AooData } from '../../model/AooData';
import { UoData } from '../../model/UoModel';
import {
  InstitutionType,
  Product,
  RequestOutcomeOptions,
  Party,
  StepperStep,
  UserOnCreate,
  Problem,
  RequestOutcomeMessage,
} from '../../../types';
import { StepSearchParty } from '../../components/steps/StepSearchParty';
import { StepAddManager } from '../../components/steps/StepAddManager';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { MessageNoAction } from '../../components/MessageNoAction';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { ENV } from '../../utils/env';
import { HeaderContext, UserContext } from '../../lib/context';
import { billingData2billingDataRequest } from '../../model/BillingData';
import { pspData2pspDataRequest } from '../../model/PspData';
import NoProductPage from '../NoProductPage';
import {
  GeographicTaxonomy,
  onboardedInstitutionInfo2geographicTaxonomy,
} from '../../model/GeographicTaxonomies';
import { companyInformationsDto2pspDataRequest } from '../../model/CompanyInformations';
import { assistanceConcatsDto2pspDataRequest } from '../../model/AssistanceContacts';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepOnboardingFormData from '../../components/steps/StepOnboardingFormData';
import { registerUnloadEvent, unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import StepInstitutionType from '../../components/steps/StepInstitutionType';
import UserNotAllowedPage from '../UserNotAllowedPage';
import { AdditionalData, AdditionalInformations } from '../../model/AdditionalInformations';
import { genericError, OnboardingStep1_5 } from './components/OnboardingStep1_5';
import { OnBoardingProductStepDelegates } from './components/OnBoardingProductStepDelegates';
import { StepAdditionalInformations } from './components/StepAdditionalInformations';

export type ValidateErrorType = 'conflictError';

export const prodPhaseOutErrorPage: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <EndingPage
        icon={<IllusError size={60} />}
        title={<Trans i18nKey="onboarding.phaseOutError.title" />}
        description={
          <Trans i18nKey="onboarding.phaseOutError.description">
            Non puoi aderire al prodotto scelto poiché a breve non sarà
            <br />
            più disponibile.
          </Trans>
        }
        variantTitle={'h4'}
        buttonLabel={<Trans i18nKey="onboarding.phaseOutError.backAction" />}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function OnboardingComponent({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [externalInstitutionId, setExternalInstitutionId] = useState<string>('');
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const history = useHistory();
  const [openExitModal, setOpenExitModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();
  const [onboardingFormData, setOnboardingFormData] = useState<OnboardingFormData>();
  const [additionalInformations, setAdditionalInformations] = useState<AdditionalInformations>();
  const [institutionType, setInstitutionType] = useState<InstitutionType>();
  const [origin, setOrigin] = useState<string>();
  const [pricingPlan, setPricingPlan] = useState<string>();
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();
  const [onExitAction, setOnExitAction] = useState<(() => void) | undefined>();
  const [selectedParty, setSelectedParty] = useState<Party>();

  const [aooSelected, setAooSelected] = useState<AooData>();
  const [uoSelected, setUoSelected] = useState<UoData>();

  const productAvoidStep =
    selectedProduct?.id === 'prod-pn' || selectedProduct?.id === 'prod-idpay';

  const fromDashboard =
    window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1;

  const subunitTypeByQuery =
    new URLSearchParams(window.location.hash.substr(1)).get('subunitType') ?? '';
  const subunitCodeByQuery =
    new URLSearchParams(window.location.hash.substr(1)).get('subunitCode') ?? '';

  const isTechPartner = institutionType === 'PT';

  const alreadyOnboarded: RequestOutcomeMessage = {
    title: '',
    description: isTechPartner
      ? [
          <Grid key="0">
            <EndingPage
              minHeight="52vh"
              variantTitle={'h4'}
              variantDescription={'body1'}
              icon={<IllusError size={60} />}
              title={<Trans i18nKey="onboardingStep1_5.ptAlreadyOnboarded.title" />}
              description={
                <Trans i18nKey="onboardingStep1_5.ptAlreadyOnboarded.description">
                  Per operare su un prodotto, chiedi a un Amministratore di <br /> aggiungerti nella
                  sezione Utenti.
                </Trans>
              }
              buttonLabel={<Trans i18nKey="onboardingStep1_5.ptAlreadyOnboarded.backAction" />}
              onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            />
          </Grid>,
        ]
      : [
          <Grid key="0">
            <EndingPage
              minHeight="52vh"
              variantTitle={'h4'}
              variantDescription={'body1'}
              title={<Trans i18nKey="onboardingStep1_5.alreadyOnboarded.title" />}
              description={<Trans i18nKey="onboardingStep1_5.alreadyOnboarded.description" />}
              buttonLabel={<Trans i18nKey="onboardingStep1_5.alreadyOnboarded.backAction" />}
              onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            />
          </Grid>,
        ],
  };

  useEffect(() => {
    if (
      selectedProduct &&
      selectedProduct?.id !== 'prod-pn' &&
      (subunitTypeByQuery || subunitCodeByQuery)
    ) {
      window.location.assign(ENV.URL_FE.DASHBOARD);
    }
  }, [selectedProduct, aooSelected, uoSelected]);

  useEffect(() => {
    registerUnloadEvent(setOnExit, setOpenExitModal, setOnExitAction);
    return () => unregisterUnloadEvent(setOnExit);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    Object.assign(history.location, { state: undefined });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = uniqueId(`onboarding-${externalInstitutionId}-${productId}-`);
    void checkProductId().finally(() => {
      setLoading(false);
    });
    setPricingPlan(new URLSearchParams(window.location.search).get('pricingPlan') ?? undefined);
  }, [productId]);

  useEffect(() => {
    if (institutionType && (institutionType === 'PSP' || institutionType !== 'PA')) {
      setOrigin(undefined);
    }
  }, [institutionType]);

  // avoid step 1 if selectedProduct is 'prod-pn' or 'prod-idpay'
  useEffect(() => {
    if (productAvoidStep) {
      forwardWithInstitutionType('PA');
    }
  }, [selectedProduct]);

  const checkProductId = async () => {
    const onboardingProducts = await fetchWithLogs(
      { endpoint: 'ONBOARDING_VERIFY_PRODUCT', endpointParams: { productId } },
      { method: 'GET' },
      () => setRequiredLogin(true)
    );
    const result = getFetchOutcome(onboardingProducts);
    if (result === 'success') {
      const product = (onboardingProducts as AxiosResponse).data;
      setSelectedProduct(product);
    } else if ((onboardingProducts as AxiosError).response?.status === 404) {
      unregisterUnloadEvent(setOnExit);
      setSelectedProduct(null);
    } else {
      console.error('Unexpected response', (onboardingProducts as AxiosError).response);
      unregisterUnloadEvent(setOnExit);
      setSelectedProduct(null);
    }

    if ((onboardingProducts as AxiosResponse).data?.status === 'PHASE_OUT') {
      setOutcome(prodPhaseOutErrorPage);
    }
  };

  const back = () => {
    setActiveStep(activeStep - 1);
  };

  const forward = () => {
    setActiveStep(activeStep + 1);
  };

  const forwardWithData = (newFormData: Partial<FormData>) => {
    if (formData) {
      setFormData({ ...formData, ...newFormData });
    } else {
      setFormData(newFormData);
    }
    forward();
  };

  const forwardWithDataAndInstitution = (
    newFormData: Partial<FormData>,
    party: Party,
    aooResult: AooData,
    uoResult: UoData,
    institutionType: InstitutionType
  ) => {
    setAooSelected(aooResult);
    setUoSelected(uoResult);
    setExternalInstitutionId(
      aooResult
        ? aooResult?.codiceFiscaleEnte
        : uoResult
        ? uoResult.codiceFiscaleEnte
        : party.externalId
    );
    setOrigin(party.origin);
    setOnboardingFormData({
      businessName: aooResult
        ? aooResult?.denominazioneAoo
        : uoResult
        ? uoResult.descrizioneUo
        : party.description,
      aooName: aooResult?.denominazioneAoo,
      uoName: uoResult?.descrizioneUo,
      aooUniqueCode: aooResult?.codiceUniAoo,
      uoUniqueCode: uoResult?.codiceUniUo,
      digitalAddress:
        aooResult && aooResult.tipoMail1 === 'Pec'
          ? aooResult.mail1
          : uoResult && uoResult.tipoMail1 === 'Pec'
          ? uoResult.mail1
          : party.digitalAddress,
      recipientCode:
        aooResult && aooResult.codiceUniAoo
          ? aooResult.codiceUniAoo
          : uoResult && uoResult.codiceUniUo
          ? uoResult.codiceUniUo
          : undefined,
      registeredOffice: aooResult
        ? aooResult.indirizzo
        : uoResult
        ? uoResult.indirizzo
        : party.address,
      taxCode: aooResult
        ? aooResult.codiceFiscaleEnte
        : uoResult
        ? uoResult.codiceFiscaleEnte
        : party.taxCode,
      vatNumber: '',
      zipCode: aooResult ? aooResult.CAP : uoResult ? uoResult.CAP : party.zipCode,
      geographicTaxonomies: onboardingFormData?.geographicTaxonomies as Array<GeographicTaxonomy>,
      ivassCode: institutionType === 'AS' ? party.originId : undefined,
    });
    forwardWithData(newFormData);
    trackEvent('ONBOARDING_PARTY_SELECTION', {
      party_id: party.externalId,
      request_id: requestIdRef.current,
      product_id: productId,
    });
    setSelectedParty(party);
    setInstitutionType(institutionType);
  };

  const forwardWithBillingData = (newOnboardingFormData: OnboardingFormData) => {
    trackEvent('ONBOARDING_BILLING_DATA', {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
      geographic_taxonomies: newOnboardingFormData.geographicTaxonomies,
    });

    setOnboardingFormData(newOnboardingFormData);
    if (institutionType !== 'PA') {
      // TODO: fix when party registry proxy will return externalInstitutionId
      setExternalInstitutionId(newOnboardingFormData.taxCode);

      const partyVerifyOnboarded = async () => {
        const onboardingStatus = await fetchWithLogs(
          {
            endpoint: 'VERIFY_ONBOARDING',
          },
          {
            method: 'HEAD',
            params: {
              taxCode: newOnboardingFormData.taxCode,
              productId,
              subunitCode: aooSelected
                ? aooSelected.codiceUniAoo
                : uoSelected
                ? uoSelected.codiceUniUo
                : undefined,
            },
          },
          () => setRequiredLogin(true)
        );
        const restOutcome = getFetchOutcome(onboardingStatus);
        // party is already onboarded
        if (restOutcome === 'success') {
          setOutcome(alreadyOnboarded);
        } else {
          // party is NOT already onboarded
          if (
            (onboardingStatus as AxiosError<any>).response?.status === 404 ||
            (onboardingStatus as AxiosError<any>).response?.status === 400
          ) {
            setOutcome(null);
            if (isTechPartner) {
              setActiveStep(activeStep + 3);
            } else if (productId === 'prod-pagopa' && institutionType === 'GSP') {
              forward();
            } else {
              setActiveStep(activeStep + 2);
            }
          } else if ((onboardingStatus as AxiosError<any>).response?.status === 403) {
            setOutcome(notAllowedError);
          } else {
            setOutcome(genericError);
          }
        }
      };
      void partyVerifyOnboarded();
    } else {
      setActiveStep(activeStep + 2);
    }
  };

  const forwardWithAdditionalGSPInfo = (newAdditionalInformations: {
    [key: string]: AdditionalData;
  }) => {
    setAdditionalInformations({
      agentOfPublicService: newAdditionalInformations.isConcessionaireOfPublicService?.choice,
      agentOfPublicServiceNote:
        newAdditionalInformations.isConcessionaireOfPublicService?.textFieldValue,
      belongRegulatedMarket: newAdditionalInformations.fromBelongsRegulatedMarket?.choice,
      regulatedMarketNote: newAdditionalInformations.fromBelongsRegulatedMarket?.textFieldValue,
      establishedByRegulatoryProvision:
        newAdditionalInformations.isEstabilishedRegulatoryProvision?.choice,
      establishedByRegulatoryProvisionNote:
        newAdditionalInformations.isEstabilishedRegulatoryProvision?.textFieldValue,
      ipa: newAdditionalInformations.isFromIPA?.choice,
      ipaCode: newAdditionalInformations.isFromIPA?.textFieldValue,
      otherNote: newAdditionalInformations.optionalPartyInformations?.textFieldValue ?? '',
    });
    forward();
  };

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      title: '',
      description: [
        <>
          {institutionType !== 'PT' ? (
            <EndingPage
              icon={<IllusCompleted size={60} />}
              title={t('onboarding.outcomeContent.success.title')}
              description={
                institutionType === 'PA' ? (
                  <Trans i18nKey="onboarding.outcomeContent.success.paDescription">
                    Invieremo un&apos;email all&apos;indirizzo PEC primario dell&apos;ente.
                    <br />
                    Al suo interno, ci sono le istruzioni per completare <br />
                    l&apos;adesione.
                  </Trans>
                ) : (
                  <Trans i18nKey="onboarding.outcomeContent.success.notPaDescription">
                    Invieremo un&apos;email all&apos;indirizzo PEC indicato.
                    <br />
                    Al suo interno, ci sono le istruzioni per completare <br />
                    l&apos;adesione.
                  </Trans>
                )
              }
              variantTitle={'h4'}
              variantDescription={'body1'}
              buttonLabel={t('onboarding.outcomeContent.success.backHome')}
              onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            />
          ) : (
            <EndingPage
              icon={<IllusCompleted size={60} />}
              title={t('onboarding.outcomeContent.ptSuccess.title')}
              description={
                <Trans i18nKey="onboarding.outcomeContent.success.description">
                  Invieremo un’email con l’esito della richiesta all’indirizzo <br /> PEC indicato.
                </Trans>
              }
              variantTitle={'h4'}
              variantDescription={'body1'}
              buttonLabel={t('onboarding.outcomeContent.success.backHome')}
              onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            />
          )}
        </>,
      ],
    },
    error: {
      title: '',
      description: [
        <>
          <EndingPage
            minHeight="52vh"
            icon={<IllusError size={60} />}
            variantTitle={'h4'}
            variantDescription={'body1'}
            title={t('onboarding.outcomeContent.error.title')}
            description={
              <Trans i18nKey="onboarding.outcomeContent.error.description">
                A causa di un errore del sistema non è possibile completare la procedura.
                <br />
                Ti chiediamo di riprovare più tardi.
              </Trans>
            }
            buttonLabel={t('onboarding.outcomeContent.error.backActionLabel')}
            onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
          />
        </>,
      ],
    },
  };

  const notAllowedError: RequestOutcomeMessage = {
    title: '',
    description: [
      <>
        <UserNotAllowedPage
          partyName={selectedParty?.description}
          productTitle={selectedProduct?.title}
        />
      </>,
    ],
  };

  const submit = async (users: Array<UserOnCreate>) => {
    setLoading(true);
    const postLegalsResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_POST_LEGALS' },
      {
        method: 'POST',
        data: {
          billingData: billingData2billingDataRequest(onboardingFormData as OnboardingFormData),
          additionalInformations:
            institutionType === 'GSP' && selectedProduct?.id === 'prod-pagopa'
              ? {
                  agentOfPublicService: additionalInformations?.agentOfPublicService,
                  agentOfPublicServiceNote: additionalInformations?.agentOfPublicServiceNote,
                  belongRegulatedMarket: additionalInformations?.belongRegulatedMarket,
                  regulatedMarketNote: additionalInformations?.regulatedMarketNote,
                  establishedByRegulatoryProvision:
                    additionalInformations?.establishedByRegulatoryProvision,
                  establishedByRegulatoryProvisionNote:
                    additionalInformations?.establishedByRegulatoryProvisionNote,
                  ipa: additionalInformations?.ipa,
                  ipaCode: additionalInformations?.ipaCode,
                  otherNote: additionalInformations?.otherNote,
                }
              : undefined,
          pspData:
            institutionType === 'PSP'
              ? pspData2pspDataRequest(onboardingFormData as OnboardingFormData)
              : undefined,
          companyInformations:
            institutionType !== 'PSP' && institutionType !== 'PA'
              ? companyInformationsDto2pspDataRequest(onboardingFormData as OnboardingFormData)
              : undefined,
          institutionType,
          ivassCode: onboardingFormData?.ivassCode,
          geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
            ? onboardingFormData?.geographicTaxonomies?.map((gt) =>
                onboardedInstitutionInfo2geographicTaxonomy(gt)
              )
            : [],
          institutionLocationData: {
            country: onboardingFormData?.country,
            county: onboardingFormData?.county,
            city: onboardingFormData?.city,
          },
          origin,
          users: users.map((u) => ({
            ...u,
            taxCode: u.taxCode.toUpperCase(),
            email: u.email.toLowerCase(),
          })),
          pricingPlan,
          assistanceContacts: assistanceConcatsDto2pspDataRequest(
            onboardingFormData as OnboardingFormData
          ),
          productId,
          subunitCode: aooSelected
            ? aooSelected.codiceUniAoo
            : uoSelected
            ? uoSelected.codiceUniUo
            : undefined,
          subunitType: aooSelected ? 'AOO' : uoSelected ? 'UO' : undefined,
          taxCode: onboardingFormData?.taxCode,
        },
      },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const outcome = getFetchOutcome(postLegalsResponse);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_SEND_SUCCESS', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
      setOutcome(outcomeContent[outcome]);
    } else {
      const event =
        (postLegalsResponse as AxiosError<Problem>).response?.status === 409
          ? 'ONBOARDING_SEND_CONFLICT_ERROR_FAILURE'
          : 'ONBOARDING_SEND_FAILURE';
      trackEvent(event, {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
      if ((postLegalsResponse as AxiosError<Problem>).response?.status === 403) {
        trackEvent('ONBOARDING_NOT_ALLOWED_ERROR', {
          request_id: requestIdRef.current,
          party_id: externalInstitutionId,
          product_id: productId,
        });
        setOutcome(notAllowedError);
      } else {
        setOutcome(outcomeContent[outcome]);
      }
    }
  };

  const forwardWithOnboardingData = (
    onboardingFormData?: OnboardingFormData,
    institutionType?: InstitutionType,
    _id?: string
  ) => {
    if (onboardingFormData) {
      setOnboardingFormData(onboardingFormData);
    }
    setInstitutionType(institutionType);
    forward();
  };

  const forwardWithInstitutionType = (newInstitutionType: InstitutionType) => {
    const partyExternalIdByQuery = new URLSearchParams(window.location.search).get(
      'partyExternalId'
    );
    trackEvent('ONBOARDING_PARTY_TYPE_SELECTION', {
      request_id: requestIdRef.current,
      party_id: partyExternalIdByQuery ?? '',
      product_id: productId,
    });
    setInstitutionType(newInstitutionType);
    forward();
    if (
      (newInstitutionType === 'PSP' || newInstitutionType !== 'PA') &&
      productId !== 'prod-interop'
    ) {
      if (newInstitutionType !== institutionType) {
        setOnboardingFormData({
          businessName: '',
          registeredOffice: '',
          zipCode: '',
          digitalAddress: '',
          taxCode: '',
          vatNumber: '',
          recipientCode: '',
          geographicTaxonomies: [],
        });
      } else {
        setOnboardingFormData(onboardingFormData);
      }
      setActiveStep(4);
    }
    if (newInstitutionType && newInstitutionType === 'PA') {
      setOrigin('IPA');
    } else {
      setOrigin(undefined);
    }
  };

  const steps: Array<StepperStep> = [
    {
      label: 'Seleziona il tipo di ente',
      Component: () =>
        StepInstitutionType({
          institutionType: institutionType as InstitutionType,
          fromDashboard,
          selectedProduct,
          forward: forwardWithInstitutionType,
          back: () => {
            setOnExitAction(() => () => history.goBack());
            setOpenExitModal(true);
          },
        }),
    },
    {
      label: "Seleziona l'ente",
      Component: () =>
        StepSearchParty({
          externalInstitutionId,
          subTitle: (
            <Trans
              i18nKey="onboardingStep1.onboarding.bodyDescription"
              values={{ productTitle: selectedProduct?.title }}
              components={{ 1: <br />, 3: <br /> }}
            >
              {`Inserisci uno dei dati richiesti e cerca dall’Indice della Pubblica <1/> Amministrazione (IPA) l’ente per cui vuoi richiedere l’adesione a <3/>{{productTitle}}`}
            </Trans>
          ),
          institutionType,
          productAvoidStep,
          product: selectedProduct,
          forward: forwardWithDataAndInstitution,
          back: () => {
            setActiveStep(0);
          },
          subunitTypeByQuery,
          subunitCodeByQuery,
        }),
    },
    {
      label: 'Verifica ente',
      Component: () =>
        OnboardingStep1_5({
          product: selectedProduct,
          forward,
          externalInstitutionId,
          productId,
          selectedProduct,
          selectedParty,
          aooSelected,
          uoSelected,
        }),
    },
    {
      label: 'Get Onboarding Data',
      Component: () =>
        StepOnboardingData({
          externalInstitutionId,
          productId,
          institutionType,
          forward: forwardWithOnboardingData,
          aooSelected,
          uoSelected,
        }),
    },
    {
      label: 'Insert Billing Data',
      Component: () =>
        StepOnboardingFormData({
          outcome,
          productId,
          selectedParty,
          selectedProduct,
          externalInstitutionId,
          initialFormData: onboardingFormData ?? {
            businessName: '',
            registeredOffice: '',
            zipCode: '',
            digitalAddress: '',
            taxCode: '',
            vatNumber: '',
            recipientCode: '',
            geographicTaxonomies: [],
          },
          aooSelected,
          uoSelected,
          origin,
          institutionType: institutionType as InstitutionType,
          subtitle:
            institutionType !== 'PT'
              ? t('onBoardingSubProduct.billingData.subTitle')
              : t('onboardingFormData.billingDataPt.subTitle'),
          forward: forwardWithBillingData,
          back: () => {
            if (fromDashboard && !productAvoidStep) {
              setActiveStep(0);
            } else if ((fromDashboard || subunitTypeByQuery) && productAvoidStep) {
              setOnExitAction(() => () => history.goBack());
              setOpenExitModal(true);
            } else if (
              institutionType === 'PSP' ||
              (institutionType !== 'PA' && institutionType !== 'SA')
            ) {
              setActiveStep(0);
            } else {
              setActiveStep(1);
            }
          },
        }),
    },
    {
      label: 'Additional Info',
      Component: () => StepAdditionalInformations({ forward: forwardWithAdditionalGSPInfo, back }),
    },
    {
      label: 'Inserisci i dati del rappresentante legale',
      Component: () =>
        StepAddManager({
          externalInstitutionId,
          product: selectedProduct,
          forward: (newFormData: Partial<FormData>) => {
            trackEvent('ONBOARDING_ADD_MANAGER', {
              request_id: requestIdRef.current,
              party_id: externalInstitutionId,
              product_id: productId,
            });
            forwardWithData(newFormData);
          },
          back: () => {
            if (productId === 'prod-pagopa' && institutionType === 'GSP') {
              back();
            } else {
              setActiveStep(activeStep - 2);
            }
          },
        }),
    },
    {
      label: 'Inserisci i dati degli amministratori',
      Component: () =>
        OnBoardingProductStepDelegates({
          externalInstitutionId,
          product: selectedProduct,
          legal: isTechPartner ? undefined : (formData as any)?.users[0],
          partyName: onboardingFormData?.businessName || '',
          forward: (newFormData: Partial<FormData>) => {
            const users = (newFormData as any).users as Array<UserOnCreate>;
            const usersWithoutLegal = users.slice(0, 0).concat(users.slice(0 + 1));
            setFormData({ ...formData, ...newFormData });
            trackEvent('ONBOARDING_ADD_DELEGATE', {
              request_id: requestIdRef.current,
              party_id: externalInstitutionId,
              product_id: productId,
            });
            submit(isTechPartner ? usersWithoutLegal : users).catch(() => {
              trackEvent('ONBOARDING_ADD_DELEGATE', {
                request_id: requestIdRef.current,
                party_id: externalInstitutionId,
                product_id: productId,
              });
            });
          },
          back: () => {
            if (isTechPartner) {
              setActiveStep(activeStep - 3);
            } else {
              setActiveStep(activeStep - 1);
            }
          },
        }),
    },
  ];

  const Step = useMemo(() => steps[activeStep].Component, [activeStep, selectedProduct]);

  useEffect(() => {
    if (outcome) {
      unregisterUnloadEvent(setOnExit);
    }
  }, [outcome]);

  const handleCloseExitModal = () => {
    setOpenExitModal(false);
    setOnExitAction(undefined);
  };

  return selectedProduct === null ? (
    <NoProductPage />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : pricingPlan && pricingPlan !== 'FA' ? (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      variantTitle={'h4'}
      variantDescription={'body1'}
      title={t('invalidPricingPlan.title')}
      description={
        <Trans i18nKey="invalidPricingPlan.description">
          Non riusciamo a trovare la pagina che stai cercando. <br />
          Assicurati che l’indirizzo sia corretto o torna alla home.
        </Trans>
      }
      buttonLabel={t('invalidPricingPlan.backButton')}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
    />
  ) : (
    <Container>
      <Step />
      <SessionModal
        handleClose={handleCloseExitModal}
        handleExit={handleCloseExitModal}
        onConfirm={() => {
          unregisterUnloadEvent(setOnExit);
          if (onExitAction) {
            onExitAction();
          }
        }}
        open={openExitModal}
        title={t('onboarding.sessionModal.title')}
        message={t('onboarding.sessionModal.message')}
        onConfirmLabel={t('onboarding.sessionModal.onConfirmLabel')}
        onCloseLabel={t('onboarding.sessionModal.onCloseLabel')}
      />
      {loading && <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />}
    </Container>
  );
}

export default withLogin(OnboardingComponent);
