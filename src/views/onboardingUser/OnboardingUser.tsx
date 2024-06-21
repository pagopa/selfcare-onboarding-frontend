import Container from '@mui/material/Container';
import { useParams } from 'react-router';
import { useLocation, useHistory } from 'react-router-dom';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { EndingPage, SessionModal } from '@pagopa/selfcare-common-frontend';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { Trans, useTranslation } from 'react-i18next';
import { withLogin } from '../../components/withLogin';
import {
  InstitutionType,
  Product,
  RequestOutcomeMessage,
  RequestOutcomeOptions,
  StepperStep,
  UserOnCreate,
} from '../../../types';
import { OnBoardingProductStepDelegates } from '../onboardingProduct/components/OnBoardingProductStepDelegates';
import { StepAddManager } from '../../components/steps/StepAddManager';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { HeaderContext, UserContext } from '../../lib/context';
import { ENV } from '../../utils/env';
import { MessageNoAction } from '../../components/MessageNoAction';
import { unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { selected2OnboardingData } from '../../utils/selected2OnboardingData';
import { StepSelectProduct } from './components/StepSelectProduct';

type OnboardingUserUrlParams = {
  productId: string;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function OnboardingUserComponent() {
  const { productId } = useParams<OnboardingUserUrlParams>();
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  const requestIdRef = useRef<string>();

  const [_loading, setLoading] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [selectedParty, setSelectedParty] = useState<any>(); // TODO Add correct model
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [onboardingFormData, setOnboardingFormData] = useState<OnboardingFormData>();
  const [onExitAction, setOnExitAction] = useState<(() => void) | undefined>();
  const [openExitModal, setOpenExitModal] = useState(false);

  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const institutionType = new URLSearchParams(window.location.search).get(
    'institutionType'
  ) as InstitutionType;

  const isTechPartner = institutionType === 'PT';

  const forwardWithData = (newFormData: Partial<FormData>) => {
    if (formData) {
      setFormData({ ...formData, ...newFormData });
    } else {
      setFormData(newFormData);
    }
    forward();
  };

  useEffect(() => {
    if ((location.state as any)?.data) {
      setSelectedParty((location.state as any).data.party);
      setSelectedProduct((location.state as any).data.product); // TODO FIX THIS
    }
  }, [(location.state as any)?.data]);

  useEffect(() => {
    if (selectedParty) {
      history.replace({
        ...history.location,
        state: null,
      });
      // TODO Can be removed?
      const onboardingData = selected2OnboardingData(selectedParty);
      setOnboardingFormData(onboardingData);
      setActiveStep(1);
    }
  }, [selectedParty, history]);

  const back = () => {
    setActiveStep(activeStep - 1);
  };

  const forward = () => {
    setActiveStep(activeStep + 1);
  };

  const addUserRequest = async (users: Array<UserOnCreate>) => {
    setLoading(true);
    const addUserResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_NEW_USER' },
      {
        method: 'POST',
        data: {
          productId,
          institutionType,
          origin,
          originId: onboardingFormData?.originId,
          subunitCode: selectedParty.codiceUniUo
            ? selectedParty.codiceUniUo
            : selectedParty.codiceUniAoo, // TODO CHECK THIS
          taxCode: onboardingFormData?.taxCode,
          users,
        },
      },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    const outcome = getFetchOutcome(addUserResponse);

    setOutcome(outcomeContent[outcome]);

    trackEvent(outcome === 'success' ? 'ONBOARDING_USER_SUCCESS' : 'ONBOARDING_USER_ERROR', {
      request_id: requestIdRef.current,
      party_id: selectedParty?.externalId,
      product_id: productId,
    });
  };

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      title: '',
      description: [
        <>
          <EndingPage
            minHeight="52vh"
            icon={<IllusCompleted size={60} />}
            title={t('onboarding.success.flow.user.title')}
            description={
              <Trans
                i18nKey="onboarding.success.flow.user.description"
                components={{ 1: <br />, 3: <br /> }}
              >
                {`Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’operazione.`}
              </Trans>
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

  const steps: Array<StepperStep> = [
    {
      label: 'Select product',
      Component: () => StepSelectProduct({ back, forward }),
    },
    {
      label: 'Insert manager data',
      Component: () =>
        StepAddManager({
          externalInstitutionId: selectedParty?.externalId,
          addUserFlow: true,
          product: selectedProduct,
          isTechPartner,
          forward: (newFormData: Partial<FormData>) => {
            trackEvent('ONBOARDING_ADD_MANAGER', {
              request_id: requestIdRef.current,
              party_id: selectedParty?.externalId,
              product_id: productId,
            });
            forwardWithData(newFormData);
          },
          back,
        }),
    },
    {
      label: 'Insert admin data',
      Component: () =>
        OnBoardingProductStepDelegates({
          externalInstitutionId: selectedParty?.externalId,
          addUserFlow: true,
          product: selectedProduct,
          legal: isTechPartner ? undefined : (formData as any)?.users[0],
          partyName: selectedParty?.description || '',
          isTechPartner,
          forward: (newFormData: Partial<FormData>) => {
            const users = ((newFormData as any).users as Array<UserOnCreate>).map((u) => ({
              ...u,
              taxCode: u?.taxCode.toUpperCase(),
              email: u?.email.toLowerCase(),
            }));

            setFormData({ ...formData, ...newFormData });
            trackEvent('ONBOARDING_ADD_DELEGATE', {
              request_id: requestIdRef.current,
              party_id: selectedParty?.externalId,
              product_id: productId,
            });
            addUserRequest(users).catch(() => {
              trackEvent('ONBOARDING_ADD_NEW_USER', {
                request_id: requestIdRef.current,
                party_id: selectedParty?.externalId,
                product_id: productId,
              });
            });
          },
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

  return outcome ? (
    <MessageNoAction {...outcome} />
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
    </Container>
  );
}

export default withLogin(OnboardingUserComponent);
