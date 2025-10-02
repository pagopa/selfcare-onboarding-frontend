/* eslint-disable sonarjs/cognitive-complexity */
import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Container } from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import { uniqueId } from 'lodash';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { withLogin } from '../../components/withLogin';
import {
  InstitutionType,
  Product,
  RequestOutcomeOptions,
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
import { onboardedInstitutionInfo2geographicTaxonomy } from '../../model/GeographicTaxonomies';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepOnboardingFormData from '../../components/steps/StepOnboardingFormData';
import { registerUnloadEvent, unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import StepInstitutionType from '../../components/steps/StepInstitutionType';
import UserNotAllowedPage from '../UserNotAllowedPage';
import { AdditionalData, AdditionalInformations } from '../../model/AdditionalInformations';
import AlreadyOnboarded from '../AlreadyOnboarded';
import { AdditionalGpuInformations } from '../../model/AdditionalGpuInformations';
import { AggregateInstitution } from '../../model/AggregateInstitution';
import { selected2OnboardingData } from '../../utils/selected2OnboardingData';
import config from '../../utils/config.json';
import { PRODUCT_IDS } from '../../utils/constants';
import { genericError, StepVerifyOnboarding } from './components/StepVerifyOnboarding';
import { StepAddAdmin } from './components/StepAddAdmin';
import { StepAdditionalInformations } from './components/StepAdditionalInformations';
import { StepUploadAggregates } from './components/StepUploadAggregates';
import { StepAdditionalGpuInformations } from './components/StepAdditionalGpuInformations';

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
function OnboardingProductComponent({ productId }: { productId: string }) {
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
  const [additionalGPUInformations, setAdditionalGPUInformations] =
    useState<AdditionalGpuInformations>();
  const [institutionType, setInstitutionType] = useState<InstitutionType>();
  const [origin, setOrigin] = useState<string>();
  const [pricingPlan, setPricingPlan] = useState<string>();
  const [filterCategoriesResponse, setFilterCategoriesResponse] = useState<any>();

  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();
  const [onExitAction, setOnExitAction] = useState<(() => void) | undefined>();

  const productAvoidStep = [PRODUCT_IDS.SEND, PRODUCT_IDS.IDPAY].includes(
    selectedProduct?.id ?? ''
  );

  const fromDashboard =
    window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1;

  const subunitTypeByQuery =
    new URLSearchParams(window.location.hash.substr(1)).get('subunitType') ?? '';
  const subunitCodeByQuery =
    new URLSearchParams(window.location.hash.substr(1)).get('subunitCode') ?? '';

  const isTechPartner = institutionType === 'PT';

  const institutionTypeByUrl = new URLSearchParams(window.location.search).get('institutionType');

  useEffect(() => {
    if (institutionTypeByUrl === 'PT' && productId === PRODUCT_IDS.PAGOPA) {
      forwardWithInstitutionType('PT');
    }
  }, [institutionTypeByUrl]);

  const alreadyOnboarded: RequestOutcomeMessage = {
    title: '',
    description: isTechPartner
      ? [
          <React.Fragment key="0">
            <EndingPage
              minHeight="52vh"
              variantTitle="h4"
              variantDescription="body1"
              icon={<IllusError size={60} />}
              title={<Trans i18nKey="stepVerifyOnboarding.ptAlreadyOnboarded.title" />}
              description={
                <Trans i18nKey="stepVerifyOnboarding.ptAlreadyOnboarded.description">
                  Per operare su un prodotto, chiedi a un Amministratore di <br /> aggiungerti nella
                  sezione Utenti.
                </Trans>
              }
              buttonLabel={<Trans i18nKey="stepVerifyOnboarding.ptAlreadyOnboarded.backAction" />}
              onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            />
          </React.Fragment>,
        ]
      : [
          <React.Fragment key="0">
            <AlreadyOnboarded
              onboardingFormData={onboardingFormData}
              selectedProduct={selectedProduct}
              institutionType={institutionType}
            />
          </React.Fragment>,
        ],
  };

  useEffect(() => {
    if (
      selectedProduct &&
      selectedProduct?.id !== PRODUCT_IDS.SEND &&
      (subunitTypeByQuery || subunitCodeByQuery)
    ) {
      window.location.assign(ENV.URL_FE.DASHBOARD);
    }
  }, [selectedProduct, onboardingFormData?.aooUniqueCode, onboardingFormData?.uoUniqueCode]);

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
      setInstitutionType('PA');
      setOrigin('IPA');
      setActiveStep(1); // Vai direttamente allo step di ricerca
    }

    if (selectedProduct?.id === PRODUCT_IDS.IDPAY_MERCHANT) {
      setInstitutionType('PRV');
      setOrigin(undefined);
      setActiveStep(1); // Vai direttamente allo step di ricerca
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (onboardingFormData && onboardingFormData?.businessName !== '' && institutionType !== 'PA') {
      if (onboardingFormData.taxCode) {
        setExternalInstitutionId(onboardingFormData.taxCode);
      }
      void insertedPartyVerifyOnboarding(onboardingFormData);
    }
  }, [onboardingFormData]);

  useEffect(() => {
    void getFilterCategories();
  }, []);

  const selectFilterCategories = () => {
    if (productId === PRODUCT_IDS.SEND) {
      return filterCategoriesResponse?.product['prod-pn']?.ipa.PA;
    } else if (productId === PRODUCT_IDS.IDPAY_MERCHANT) {
      return filterCategoriesResponse?.product['prod-idpay-merchant']?.merchantDetails?.atecoCodes;
    } else if (productId === PRODUCT_IDS.INTEROP && institutionType === 'SCEC') {
      return filterCategoriesResponse?.product['prod-interop']?.ipa.SCEC;
    } else if (institutionType === 'GSP') {
      return filterCategoriesResponse?.product.default.ipa.GSP;
    } else {
      return filterCategoriesResponse?.product.default.ipa.PA;
    }
  };

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

  const insertedPartyVerifyOnboarding = async (onboardingFormData: OnboardingFormData) => {
    const onboardingStatus = await fetchWithLogs(
      {
        endpoint: 'VERIFY_ONBOARDING',
      },
      {
        method: 'HEAD',
        params: {
          taxCode: onboardingFormData.taxCode,
          productId,
          subunitCode: onboardingFormData.uoUniqueCode ?? onboardingFormData.aooUniqueCode,
          origin: institutionType === 'AS' ? 'IVASS' : undefined,
          originId: onboardingFormData?.originId ?? undefined,
        },
      },
      () => setRequiredLogin(true)
    );
    const restOutcome = getFetchOutcome(onboardingStatus);

    if (restOutcome === 'success') {
      setOutcome(alreadyOnboarded);
    } else {
      if (
        (onboardingStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingStatus as AxiosError<any>).response?.status === 400
      ) {
        setOutcome(null);
      } else if ((onboardingStatus as AxiosError<any>).response?.status === 403) {
        setOutcome(notAllowedError);
      } else {
        setOutcome(genericError);
      }
    }
  };

  const getFilterCategories = async () => {
    const categories = await fetchWithLogs(
      {
        endpoint: 'CONFIG_JSON_CDN_URL',
      },
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      () => setRequiredLogin(true)
    );

    const restOutcome = getFetchOutcome(categories);
    if (restOutcome === 'success') {
      const response = (categories as AxiosResponse).data;
      setFilterCategoriesResponse(response);
    } else {
      setFilterCategoriesResponse(config);
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
    onboardingData: OnboardingFormData,
    institutionType: InstitutionType
  ) => {
    if (
      onboardingData.taxCode === '' &&
      onboardingData.originId === undefined &&
      institutionType === 'GSP'
    ) {
      setOrigin('SELC');
      setActiveStep(activeStep + 3);
    } else {
      setOnboardingFormData(onboardingData);
      setExternalInstitutionId(onboardingData.externalId ?? '');
      setOrigin(onboardingData.origin);
      forwardWithData(onboardingData as Partial<FormData>);
      trackEvent('ONBOARDING_PARTY_SELECTION', {
        party_id: onboardingData?.externalId,
        request_id: requestIdRef.current,
        product_id: productId,
      });
      setInstitutionType(institutionType);
    }
  };

  const forwardWithBillingData = (newOnboardingFormData: OnboardingFormData) => {
    const trackingData = {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
      geographic_taxonomies: newOnboardingFormData.geographicTaxonomies,
    };
    trackEvent('ONBOARDING_BILLING_DATA', trackingData);
    setOnboardingFormData(newOnboardingFormData);
    switch (institutionType) {
      case 'GSP':
        if (productId === PRODUCT_IDS.PAGOPA) {
          setActiveStep(activeStep + 2);
        } else {
          setActiveStep(activeStep + 3);
        }
        break;
      case 'GPU':
        setActiveStep(activeStep + 1);
        break;
      case 'PT':
        setActiveStep(activeStep + 4);
        break;
      default:
        setActiveStep(activeStep + 3);
        break;
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

  const forwardWithAdditionalGPUInfo = (
    newAdditionalGpuInformations: AdditionalGpuInformations
  ) => {
    setAdditionalGPUInformations({
      businessRegisterNumber: newAdditionalGpuInformations?.businessRegisterNumber,
      legalRegisterNumber: newAdditionalGpuInformations?.legalRegisterNumber,
      legalRegisterName: newAdditionalGpuInformations.legalRegisterName,
      longTermPayments: newAdditionalGpuInformations.longTermPayments,
      manager: newAdditionalGpuInformations.manager,
      managerAuthorized: newAdditionalGpuInformations.managerAuthorized,
      managerEligible: newAdditionalGpuInformations.managerEligible,
      managerProsecution: newAdditionalGpuInformations.managerProsecution,
      institutionCourtMeasures: newAdditionalGpuInformations.institutionCourtMeasures,
    });
    setActiveStep(activeStep + 2);
  };

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      title: '',
      description: [
        <>
          <EndingPage
            minHeight="52vh"
            icon={<IllusCompleted size={60} />}
            title={
              institutionType === 'PT'
                ? t('onboarding.success.flow.techPartner.title')
                : t('onboarding.success.flow.product.title')
            }
            description={
              institutionType === 'PT' ? (
                <Trans
                  i18nKey="onboarding.success.flow.techPartner.description"
                  components={{ 1: <br /> }}
                >
                  {`Invieremo un’email con l’esito della richiesta all’indirizzo <1 />PEC indicato.`}
                </Trans>
              ) : institutionType === 'PA' ? (
                <Trans
                  i18nKey="onboarding.success.flow.product.publicAdministration.description"
                  components={{ 1: <br />, 3: <br /> }}
                >
                  {`Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`}
                </Trans>
              ) : (
                <Trans
                  i18nKey="onboarding.success.flow.product.notPublicAdministration.description"
                  components={{ 1: <br />, 3: <br /> }}
                >
                  {`Invieremo un’email all’indirizzo PEC indicato. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`}
                </Trans>
              )
            }
            variantTitle={'h4'}
            variantDescription={'body1'}
            buttonLabel={t('onboarding.backHome')}
            onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
          />
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
            title={t('onboarding.error.title')}
            description={
              <Trans i18nKey="onboarding.error.description" components={{ 1: <br /> }}>
                {`A causa di un errore del sistema non è possibile completare <1 />la procedura. Ti chiediamo di riprovare più tardi.`}
              </Trans>
            }
            buttonLabel={t('onboarding.backHome')}
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
          partyName={onboardingFormData?.businessName}
          productTitle={selectedProduct?.title}
        />
      </>,
    ],
  };

  // eslint-disable-next-line complexity
  const onboardingSubmit = async (
    users: Array<UserOnCreate>,
    aggregates?: Array<AggregateInstitution>
  ) => {
    setLoading(true);
    const postLegalsResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_POST_LEGALS' },
      {
        method: 'POST',
        data: {
          billingData: billingData2billingDataRequest(onboardingFormData as OnboardingFormData),
          atecoCodes: onboardingFormData?.atecoCodes,
          additionalInformations:
            institutionType === 'GSP' && selectedProduct?.id === PRODUCT_IDS.PAGOPA
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
          payment:
            institutionType === 'PRV' && selectedProduct?.id === PRODUCT_IDS.IDPAY_MERCHANT
              ? {
                  holder: onboardingFormData?.holder,
                  iban: onboardingFormData?.iban,
                }
              : undefined,
          gpuData:
            institutionType === 'GPU' &&
            (selectedProduct?.id === PRODUCT_IDS.PAGOPA ||
              selectedProduct?.id === PRODUCT_IDS.INTEROP ||
              selectedProduct?.id === PRODUCT_IDS.IO_SIGN ||
              selectedProduct?.id === PRODUCT_IDS.IO)
              ? additionalGPUInformations
              : undefined,
          pspData:
            institutionType === 'PSP'
              ? pspData2pspDataRequest(onboardingFormData as OnboardingFormData)
              : undefined,
          soleTrader: onboardingFormData?.soleTrader,
          companyInformations:
            onboardingFormData?.businessRegisterPlace ||
            onboardingFormData?.rea ||
            onboardingFormData?.shareCapital
              ? {
                  businessRegisterPlace: onboardingFormData?.businessRegisterPlace,
                  rea: onboardingFormData?.rea,
                  shareCapital: onboardingFormData?.shareCapital,
                }
              : undefined,
          institutionType,
          originId: onboardingFormData?.originId ?? onboardingFormData?.taxCode,
          geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
            ? onboardingFormData?.geographicTaxonomies?.map((gt) =>
                onboardedInstitutionInfo2geographicTaxonomy(gt)
              )
            : [],
          institutionLocationData: {
            country:
              institutionType === 'SCP' && productId === PRODUCT_IDS.INTEROP
                ? 'IT'
                : onboardingFormData?.country,
            county: onboardingFormData?.county,
            city: onboardingFormData?.city,
          },
          origin:
            institutionType === 'SA'
              ? 'ANAC'
              : institutionType === 'PSP' ||
                  institutionType === 'GPU' ||
                  institutionType === 'PT' ||
                  (institutionType === 'PRV' &&
                    productId !== PRODUCT_IDS.INTEROP &&
                    productId !== PRODUCT_IDS.IDPAY_MERCHANT)
                ? 'SELC'
                : origin,
          istatCode: origin !== 'IPA' ? onboardingFormData?.istatCode : undefined,
          users,
          pricingPlan,
          assistanceContacts:
            productId === PRODUCT_IDS.IO_SIGN
              ? { supportEmail: onboardingFormData?.supportEmail }
              : undefined,
          productId,
          subunitCode: onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode,
          subunitType: onboardingFormData?.uoUniqueCode
            ? 'UO'
            : onboardingFormData?.aooUniqueCode
              ? 'AOO'
              : undefined,
          taxCode: onboardingFormData?.taxCode,
          isAggregator: onboardingFormData?.isAggregator
            ? onboardingFormData?.isAggregator
            : undefined,
          aggregates,
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

  const onSubmit = (
    userData?: Partial<FormData> | undefined,
    aggregates?: Array<AggregateInstitution>
  ) => {
    const data = userData ?? formData;
    const users = ((data as any).users as Array<UserOnCreate>).map((u) => ({
      ...u,
      taxCode: u?.taxCode.toUpperCase(),
      email: u?.email.toLowerCase(),
    }));

    const usersWithoutLegal = users.slice(0, 0).concat(users.slice(0 + 1));

    onboardingSubmit(isTechPartner ? usersWithoutLegal : users, aggregates).catch(() => {
      trackEvent('ONBOARDING_ADD_DELEGATE', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
    });
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

    if (newInstitutionType === 'PRV' && productId === PRODUCT_IDS.PAGOPA) {
      selected2OnboardingData(null, undefined, newInstitutionType, productId);
      setOnboardingFormData(
        selected2OnboardingData(null, undefined, newInstitutionType, productId)
      );
      setActiveStep(4);
    } else {
      forward();
    }

    if (
      newInstitutionType !== 'GSP' &&
      newInstitutionType !== 'PA' &&
      newInstitutionType !== 'SA' &&
      newInstitutionType !== 'AS' &&
      newInstitutionType !== 'SCP' &&
      newInstitutionType !== 'PRV' &&
      newInstitutionType !== 'SCEC'
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
      label: 'Select institution type',
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
      label: 'Search and select party',
      Component: () =>
        StepSearchParty({
          externalInstitutionId,
          subTitle: (
            <Trans
              i18nKey="onboardingStep1.onboarding.bodyDescription"
              values={{ productTitle: selectedProduct?.title }}
              components={{ 1: <br />, 3: <br />, 4: <strong /> }}
            >
              {`Inserisci uno dei dati richiesti e cerca dall’Indice della Pubblica <1/> Amministrazione (IPA) l’ente per cui vuoi richiedere l’adesione a <3/><strong>{{productTitle}}</strong>`}
            </Trans>
          ),
          institutionType,
          productAvoidStep,
          product: selectedProduct,
          back: () => {
            setActiveStep(0);
          },
          subunitTypeByQuery,
          subunitCodeByQuery,
          selectFilterCategories,
          forward: forwardWithDataAndInstitution,
        }),
    },
    {
      label: 'Verify onboarding',
      Component: () =>
        StepVerifyOnboarding({
          product: selectedProduct,
          forward,
          externalInstitutionId,
          productId,
          selectedProduct,
          onboardingFormData,
          institutionType,
        }),
    },
    {
      label: 'Get onboarding data',
      Component: () =>
        StepOnboardingData({
          productId,
          institutionType,
          forward: forwardWithOnboardingData,
        }),
    },
    {
      label: 'Insert billing data',
      Component: () =>
        StepOnboardingFormData({
          outcome,
          productId,
          onboardingFormData,
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
          origin,
          originId: onboardingFormData?.originId,
          institutionType: institutionType as InstitutionType,
          subtitle:
            institutionType !== 'PT' ? (
              <Trans i18nKey="onboardingSubProduct.billingData.subTitle" components={{ 1: <br /> }}>
                {`Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti. <1 />Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`}
              </Trans>
            ) : (
              <Trans
                i18nKey="onboardingSubProduct.billingDataPt.subTitle"
                values={{ nameProduct: selectedProduct?.title }}
                components={{ 1: <br />, 3: <br />, 5: <strong /> }}
              >
                {`Inserisci le informazioni richieste e assicurati che siano corrette.<1 /> Serviranno a registrarti come Partner tecnologico per il<3/> prodotto <5>{{nameProduct}}</5>.`}
              </Trans>
            ),
          selectFilterCategories,
          forward: forwardWithBillingData,
          back: () => {
            if (fromDashboard && !productAvoidStep) {
              setActiveStep(0);
            } else if ((fromDashboard || subunitTypeByQuery) && productAvoidStep) {
              setOnExitAction(() => () => history.goBack());
              setOpenExitModal(true);
            } else if (
              institutionType === 'PSP' ||
              (institutionType !== 'PA' &&
                institutionType !== 'SA' &&
                institutionType !== 'GSP' &&
                institutionType !== 'PRV')
            ) {
              setActiveStep(0);
            } else if (fromDashboard && productId === PRODUCT_IDS.DASHBOARD_PSP) {
              window.location.assign(`${ENV.URL_FE.DASHBOARD}/${externalInstitutionId}`);
            } else {
              setActiveStep(1);
            }
          },
        }),
    },
    {
      label: 'Insert additional GPU data info',
      Component: () =>
        StepAdditionalGpuInformations({
          forward: forwardWithAdditionalGPUInfo,
          back: () => setActiveStep(activeStep - 1),
          originId: onboardingFormData?.originId,
          origin,
        }),
    },
    {
      label: 'Insert additional info',
      Component: () =>
        StepAdditionalInformations({
          forward: forwardWithAdditionalGSPInfo,
          back: () => setActiveStep(activeStep - 2),
          originId: onboardingFormData?.originId,
          origin,
        }),
    },
    {
      label: 'Insert manager data',
      Component: () =>
        StepAddManager({
          externalInstitutionId,
          addUserFlow: false,
          product: selectedProduct,
          isTechPartner,
          forward: (newFormData: Partial<FormData>) => {
            trackEvent('ONBOARDING_ADD_MANAGER', {
              request_id: requestIdRef.current,
              party_id: externalInstitutionId,
              product_id: productId,
            });
            forwardWithData(newFormData);
          },
          back: () => {
            switch (institutionType) {
              case 'GSP':
                if (origin === 'IPA' && selectedProduct?.id === PRODUCT_IDS.INTEROP) {
                  setActiveStep(activeStep - 3);
                } else {
                  setActiveStep(activeStep - 1);
                }
                break;
              case 'GPU':
                setActiveStep(activeStep - 2);
                break;
              case 'PT':
                setActiveStep(activeStep - 4);
                break;
              default:
                setActiveStep(activeStep - 3);
                break;
            }
          },
        }),
    },
    {
      label: 'Insert admins data',
      Component: () =>
        StepAddAdmin({
          externalInstitutionId,
          addUserFlow: false,
          product: selectedProduct,
          legal: isTechPartner ? undefined : (formData as any)?.users[0],
          partyName:
            onboardingFormData?.uoName ??
            onboardingFormData?.aooName ??
            onboardingFormData?.businessName ??
            '',
          isTechPartner,
          isAggregator: onboardingFormData?.isAggregator,
          forward: (newFormData: Partial<FormData>) => {
            const userData = { ...formData, ...newFormData };
            setFormData(userData);
            if (onboardingFormData?.isAggregator) {
              forward();
            } else {
              onSubmit(userData);
            }
          },
          back: () => {
            if (isTechPartner) {
              setActiveStep(activeStep - 4);
            } else {
              setActiveStep(activeStep - 1);
            }
          },
        }),
    },
    {
      label: 'Upload aggregate list',
      Component: () =>
        StepUploadAggregates({
          productName: selectedProduct?.title,
          productId: selectedProduct?.id,
          partyName: onboardingFormData?.businessName,
          institutionType,
          loading,
          setLoading,
          setOutcome,
          forward: onSubmit,
          back,
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

export default withLogin(OnboardingProductComponent);
