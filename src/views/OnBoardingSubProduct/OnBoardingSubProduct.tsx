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
  OrganizationType,
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

  const [institutionId, setInstitutionId] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');

  const [manager, setManager] = useState<UserOnCreate>();
  const [billingData, setBillingData] = useState<BillingData>();
  const [organizationType, setOrganizationType] = useState<OrganizationType>();
  const [pricingPlan, setPricingPlan] = useState<string>('');
  const setStepAddManagerHistoryState = useHistoryState<UsersObject>('people_step2', {})[2];

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

  const forwardWithInputs = (
    product: Product,
    subProduct: Product,
    parties: Array<SelfcareParty>,
    pricingPlan: string
  ) => {
    setProduct(product);
    setSubProduct(subProduct);
    setParties(parties);
    setPricingPlan(pricingPlan);
    forward(parties.length === 0 ? 2 : 1);
  };

  const forwardWithBillingData = () => {
    trackEvent('ONBOARDING_DATI_FATTURAZIONE', {
      party_id: institutionId,
      request_id: requestIdRef.current,
    });
    setBillingData(billingData);
    forward();
  };

  const forwardWithManagerData = (formData: any) => {
    setManager(formData.users[0]);
    trackEvent('ONBOARDING_LEGALE_RAPPRESENTANTE', {
      party_id: institutionId,
      request_id: requestIdRef.current,
    });
    forward();
  };

  const forwardWithInstitution = (party: Party, isUserParty: boolean) => {
    setInstitutionId(party.institutionId);
    setOrigin(party.origin);
    setBillingData({
      businessName: party.description,
      registeredOffice: party.address,
      mailPEC: party.digitalAddress,
      taxCode: party.taxCode,
      vatNumber: '',
      recipientCode: party.origin === 'IPA' ? party.institutionId : '',
    });
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
    if (manager) {
      setStepAddManagerHistoryState({ LEGAL: manager });
    } else {
      setStepAddManagerHistoryState({});
    }
    if (billingData) {
      setBillingData(billingData);
    }
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
            <Trans i18nKey="onBoardingSubProduct.selectUserPartyStep.subTitle">
              Seleziona l&apos;ente per il quale stai richiedendo la sottoscrizione <br />
              all&apos;offerta Premium
            </Trans>
          ),
          product: subProduct,
          forward: (_: any, party: Party) => forwardWithInstitution(party, false),
          back,
        }),
    },
    {
      label: 'Verify OnBoarding Status',
      Component: () =>
        SubProductStepOnBoardingStatus({
          institutionId,
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
          institutionId,
          productId,
          forward: forwardWithOnboardingData,
        }),
    },
    {
      label: 'Insert Billing Data',
      Component: () =>
        StepBillingData({
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
          origin,
          subtitle: t('onBoardingSubProduct.billingData.subTitle'),
          forward: forwardWithBillingData,
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
        StepAddManager({
          product: subProduct,
          forward: forwardWithManagerData,
          back: () => {
            if (window.location.search.indexOf(`institutionId=${institutionId}`) > -1) {
              setOpenExitUrl(`${ENV.URL_FE.DASHBOARD}/${institutionId}`);
              setOpenExitModal(true);
            } else {
              back();
            }
          },
        }),
    },
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
          institutionType: organizationType as OrganizationType,
          pricingPlan,
          setLoading,
          forward,
          back,
          origin,
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
