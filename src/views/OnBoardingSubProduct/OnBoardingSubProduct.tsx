import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Container } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { withLogin } from '../../components/withLogin';
import {
  BillingData,
  OrganizationType,
  Party,
  Product,
  StepperStep,
  UserOnCreate,
} from '../../../types';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ENV } from '../../utils/env';
import { HeaderContext } from '../../lib/context';
import { OnboardingStep2 } from '../../components/OnboardingStep2';
import { OnboardingStep1 } from '../../components/OnboardingStep1';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepBillingData from '../../components/steps/StepBillingData';
import { registerUnloadEvent, unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
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
  const [parties, setParties] = useState<Array<Party>>([]);

  const [institutionId, setInstitutionId] = useState<string>('');
  const [manager, setManager] = useState<UserOnCreate>();
  const [billingData, setBillingData] = useState<BillingData>();
  const [organizationType, setOrganizationType] = useState<OrganizationType>();

  const history = useHistory();

  const [openExitModal, setOpenExitModal] = useState(false);
  const [openExitUrl, setOpenExitUrl] = useState(ENV.URL_FE.LOGOUT);
  const { setOnLogout } = useContext(HeaderContext);

  const requestIdRef = useRef<string>('');

  useEffect(() => {
    registerUnloadEvent(setOnLogout, setOpenExitModal);
    return () => unregisterUnloadEvent(setOnLogout);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    Object.assign(history.location, { state: undefined });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = uniqueId(`onboarding-${institutionId}-${productId}-${subProductId}-`);
  }, [productId, subProductId]);

  const chooseFromMyParties = useRef(true);

  const back = () => {
    setActiveStep(activeStep - 1);
  };

  const forward = (i: number = 1) => {
    setActiveStep(activeStep + i);
  };

  const forwardWithInputs = (product: Product, subProduct: Product, parties: Array<Party>) => {
    setProduct(product);
    setSubProduct(subProduct);
    setParties(parties);
    forward(parties.length === 0 ? 2 : 1);
  };

  const forwardWithInstitutionId = (institutionId: string, isUserParty: boolean) => {
    setInstitutionId(institutionId);
    trackEvent('ONBOARDING_SELEZIONE_ENTE', {
      party_id: institutionId,
      request_id: requestIdRef.current,
      product_id: productId,
      subProduct_id: subProductId,
    });
    // eslint-disable-next-line functional/immutable-data
    chooseFromMyParties.current = isUserParty;
    forward(isUserParty ? 2 : 1);
  };

  const forwardWithOnboardingData = (
    manager?: UserOnCreate,
    billingData?: BillingData,
    organizationType?: OrganizationType
  ) => {
    setManager(manager);
    setBillingData(billingData);
    setOrganizationType(organizationType);
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
          forward: (institutionId?: string) => {
            if (institutionId) {
              forwardWithInstitutionId(institutionId, true);
            } else {
              forward();
            }
          },
        }),
    },
    {
      label: 'Select Institution unreleated',
      Component: () =>
        OnboardingStep1({
          product: subProduct,
          forward: (_: any, institutionId: string) =>
            forwardWithInstitutionId(institutionId, false),
        }),
    },
    {
      label: 'Verify OnBoarding Status',
      Component: () =>
        SubProductStepOnBoardingStatus({
          institutionId,
          productId,
          subProductId,
          forward,
        }),
    },
    {
      label: 'Get Onboarding Data',
      Component: () =>
        StepOnboardingData({
          institutionId,
          productId,
          forward: forwardWithOnboardingData,
        }),
    },
    {
      label: 'Insert Billing Data',
      Component: () =>
        StepBillingData({
          // product: subProduct,
          institutionId,
          initialFormData: billingData ?? {
            businessName: '',
            registeredOffice: '',
            mailPEC: '',
            taxCode: '',
            vatNumber: '',
            recipientCode: '',
            publicServices: organizationType === 'GSP' ? false : undefined,
          },
          organizationType: organizationType as OrganizationType,
          subtitle: t('onBoardingSubProduct.billingData.subTitle'),
          forward: () => {
            trackEvent('ONBOARDING_DATI_FATTURAZIONE', {
              party_id: institutionId,
              request_id: requestIdRef.current,
            });
            forward();
          },
          back: () => {
            if (window.location.search.indexOf(`institutionId=${institutionId}`) > -1) {
              setOpenExitUrl(`${ENV.URL_FE.DASHBOARD}/${institutionId}`);
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
        OnboardingStep2({
          product: subProduct,
          forward: () => {
            // TODO
            trackEvent('ONBOARDING_LEGALE_RAPPRESENTANTE', {
              party_id: institutionId,
              request_id: requestIdRef.current,
            });
            forward();
          },
          back,
        }),
    },

    // TODO Puts Step Here
    {
      label: 'Submit',
      Component: () =>
        SubProductStepSubmit({
          requestId: requestIdRef.current,
          product: product as Product,
          subProduct: subProduct as Product,
          institutionId,
          users: [manager as UserOnCreate],
          billingData: billingData as BillingData,
          organizationType: organizationType as OrganizationType,
          setLoading,
          forward,
        }),
    },
    {
      label: 'Success',
      Component: () => SubProductStepSuccess(),
    },
  ];

  const Step = useMemo(() => steps[activeStep].Component, [activeStep]);

  const handleCloseExitModal = () => {
    setOpenExitModal(false);
    setOpenExitUrl(ENV.URL_FE.LOGOUT);
  };

  return (
    <Container>
      <Step />
      <SessionModal
        handleClose={handleCloseExitModal}
        handleExit={handleCloseExitModal}
        onConfirm={() => {
          unregisterUnloadEvent(setOnLogout);
          window.location.assign(openExitUrl);
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
