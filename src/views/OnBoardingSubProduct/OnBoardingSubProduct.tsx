import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Container } from '@mui/material';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { useParams } from 'react-router';
import { withLogin } from '../../components/withLogin';
import { Product, StepperStep, UserOnCreate } from '../../../types';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ENV } from '../../utils/env';
import { HeaderContext } from '../../lib/context';
import { registerUnloadEvent, unregisterUnloadEvent } from '../Onboarding';
import SubProductStepVerifyInputs from './components/SubProductStepVerifyInputs';
import SubProductStepSubmit from './components/SubProductStepSubmit';
import SubProductStepSuccess from './components/SubProductStepSuccess';
import { SubProductStepSelection } from './components/SubProductStepSelect';

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

  const forward = () => {
    setActiveStep(activeStep + 1);
  };

  const forwardWithProducts = (product: Product, subProduct: Product) => {
    setProduct(product);
    setSubProduct(subProduct);
    forward();
  };

  const forwardWithInstitutionId = (institutionId: string) => {
    setInstitutionId(institutionId);
    trackEvent('ONBOARDING_SELEZIONE_ENTE', {
      party_id: institutionId,
      request_id: requestIdRef.current,
      product_id: productId,
      subProduct_id: subProductId,
    });
    forward();
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
          forward: forwardWithProducts,
        }),
    },
    {
      label: 'Select Institution',
      Component: () =>
        SubProductStepSelection({
          product,
          forward: forwardWithInstitutionId,
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
