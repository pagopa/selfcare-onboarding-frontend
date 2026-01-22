/* eslint-disable sonarjs/cognitive-complexity */
import { Container } from '@mui/material';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
  InstitutionType,
  Product,
  RequestOutcomeMessage,
  RequestOutcomeOptions,
  StepperStep,
  UserOnCreate,
} from '../../../types';
import NoProductPage from '../../components/layout/NoProductPage';
import UserNotAllowedPage from '../../components/layout/UserNotAllowedPage';
import { LoadingOverlay } from '../../components/modals/LoadingOverlay';
import { MessageNoAction } from '../../components/shared/MessageNoAction';
import { StepAddManager } from '../../components/steps/StepAddManager';
import StepInstitutionType from '../../components/steps/StepInstitutionType';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepOnboardingFormData from '../../components/steps/StepOnboardingFormData';
import { StepSearchParty } from '../../components/steps/StepSearchParty';
import { withLogin } from '../../components/withLogin';
import { useOnboardingControllers } from '../../hooks/useOnboardingControllers';
import { HeaderContext, UserContext } from '../../lib/context';
import { AdditionalGpuInformations } from '../../model/AdditionalGpuInformations';
import { AdditionalInformations } from '../../model/AdditionalInformations';
import { AggregateInstitution } from '../../model/AggregateInstitution';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { checkProduct, getFilterCategories } from '../../services/onboardingServices';
import { postOnboardingSubmit } from '../../services/onboardingSubmitServices';
import { PRODUCT_IDS } from '../../utils/constants';
import { ENV } from '../../utils/env';
import { registerUnloadEvent, unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { StepAddAdmin } from './components/StepAddAdmin';
import { StepAdditionalGpuInformations } from './components/StepAdditionalGpuInformations';
import { StepAdditionalInformations } from './components/StepAdditionalInformations';
import { StepUploadAggregates } from './components/StepUploadAggregates';
import { genericError, StepVerifyOnboarding } from './components/StepVerifyOnboarding';
import { createForwardFunctions } from './components/forwards/forwardFunctions';

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
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [pendingForward, setPendingForward] = useState<{
    data: Partial<FormData>;
  } | null>(null);
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();
  const [onExitAction, setOnExitAction] = useState<(() => void) | undefined>();
  const productAvoidStep = [
    PRODUCT_IDS.SEND,
    PRODUCT_IDS.IDPAY,
    PRODUCT_IDS.IDPAY_MERCHANT,
  ].includes(selectedProduct?.id ?? '');
  const fromDashboard =
    window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1;
  const subunitTypeByQuery =
    new URLSearchParams(window.location.hash.substring(1)).get('subunitType') ?? '';
  const subunitCodeByQuery =
    new URLSearchParams(window.location.hash.substring(1)).get('subunitCode') ?? '';
  const institutionTypeByUrl = new URLSearchParams(window.location.search).get('institutionType');
  const desiredOriginRef = useRef<string | undefined>();
  const controllers = useOnboardingControllers({
    institutionType,
    productId,
    origin,
    onboardingFormData,
  });
  const addUser = window.location.pathname.includes('/user');

  const back = () => {
    setActiveStep(activeStep - 1);
  };
  const forward = () => {
    if (outcome && activeStep <= 2) {
      setOutcome(null);
    }
    setActiveStep(activeStep + 1);
  };

  const {
    forwardWithData,
    forwardWithInstitutionType,
    forwardWithDataAndInstitution,
    forwardWithBillingData,
    forwardWithAdditionalGSPInfo,
    forwardWithAdditionalGPUInfo,
    forwardWithOnboardingData,
  } = createForwardFunctions({
    requestIdRef,
    productId,
    institutionType,
    onboardingFormData,
    setInstitutionType,
    setOnboardingFormData,
    setActiveStep,
    setOrigin,
    forward,
    formData,
    setFormData,
    desiredOriginRef,
    activeStep,
    origin,
    setExternalInstitutionId,
    externalInstitutionId,
    setAdditionalInformations,
    setAdditionalGPUInformations,
    setPendingForward,
  });

  useEffect(() => {
    if (pendingForward && externalInstitutionId && institutionType) {
      try {
        const { data } = pendingForward;

        setFormData((prevFormData) => {
          if (prevFormData) {
            return { ...prevFormData, ...data };
          }
          return data;
        });
      } catch (error) {
        console.error('[OnboardingProduct] ERROR setting formData:', error);
        setPendingForward(null);
        setOutcome(genericError);
      }
    }
  }, [pendingForward, externalInstitutionId, institutionType]);

  useEffect(() => {
    if (pendingForward && formData) {
      setPendingForward(null);
      setActiveStep((prevStep) => prevStep + 1);
    }
  }, [formData, pendingForward]);

  useEffect(() => {
    if (institutionTypeByUrl === 'PT' && productId === PRODUCT_IDS.PAGOPA) {
      forwardWithInstitutionType('PT');
      setOrigin('SELC');
    }
  }, [institutionTypeByUrl]);

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

    void checkProduct(productId, setSelectedProduct, setRequiredLogin, {
      onNotFound: () => unregisterUnloadEvent(setOnExit),
      onError: () => unregisterUnloadEvent(setOnExit),
      onPhaseOut: () => setOutcome(prodPhaseOutErrorPage),
    }).finally(() => {
      setLoading(false);
    });

    setPricingPlan(new URLSearchParams(window.location.search).get('pricingPlan') ?? undefined);
  }, [productId]);

  useEffect(() => {
    const loadFilterCategories = async () => {
      setCategoriesLoaded(false);
      await getFilterCategories(setOutcome, setFilterCategoriesResponse, genericError);
      setCategoriesLoaded(true);
    };
    void loadFilterCategories();
  }, [productId]);

  const selectFilterCategories = useCallback(() => {
    if (!filterCategoriesResponse?.product) {
      return undefined;
    }

    switch (productId) {
      case PRODUCT_IDS.SEND:
        return filterCategoriesResponse.product['prod-pn']?.ipa.PA;

      case PRODUCT_IDS.IDPAY_MERCHANT:
        return filterCategoriesResponse.product['prod-idpay-merchant']?.merchantDetails;

      case PRODUCT_IDS.INTEROP:
        if (institutionType === 'SCEC') {
          return filterCategoriesResponse.product['prod-interop']?.ipa.SCEC;
        } else if (institutionType === 'PA') {
          return filterCategoriesResponse.product['prod-interop']?.ipa.PA;
        } else if (institutionType === 'GSP') {
          return filterCategoriesResponse.product.default?.ipa.GSP;
        } else {
          return filterCategoriesResponse.product.default?.ipa.PA;
        }
      default:
        const defaultIpa = filterCategoriesResponse.product.default?.ipa;
        return institutionType === 'GSP' ? defaultIpa?.GSP : defaultIpa?.PA;
    }
  }, [filterCategoriesResponse, productId, institutionType]);

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

  const onSubmit = (
    userData?: Partial<FormData> | undefined,
    aggregates?: Array<AggregateInstitution>
  ) => {
    const data = userData ?? formData;
    const users = ((data as any).users as Array<UserOnCreate>).map((u) => ({
      ...u,
      taxCode: u?.taxCode?.toUpperCase(),
      email: u?.email?.toLowerCase(),
    }));

    const usersWithoutLegal = users.slice(0, 0).concat(users.slice(0 + 1));

    postOnboardingSubmit(
      setLoading,
      setRequiredLogin,
      productId,
      selectedProduct,
      setOutcome,
      onboardingFormData,
      requestIdRef,
      externalInstitutionId,
      additionalInformations,
      additionalGPUInformations,
      institutionType,
      origin,
      outcomeContent,
      notAllowedError,
      pricingPlan,
      controllers.isTechPartner ? usersWithoutLegal : users,
      aggregates
    ).catch(() => {
      trackEvent('ONBOARDING_ADD_DELEGATE', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
    });
  };

  const steps: Array<StepperStep> = [
    {
      label: 'Select institution type',
      Component: () =>
        StepInstitutionType({
          institutionType: institutionType as InstitutionType,
          fromDashboard,
          selectedProduct,
          productId,
          setOrigin,
          forward: forwardWithInstitutionType,
          back: () => {
            setOnExitAction(() => () => history.goBack());
            setOpenExitModal(true);
          },
          productAvoidStep,
          loading,
          setLoading,
          setRequiredLogin,
          setOutcome,
          genericError,
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
          setInstitutionType,
          forward: forwardWithDataAndInstitution,
          addUser,
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
                institutionType !== 'PRV' &&
                institutionType !== 'PRV_PF')
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
          addUserFlow: addUser,
          product: selectedProduct,
          isTechPartner: controllers.isTechPartner,
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
                if (origin === 'IPA' && selectedProduct?.id === PRODUCT_IDS.PAGOPA) {
                  setActiveStep(activeStep - 1);
                } else {
                  setActiveStep(activeStep - 3);
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
          addUserFlow: addUser,
          product: selectedProduct,
          legal: controllers.isTechPartner ? undefined : (formData as any)?.users[0],
          partyName:
            onboardingFormData?.uoName ??
            onboardingFormData?.aooName ??
            onboardingFormData?.businessName ??
            '',
          isTechPartner: controllers.isTechPartner,
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
            if (controllers.isTechPartner) {
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
  ) : outcome && activeStep > 2 ? (
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
      {(loading || !categoriesLoaded) && (
        <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
      )}
    </Container>
  );
}

export default withLogin(OnboardingProductComponent);
