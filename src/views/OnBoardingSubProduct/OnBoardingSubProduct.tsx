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
  Party,
  Product,
  StepperStep,
  UserOnCreate,
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
  const [billingData, setBillingData] = useState<BillingData>();
  const [institutionType, setInstitutionType] = useState<InstitutionType>();
  const [partyId, setPartyId] = useState<string>();
  const [pricingPlan, setPricingPlan] = useState<string>();

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
    trackEvent('ONBOARDING_DATI_FATTURAZIONE', {
      party_id: externalInstitutionId,
      request_id: requestIdRef.current,
    });
    setBillingData(newBillingData);
    forward();
  };

  const forwardWithManagerData = (formData: any) => {
    setManager(formData.users[0]);
    trackEvent('ONBOARDING_LEGALE_RAPPRESENTANTE', {
      party_id: externalInstitutionId,
      request_id: requestIdRef.current,
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
    trackEvent('ONBOARDING_SELEZIONE_ENTE', {
      party_id: externalInstitutionId,
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
            <Trans i18nKey="onBoardingSubProduct.selectUserPartyStep.subTitle">
              Seleziona l&apos;ente per il quale stai richiedendo la sottoscrizione <br />
              all&apos;offerta Premium
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
              setOpenExitUrl(`${ENV.URL_FE.DASHBOARD}/${partyId}`);
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
          readOnly: true,
          product: subProduct,
          forward: forwardWithManagerData,
          back: () => {
            if (window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1) {
              setOpenExitUrl(`${ENV.URL_FE.DASHBOARD}/${externalInstitutionId}`);
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
          externalInstitutionId,
          users: [], // manager as UserOnCreate not more to be send
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
