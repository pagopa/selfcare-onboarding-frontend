/* eslint-disable sonarjs/cognitive-complexity */
import { Container } from '@mui/material';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
  InstitutionType,
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
import { HeaderContext, UserContext } from '../../lib/context';
import { AggregateInstitution } from '../../model/AggregateInstitution';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { checkProduct, getFilterCategories } from '../../services/onboardingServices';
import { postOnboardingSubmit } from '../../services/onboardingSubmitServices';
import { ENV } from '../../utils/env';
import {
  isPagoPaProduct,
  isPublicAdministration,
  isSendProduct,
  isTechPartner,
} from '../../utils/institutionTypeUtils';
import { triggerQualtricsIntercept } from '../../utils/qualtricsUtils';
import { registerUnloadEvent, unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import UploadDocumentsFlow from './documents/UploadDocumentsFlow';
import { createBackFunctions } from './components/backwards/backFunctions';
import { createForwardFunctions } from './components/forwards/forwardFunctions';
import { StepAddAdmin } from './components/StepAddAdmin';
import StepAddApplicantEmail from './components/StepAddApplicantEmail';
import { StepAdditionalGpuInformations } from './components/StepAdditionalGpuInformations';
import { StepAdditionalInformations } from './components/StepAdditionalInformations';
import { StepUploadAggregates } from './components/StepUploadAggregates';
import { genericError, StepVerifyOnboarding } from './components/StepVerifyOnboarding';
import StepContractsSummary from './components/contracts/StepContractsSummary';
import { buildFlowContext } from './state/flowContext';
import { normalizeUsers } from './state/normalizeUsers';
import { OnboardingStepName } from './state/onboardingSteps';
import { selectFilterCategories as selectFilterCategoriesFor } from './state/selectFilterCategories';
import { useOnboardingProductWizard } from './useOnboardingProductWizard';

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

// eslint-disable-next-line sonarjs/cognitive-complexity, complexity
function OnboardingProductComponent({ productId }: { productId: string }) {
  const {
    state,
    dispatch,
    requestIdRef,
    createdOnboardingRef,
    setLoading,
    setOutcome,
    setOpenExitModal,
    setOnExitAction,
    setSelectedProduct,
    setInstitutionType,
    setOrigin,
    setFilterCategoriesResponse,
  } = useOnboardingProductWizard();
  const {
    loading,
    formData,
    externalInstitutionId,
    outcome,
    uploadDocumentsContext,
    openExitModal,
    selectedProduct,
    onboardingFormData,
    additionalInformations,
    additionalGPUInformations,
    institutionType,
    origin,
    pricingPlan,
    filterCategoriesResponse,
    categoriesLoaded,
    onExitAction,
  } = state;
  const { activeStep } = state;
  const history = useHistory();
  const { setOnExit } = useContext(HeaderContext);
  const { t } = useTranslation();
  const {
    fromDashboard,
    productAvoidStep,
    subunitTypeByQuery,
    subunitCodeByQuery,
    institutionTypeByUrl,
    addUser,
    isRequiredDocumentsFlow,
    partyName,
  } = buildFlowContext({
    location: window.location,
    productId,
    selectedProductId: selectedProduct?.id,
    institutionType,
    origin,
    externalInstitutionId,
    onboardingFormData,
    gspNoIpaEnabled: ENV.GSP.NO_IPA,
  });
  const { user } = useContext(UserContext);

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      title: '',
      description: [
        <>
          <EndingPage
            minHeight="52vh"
            icon={<IllusCompleted size={60} />}
            title={
              isTechPartner(institutionType)
                ? t('onboarding.success.flow.techPartner.title')
                : t('onboarding.success.flow.product.title')
            }
            description={
              isTechPartner(institutionType) ? (
                <Trans
                  i18nKey="onboarding.success.flow.techPartner.description"
                  components={{ 1: <br /> }}
                >
                  {`Invieremo un'email con l'esito della richiesta all'indirizzo <1 />PEC indicato.`}
                </Trans>
              ) : isPublicAdministration(institutionType) ? (
                <Trans
                  i18nKey="onboarding.success.flow.product.publicAdministration.description"
                  components={{ 1: <br />, 3: <br /> }}
                >
                  {`Invieremo un'email all'indirizzo PEC primario dell'ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l'adesione.`}
                </Trans>
              ) : (
                <Trans
                  i18nKey="onboarding.success.flow.product.notPublicAdministration.description"
                  components={{ 1: <br />, 3: <br /> }}
                >
                  {`Invieremo un'email all'indirizzo PEC indicato. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l'adesione.`}
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

  const enterRequiredDocumentsFlow = () => {
    void OnboardingApi.getOnboardings(onboardingFormData?.taxCode ?? '', 'REQUESTING')
      .then((onboardings) => {
        setLoading(true);
        const onboardingId = onboardings.find((o) => o.productId === productId)?.id;
        if (onboardingId && institutionType && origin) {
          // eslint-disable-next-line functional/immutable-data
          createdOnboardingRef.current = {
            onboardingId,
            productId,
            institutionType: institutionType as string,
            origin,
          };
          dispatch({ type: 'OPEN_UPLOAD_DOCUMENTS', context: createdOnboardingRef.current });
        } else {
          setOutcome(outcomeContent.success);
        }
      })
      .catch(() => setOutcome(outcomeContent.error))
      .finally(() => setLoading(false));
  };

  const onSubmit = (
    userData?: Partial<FormData> | undefined,
    aggregates?: Array<AggregateInstitution>,
    updatedOnboardingFormData?: OnboardingFormData
  ) => {
    if (createdOnboardingRef.current) {
      dispatch({ type: 'OPEN_UPLOAD_DOCUMENTS', context: createdOnboardingRef.current });
      return;
    }
    const data = userData ?? formData;
    // same unchecked contract as before: postOnboardingSubmit expects the users list to be set
    const users = normalizeUsers(
      (data as any).users as Array<UserOnCreate>,
      institutionType
    ) as Array<UserOnCreate>;

    postOnboardingSubmit(
      setLoading,
      productId,
      selectedProduct,
      setOutcome,
      updatedOnboardingFormData ?? onboardingFormData,
      requestIdRef,
      externalInstitutionId,
      additionalInformations,
      additionalGPUInformations,
      institutionType,
      origin,
      outcomeContent,
      notAllowedError,
      pricingPlan,
      users,
      user,
      aggregates,
      () => {
        void triggerQualtricsIntercept({
          institutionDescription: onboardingFormData?.businessName ?? '',
          productId,
          institutionType: institutionType ?? '',
        });
      },
      isRequiredDocumentsFlow ? enterRequiredDocumentsFlow : undefined
    ).catch(() => {
      trackEvent('ONBOARDING_ADD_DELEGATE', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
    });
  };

  const {
    forwardWithInstitutionType,
    forwardGspNoIpa,
    forwardWithDataAndInstitution,
    forwardFromVerifyOnboarding,
    forwardWithBillingData,
    forwardWithAdditionalGSPInfo,
    forwardWithAdditionalGPUInfo,
    forwardWithOnboardingData,
    forwardFromManager,
    forwardFromAdmin,
    forwardFromAggregator,
    forwardFromApplicantEmail,
  } = createForwardFunctions({
    state,
    dispatch,
    ctx: { productId, loggedUserTaxCode: user?.taxCode, gspNoIpaEnabled: ENV.GSP.NO_IPA },
    effects: { requestIdRef, onSubmit },
  });

  const {
    handleOpenExitModal,
    backFromSearchParty,
    backFromContractsSummary,
    backFromBillingData,
    backFromAdditionalGpuInfo,
    backFromAdditionalInfo,
    backFromManager,
    backFromAdmin,
    backFromAggregates,
    backFromApplicantEmail,
  } = createBackFunctions({
    state,
    dispatch,
    ctx: {
      productId,
      fromDashboard,
      productAvoidStep,
      subunitTypeByQuery,
      isRequiredDocumentsFlow,
    },
    effects: { history },
  });

  useEffect(() => {
    if (isTechPartner(institutionTypeByUrl as InstitutionType) && isPagoPaProduct(productId)) {
      forwardWithInstitutionType('PT');
      setOrigin('SELC');
    }
  }, [institutionTypeByUrl]);

  useEffect(() => {
    if (
      selectedProduct &&
      !isSendProduct(selectedProduct?.id) &&
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

    void checkProduct(productId, setSelectedProduct, {
      onNotFound: () => unregisterUnloadEvent(setOnExit),
      onError: () => unregisterUnloadEvent(setOnExit),
      onPhaseOut: () => setOutcome(prodPhaseOutErrorPage),
    }).finally(() => {
      setLoading(false);
    });

    dispatch({
      type: 'PRICING_PLAN_LOADED',
      pricingPlan: new URLSearchParams(window.location.search).get('pricingPlan') ?? undefined,
    });
  }, [productId]);

  useEffect(() => {
    const loadFilterCategories = async () => {
      dispatch({ type: 'CATEGORIES_LOADING' });
      await getFilterCategories(setOutcome, setFilterCategoriesResponse, genericError);
      dispatch({ type: 'CATEGORIES_LOADED' });
    };
    void loadFilterCategories();
  }, [productId]);

  const selectFilterCategories = useCallback(
    () => selectFilterCategoriesFor(filterCategoriesResponse, productId, institutionType),
    [filterCategoriesResponse, productId, institutionType]
  );

  const steps: Record<OnboardingStepName, StepperStep> = {
    institutionType: {
      label: 'Select institution type',
      Component: () =>
        StepInstitutionType({
          institutionType: institutionType as InstitutionType,
          fromDashboard,
          selectedProduct,
          productId,
          setOrigin,
          forward: forwardWithInstitutionType,
          back: handleOpenExitModal,
          productAvoidStep,
          loading,
          setLoading,
          setOutcome,
          genericError,
        }),
    },
    searchParty: {
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
          back: backFromSearchParty,
          subunitTypeByQuery,
          subunitCodeByQuery,
          selectFilterCategories,
          setInstitutionType,
          forward: forwardWithDataAndInstitution,
          addUser,
        }),
    },
    contractsSummary: {
      label: 'Gpu contracts summary',
      Component: () =>
        StepContractsSummary({
          forward: forwardGspNoIpa,
          back: backFromContractsSummary,
        }),
    },
    verifyOnboarding: {
      label: 'Verify onboarding',
      Component: () =>
        StepVerifyOnboarding({
          product: selectedProduct,
          forward: forwardFromVerifyOnboarding,
          externalInstitutionId,
          productId,
          selectedProduct,
          onboardingFormData,
          institutionType,
        }),
    },
    onboardingData: {
      label: 'Get onboarding data',
      Component: () =>
        StepOnboardingData({
          productId,
          institutionType,
          forward: forwardWithOnboardingData,
        }),
    },
    billingData: {
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
          subtitle: !isTechPartner(institutionType) ? (
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
          back: backFromBillingData,
        }),
    },
    additionalGpuInfo: {
      label: 'Insert additional GPU data info',
      Component: () =>
        StepAdditionalGpuInformations({
          forward: forwardWithAdditionalGPUInfo,
          back: backFromAdditionalGpuInfo,
          originId: onboardingFormData?.originId,
          origin,
        }),
    },
    additionalInfo: {
      label: 'Insert additional info',
      Component: () =>
        StepAdditionalInformations({
          forward: forwardWithAdditionalGSPInfo,
          back: backFromAdditionalInfo,
          originId: onboardingFormData?.originId,
          origin,
        }),
    },
    manager: {
      label: 'Insert manager data',
      Component: () =>
        StepAddManager({
          externalInstitutionId,
          addUserFlow: addUser,
          product: selectedProduct,
          isTechPartner: isTechPartner(institutionType),
          forward: forwardFromManager,
          back: backFromManager,
        }),
    },
    admins: {
      label: 'Insert admins data',
      Component: () =>
        StepAddAdmin({
          externalInstitutionId,
          addUserFlow: addUser,
          product: selectedProduct,
          legal: isTechPartner(institutionType) ? undefined : (formData as any)?.users[0],
          partyName,
          isTechPartner: isTechPartner(institutionType),
          isAggregator: onboardingFormData?.isAggregator,
          isAddApplicationEmail: (formData as any)?.users?.every(
            (u: UserOnCreate) => u.taxCode !== user?.taxCode
          ),
          // GSP non-IPA: skip the pre-submit confirmation modal — it moves to the end of the
          // document upload flow instead.
          isRequiredDocumentsFlow,
          forward: forwardFromAdmin,
          back: backFromAdmin,
        }),
    },
    aggregates: {
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
          forward: forwardFromAggregator,
          back: backFromAggregates,
        }),
    },
    applicantEmail: {
      label: "Step add applicant's email",
      Component: () =>
        StepAddApplicantEmail({
          forward: forwardFromApplicantEmail,
          back: backFromApplicantEmail,
          user,
          addUser,
          partyName,
          productName: selectedProduct?.title,
          // GSP non-IPA: skip the pre-submit confirmation modal — it moves to the end of the
          // document upload flow instead.
          isRequiredDocumentsFlow,
        }),
    },
  };

  const Step = useMemo(() => steps[activeStep].Component, [activeStep, selectedProduct]);

  useEffect(() => {
    if (outcome) {
      unregisterUnloadEvent(setOnExit);
    }
  }, [outcome]);

  const handleCloseExitModal = () => {
    dispatch({ type: 'CLOSE_EXIT_MODAL' });
  };

  return selectedProduct === null ? (
    <NoProductPage />
  ) : uploadDocumentsContext ? (
    <UploadDocumentsFlow
      {...uploadDocumentsContext}
      partyName={partyName}
      onSuccess={() => {
        // eslint-disable-next-line functional/immutable-data
        createdOnboardingRef.current = null;
        dispatch({ type: 'UPLOAD_DOCUMENTS_COMPLETED', outcome: outcomeContent.success });
        void triggerQualtricsIntercept({
          institutionDescription: onboardingFormData?.businessName ?? '',
          productId,
          institutionType: institutionType ?? '',
        });
      }}
      back={() => {
        dispatch({ type: 'UPLOAD_DOCUMENTS_BACK' });
      }}
    />
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
      {(loading || !categoriesLoaded) && (
        <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
      )}
    </Container>
  );
}

export default withLogin(OnboardingProductComponent);
