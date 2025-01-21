import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Container } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { useParams } from 'react-router';
import { useTranslation, Trans } from 'react-i18next';
import { withLogin } from '../../components/withLogin';
import { InstitutionType, SelfcareParty, Product, StepperStep, UserOnCreate } from '../../../types';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ENV } from '../../utils/env';
import { HeaderContext } from '../../lib/context';
import { StepAddManager, UsersObject } from '../../components/steps/StepAddManager';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepOnboardingFormData from '../../components/steps/StepOnboardingFormData';
import { AssistanceContacts } from '../../model/AssistanceContacts';
import { CompanyInformations } from '../../model/CompanyInformations';
import { registerUnloadEvent, unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { useHistoryState } from '../../components/useHistoryState';
import { ConfirmOnboardingModal } from '../../components/ConfirmOnboardingRequest';
import SubProductStepVerifyInputs from './components/SubProductStepVerifyInputs';
import SubProductStepSubmit from './components/SubProductStepSubmit';
import SubProductStepSuccess from './components/SubProductStepSuccess';
import { SubProductStepSelectUserParty } from './components/SubProductStepSelectUserParty';
import SubProductStepSelectPricingPlan from './components/subProductStepPricingPlan/SubProductStepSelectPricingPlan';
import SubProductStepUserUnrelated from './components/SubProductStepUserUnrelated';

type OnboardingPremiumUrlParams = {
  productId: string;
  subProductId: string;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function OnboardingPremiumComponent() {
  const { t } = useTranslation();
  const { subProductId, productId } = useParams<OnboardingPremiumUrlParams>();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [subProduct, setSubProduct] = useState<Product>();
  const [product, setProduct] = useState<Product>();
  const [parties, setParties] = useState<Array<SelfcareParty>>([]);
  const [selectedParty, setSelectedParty] = useState<SelfcareParty>();

  const [externalInstitutionId, _setExternalInstitutionId] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');

  const [_manager, setManager] = useState<UserOnCreate>();
  const [users, setUsers] = useState<Array<UserOnCreate>>([]);
  const [billingData, setBillingData] = useState<OnboardingFormData>();
  const [institutionType, setInstitutionType] = useState<InstitutionType>();
  const [partyId, setPartyId] = useState<string>();
  const pricingPlan = 'C0';

  const setStepAddManagerHistoryState = useHistoryState<UsersObject>('people_step2', {})[2];

  const history = useHistory();

  const [openExitModal, setOpenExitModal] = useState(false);
  const { setOnExit } = useContext(HeaderContext);
  const [onExitAction, setOnExitAction] = useState<(() => void) | undefined>();
  const requestIdRef = useRef<string>('');
  const [assistanceContacts, setAssistanceContacts] = useState<AssistanceContacts>();
  const [companyInformations, setCompanyInformations] = useState<CompanyInformations>();
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [isCityEditable, setIsCityEditable] = useState(false);

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
    requestIdRef.current = uniqueId(
      `onboarding-${externalInstitutionId}-${productId}-${subProductId}-`
    );
  }, [productId, subProductId]);

  const chooseFromMyParties = useRef(true);

  const back = () => {
    setActiveStep(activeStep - 1);
  };

  const forward = (i: number = 1) => {
    setActiveStep(activeStep + i);
  };

  const forwardWithInputs = (
    newProduct: Product,
    newSubProduct: Product,
    newParties: Array<SelfcareParty>
  ) => {
    setProduct(newProduct);
    setSubProduct(newSubProduct);
    setParties(newParties);
    setActiveStep(newSubProduct.id === 'prod-io-premium' ? 2 : 1);
  };

  const forwardWithBillingData = (newBillingData: OnboardingFormData) => {
    setBillingData(newBillingData);
    forward();
  };

  const forwardWithManagerData = (formData: any) => {
    setManager(formData.users[0]);
    setUsers(formData.users);
    setOpenConfirmationModal(true);
  };

  const forwardWithInstitution = (party: SelfcareParty, isUserParty: boolean) => {
    setSelectedParty(party);
    const event = isUserParty
      ? 'ONBOARDING_PREMIUM_ASSOCIATED_PARTY_SELECTION'
      : 'ONBOARDING_PREMIUM_PARTY_SELECTION';
    trackEvent(event, {
      party_id: party.id,
      request_id: requestIdRef.current,
      product_id: productId,
      subproduct_id: subProductId,
    });
    // eslint-disable-next-line functional/immutable-data
    chooseFromMyParties.current = isUserParty;
    forward(isUserParty ? 2 : 1);
  };

  const forwardWithOnboardingData = (
    origin: string,
    billingData?: OnboardingFormData,
    institutionType?: InstitutionType,
    partyId?: string,
    assistanceContacts?: AssistanceContacts,
    companyInformations?: CompanyInformations,
    country?: string,
    city?: string,
    county?: string
  ) => {
    setStepAddManagerHistoryState({});

    if (billingData) {
      setBillingData({
        ...billingData,
        city,
        country,
        county,
      });
    }
    if (assistanceContacts) {
      setAssistanceContacts(assistanceContacts);
    }
    if (companyInformations) {
      setCompanyInformations(companyInformations);
    }

    if (!city) {
      setIsCityEditable(true);
    }

    if (city) {
      setIsCityEditable(false);
    }

    setOrigin(origin);
    setInstitutionType(institutionType);
    setPartyId(partyId);
    forward();
  };
  const forwardWitSelectedPricingPlan = () => {
    setActiveStep(parties.length === 0 ? 3 : 2);
    window.scrollTo(0, 0);
  };

  const handleOnConfirmModal = () => {
    trackEvent('ONBOARDING_PREMIUM_UX_CONVERSION', {
      party_id: partyId,
      selected_plan: pricingPlan === 'C0' ? 'consumo' : 'carnet',
    });
    setOpenConfirmationModal(false);
    forward();
  };

  const steps: Array<StepperStep> = [
    {
      label: 'Verify Inputs',
      Component: () =>
        SubProductStepVerifyInputs({
          requestId: requestIdRef.current,
          productId,
          subProductId,
          setLoading,
          forward: forwardWithInputs,
        }),
    },
    {
      label: 'Select Pricing Plan',
      Component: () =>
        SubProductStepSelectPricingPlan({
          setAvailablePricingPlanIds: undefined,
          forward: forwardWitSelectedPricingPlan,
          product,
        }),
    },
    {
      label: 'Select Institution releated',
      Component: () =>
        SubProductStepSelectUserParty({
          parties,
          subProductId,
          productId,
          forward: (party?: SelfcareParty) => {
            if (party) {
              forwardWithInstitution(party, true);
            } else {
              forward();
            }
          },
          back: () => {
            setActiveStep(0);
          },
        }),
    },
    {
      label: 'Select Institution unreleated',
      Component: () => SubProductStepUserUnrelated({ product, productId }),
    },
    {
      label: 'Get Onboarding Data',
      Component: () =>
        StepOnboardingData({
          productId,
          partyId: selectedParty?.id,
          forward: forwardWithOnboardingData,
          subProductFlow: true,
        }),
    },
    {
      label: 'Insert Billing Data',
      Component: () =>
        StepOnboardingFormData({
          productId,
          subProductId: subProduct?.id,
          selectedProduct: subProduct,
          externalInstitutionId,
          isCityEditable,
          initialFormData: {
            ...(billingData ?? {
              businessName: '',
              registeredOffice: '',
              zipCode: '',
              digitalAddress: '',
              taxCode: '',
              vatNumber: '',
              recipientCode: '',
              geographicTaxonomies: [],
              city: '',
              county: '',
              country: '',
            }),
            ...assistanceContacts,
            ...companyInformations,
          },
          institutionType: institutionType as InstitutionType,
          origin,
          subtitle: (
            <Trans i18nKey="onboardingSubProduct.billingData.subTitle" components={{ 1: <br /> }}>
              {`Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti. <1 />Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`}
            </Trans>
          ),
          forward: forwardWithBillingData,
          back: () => {
            if (window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1) {
              setOnExitAction(() => window.location.assign(`${ENV.URL_FE.DASHBOARD}/${partyId}`));
              setOpenExitModal(true);
            } else {
              setActiveStep(2);
              window.scrollTo(0, 0);
            }
          },
        }),
    },
    {
      label: 'Insert Manager',
      Component: () =>
        StepAddManager({
          readOnly: false,
          externalInstitutionId,
          addUserFlow: false,
          product,
          setOutcome: () => {},
          forward: forwardWithManagerData,
          back: () => {
            if (window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1) {
              setOnExitAction(() =>
                window.location.assign(`${ENV.URL_FE.DASHBOARD}/${externalInstitutionId}`)
              );
              setOpenExitModal(true);
            } else {
              back();
            }
          },
          subProduct,
        }),
    },
    {
      label: 'Submit',
      Component: () =>
        SubProductStepSubmit({
          requestId: requestIdRef.current,
          product: product as Product,
          subProduct: subProduct as Product,
          externalInstitutionId,
          users,
          billingData: billingData as OnboardingFormData,
          institutionType: institutionType as InstitutionType,
          pricingPlan,
          origin,
          setLoading,
          forward,
          back,
        }),
    },
    {
      label: 'Success',
      Component: () => SubProductStepSuccess(),
    },
  ];

  const Step = useMemo(() => steps[activeStep].Component, [activeStep, subProduct, parties]);

  const handleCloseExitModal = () => {
    setOpenExitModal(false);
    setOnExitAction(undefined);
  };

  return (
    <Container sx={{ px: '0px !important', maxWidth: '100% !important' }}>
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
        title={t('onboardingSubProduct.exitModal.title')}
        message={t('onboardingSubProduct.exitModal.message')}
        onConfirmLabel={t('onboardingSubProduct.exitModal.backButton')}
        onCloseLabel={t('onboardingSubProduct.exitModal.cancelButton')}
      />
      <ConfirmOnboardingModal
        open={openConfirmationModal}
        handleClose={() => setOpenConfirmationModal(false)}
        partyName={selectedParty?.description}
        onConfirm={handleOnConfirmModal}
        productName={subProduct?.title}
      />
      {loading && <LoadingOverlay loadingText={t('onboardingSubProduct.loading.loadingText')} />}
    </Container>
  );
}

export default withLogin(OnboardingPremiumComponent);
