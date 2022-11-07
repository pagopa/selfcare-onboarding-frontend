import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Container } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { useParams } from 'react-router';
import { useTranslation, Trans } from 'react-i18next';
import { withLogin } from '../../components/withLogin';
import {
  BillingData,
  InstitutionType,
  SelfcareParty,
  Product,
  StepperStep,
  UserOnCreate,
  Party,
} from '../../../types';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ENV } from '../../utils/env';
import { HeaderContext } from '../../lib/context';
import { StepAddManager, UsersObject } from '../../components/steps/StepAddManager';
import { StepSearchParty } from '../../components/steps/StepSearchParty';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepBillingData from '../../components/steps/StepBillingData';
import { registerUnloadEvent, unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { useHistoryState } from '../../components/useHistoryState';
import SubProductStepVerifyInputs from './components/SubProductStepVerifyInputs';
import SubProductStepSubmit from './components/SubProductStepSubmit';
import SubProductStepSuccess from './components/SubProductStepSuccess';
import { SubProductStepSelectUserParty } from './components/SubProductStepSelectUserParty';
import SubProductStepOnBoardingStatus from './components/SubProductStepOnBoardingStatus';

type OnBoardingSubProductUrlParams = {
  productId: string;
  subProductId: string;
};

function OnBoardingSubProduct() {
  const { t } = useTranslation();
  const { subProductId, productId } = useParams<OnBoardingSubProductUrlParams>();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [subProduct, setSubProduct] = useState<Product>();
  const [product, setProduct] = useState<Product>();
  const [parties, setParties] = useState<Array<SelfcareParty>>([]);

  const [externalInstitutionId, setExternalInstitutionId] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');

  const [_manager, setManager] = useState<UserOnCreate>();
  const [users, setUsers] = useState<Array<UserOnCreate>>([]);
  const [billingData, setBillingData] = useState<BillingData>();
  const [institutionType, setInstitutionType] = useState<InstitutionType>();
  const [partyId, setPartyId] = useState<string>();
  const [pricingPlan, setPricingPlan] = useState<string>();

  const setStepAddManagerHistoryState = useHistoryState<UsersObject>('people_step2', {})[2];

  const history = useHistory();

  const [openExitModal, setOpenExitModal] = useState(false);
  const { setOnExit } = useContext(HeaderContext);
  const [onExitAction, setOnExitAction] = useState<(() => void) | undefined>();
  const requestIdRef = useRef<string>('');

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
    newParties: Array<SelfcareParty>,
    newPricingPlan: string
  ) => {
    setProduct(newProduct);
    setSubProduct(newSubProduct);
    setParties(newParties);
    setPricingPlan(newPricingPlan);
    setActiveStep(newParties.length === 0 ? 2 : 1);
  };

  const forwardWithBillingData = (newBillingData: BillingData) => {
    trackEvent('ONBOARDING_PREMIUM_BILLING_DATA', {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
      subproduct_id: subProductId,
    });
    setBillingData(newBillingData);
    forward();
  };

  const forwardWithManagerData = (formData: any) => {
    setManager(formData.users[0]);
    setUsers(formData.users);
    trackEvent('ONBOARDING_PREMIUM_ADD_MANAGER', {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
      subproduct_id: subProductId,
    });
    forward();
  };

  const forwardWithInstitution = (party: Party, isUserParty: boolean) => {
    setExternalInstitutionId(party.externalId);
    setOrigin(party.origin);
    setBillingData({
      businessName: party.description,
      registeredOffice: party.address,
      zipCode: party.zipCode,
      digitalAddress: party.digitalAddress,
      taxCode: party.taxCode,
      vatNumber: '',
      recipientCode: party.origin === 'IPA' ? party.originId : '',
    });
    const event = isUserParty
      ? 'ONBOARDING_PREMIUM_ASSOCIATED_PARTY_SELECTION'
      : 'ONBOARDING_PREMIUM_PARTY_SELECTION';
    trackEvent(event, {
      party_id: party.externalId,
      request_id: requestIdRef.current,
      product_id: productId,
      subproduct_id: subProductId,
    });
    // eslint-disable-next-line functional/immutable-data
    chooseFromMyParties.current = isUserParty;
    forward(isUserParty ? 2 : 1);
  };

  const forwardWithOnboardingData = (
    manager?: UserOnCreate,
    billingData?: BillingData,
    institutionType?: InstitutionType,
    partyId?: string
  ) => {
    setManager(manager);
    if (manager) {
      setStepAddManagerHistoryState({ LEGAL: manager });
    } else {
      setStepAddManagerHistoryState({});
    }
    if (billingData) {
      setBillingData(billingData);
    }
    setInstitutionType(institutionType);
    setPartyId(partyId);
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
      label: 'Select Institution releated',
      Component: () =>
        SubProductStepSelectUserParty({
          parties,
          forward: (party?: Party) => {
            if (party) {
              forwardWithInstitution(party, true);
            } else {
              forward();
            }
          },
          back,
        }),
    },
    {
      label: 'Select Institution unreleated',
      Component: () =>
        StepSearchParty({
          subTitle: (
            <Trans i18nKey="onBoardingSubProduct.selectUserPartyStep.IPAsubTitle">
              Seleziona dall&apos;Indice della Pubblica Amministrazione (IPA) l&apos;ente
              <br /> per cui vuoi richiedere l&apos;adesione a{' '}
              {{
                baseProduct: product?.title,
              }}{' '}
              Premium.
            </Trans>
          ),
          product: subProduct,
          forward: (_: any, party: Party) => forwardWithInstitution(party, false),
          back: parties.length > 0 ? back : undefined,
        }),
    },
    {
      label: 'Verify OnBoarding Status',
      Component: () =>
        SubProductStepOnBoardingStatus({
          externalInstitutionId,
          productId,
          productTitle: (product as Product).title,
          subProductId,
          forward,
          back: () => {
            setActiveStep(activeStep - 2);
          },
        }),
    },
    {
      label: 'Get Onboarding Data',
      Component: () =>
        StepOnboardingData({
          externalInstitutionId,
          productId,
          forward: forwardWithOnboardingData,
        }),
    },
    {
      label: 'Insert Billing Data',
      Component: () =>
        StepBillingData({
          productId,
          selectedProduct: subProduct,
          setExternalInstitutionId,
          externalInstitutionId,
          initialFormData: billingData ?? {
            businessName: '',
            registeredOffice: '',
            zipCode: '',
            digitalAddress: '',
            taxCode: '',
            vatNumber: '',
            recipientCode: '',
          },
          institutionType: institutionType as InstitutionType,
          origin,
          subtitle: t('onBoardingSubProduct.billingData.subTitle'),
          forward: forwardWithBillingData,
          back: () => {
            if (window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1) {
              setOnExitAction(() => window.location.assign(`${ENV.URL_FE.DASHBOARD}/${partyId}`));
              setOpenExitModal(true);
            } else {
              setActiveStep(chooseFromMyParties.current ? 1 : 2);
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
          product,
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
          billingData: billingData as BillingData,
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
        title={t('onBoardingSubProduct.exitModal.title')}
        message={t('onBoardingSubProduct.exitModal.message')}
        onConfirmLabel={t('onBoardingSubProduct.exitModal.backButton')}
        onCloseLabel={t('onBoardingSubProduct.exitModal.cancelButton')}
      />
      {loading && <LoadingOverlay loadingText={t('onBoardingSubProduct.loading.loadingText')} />}
    </Container>
  );
}

export default withLogin(OnBoardingSubProduct);
