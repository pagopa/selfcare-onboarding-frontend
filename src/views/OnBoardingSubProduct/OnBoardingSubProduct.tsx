import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Container } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { useParams } from 'react-router';
import { withLogin } from '../../components/withLogin';
import { Party, Product, StepperStep, UserOnCreate } from '../../../types';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ENV } from '../../utils/env';
import { HeaderContext } from '../../lib/context';
import { registerUnloadEvent, unregisterUnloadEvent } from '../Onboarding';
import { OnboardingStep2 } from '../../components/OnboardingStep2';
import { OnboardingStep1 } from '../../components/OnboardingStep1';
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
  const { subProductId, productId } = useParams<OnBoardingSubProductUrlParams>();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [subProduct, setSubProduct] = useState<Product>();
  const [product, setProduct] = useState<Product>();
  const [parties, setParties] = useState<Array<Party>>([]);

  const [institutionId, setInstitutionId] = useState<string>('');
  const [manager, _setManager] = useState<UserOnCreate>();
  const [billingData, _setBillingData] = useState<any>(); // TODO Use the correct type

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

  /*
  const back = () => {
    setActiveStep(activeStep - 1);
  };
  */

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
    forward(isUserParty ? 2 : 1);
  };

  const steps: Array<StepperStep> = [
    // TODO Put Steps Here
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
          forward,
        }),
    },
    {
      label: 'Verify OnBoarding Status',
      Component: () =>
        SubProductStepOnBoardingStatus({
          institutionId,
          productId,
          subProductId,
          forward: forwardWithInstitutionId,
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
          back: () => {
            if (window.location.search.indexOf(`institutionId=${institutionId}`) > -1) {
              setOpenExitUrl(`${ENV.URL_FE.DASHBOARD}/${institutionId}`);
              setOpenExitModal(true);
            } else {
              setActiveStep(activeStep - 2);
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
          billingData,
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
        title="Vuoi davvero uscire?"
        message="Se esci, la richiesta di adesione andrà persa."
        onConfirmLabel="Esci"
        onCloseLabel="Annulla"
      />
      {loading && <LoadingOverlay loadingText="Caricamento" />}
    </Container>
  );
}

export default withLogin(OnBoardingSubProduct);
