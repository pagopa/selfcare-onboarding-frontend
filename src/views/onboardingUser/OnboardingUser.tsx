import Container from '@mui/material/Container';
import { useLocation, useHistory } from 'react-router-dom';
import { useContext, useEffect, useMemo, useState } from 'react';
import { EndingPage, SessionModal } from '@pagopa/selfcare-common-frontend/lib';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { Trans, useTranslation } from 'react-i18next';
import { uniqueId } from 'lodash';
import { withLogin } from '../../components/withLogin';
import {
  InstitutionType,
  PartyData,
  RequestOutcomeMessage,
  RequestOutcomeOptions,
  StepperStep,
  UserOnCreate,
} from '../../../types';
import { StepAddAdmin } from '../onboardingProduct/components/StepAddAdmin';
import { StepAddManager } from '../../components/steps/StepAddManager';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { HeaderContext, UserContext } from '../../lib/context';
import { ENV } from '../../utils/env';
import { MessageNoAction } from '../../components/MessageNoAction';
import { unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { selected2OnboardingData } from '../../utils/selected2OnboardingData';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { ProductResource } from '../../model/ProductResource';
import { PRODUCT_IDS } from '../../utils/constants';
import { StepSelectProduct } from './components/StepSelectProduct';
import StepSearchOnboardedParty from './components/StepSearchOnboardedParty';

// eslint-disable-next-line sonarjs/cognitive-complexity
function OnboardingUserComponent() {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const requestId = uniqueId();

  const [loading, setLoading] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [selectedParty, setSelectedParty] = useState<PartyData>();
  const [selectedProduct, setSelectedProduct] = useState<ProductResource>();
  const [institutionType, setInstitutionType] = useState<InstitutionType>();
  const [onboardingFormData, setOnboardingFormData] = useState<OnboardingFormData>();
  const [onExitAction, setOnExitAction] = useState<(() => void) | undefined>();
  const [openExitModal, setOpenExitModal] = useState(false);

  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

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
      setSelectedProduct((location.state as any).data.product);
      setInstitutionType((location.state as any).data.institutionType);
    }
  }, [(location.state as any)?.data]);

  useEffect(() => {
    if (selectedParty) {
      history.replace({
        ...history.location,
        state: null,
      });
      const onboardingData = selected2OnboardingData(selectedParty);
      setOnboardingFormData(onboardingData);
      setActiveStep(2);
    }
  }, [selectedParty, history]);

  const back = () => {
    setActiveStep(activeStep - 1);
  };

  const forward = () => {
    setActiveStep(activeStep + 1);
  };

  const forwardWithProduct = (productSelected: ProductResource) => {
    setSelectedProduct(productSelected);
    forward();
  };

  const forwardWithInstitution = (partySelected: PartyData) => {
    setSelectedParty(partySelected);
    forward();
  };

  const onBackAction = () => {
    setSelectedProduct(undefined);
    back();
  };

  const addUserRequest = async (users: Array<UserOnCreate>) => {
    setLoading(true);

    const addUserResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_NEW_USER' },
      {
        method: 'POST',
        data: {
          productId: selectedProduct?.id,
          institutionType: onboardingFormData?.institutionType ?? institutionType,
          origin:
            (onboardingFormData?.institutionType ?? institutionType) === 'SA'
              ? 'ANAC'
              : ['PSP', 'GPU', 'PT', 'PRV'].includes(
                    (onboardingFormData?.institutionType ?? institutionType) as InstitutionType
                  ) && selectedProduct?.id !== PRODUCT_IDS.INTEROP
                ? 'SELC'
                : onboardingFormData?.origin,
          originId: onboardingFormData?.originId ?? onboardingFormData?.taxCode,
          subunitCode: selectedParty?.codiceUniUo
            ? selectedParty.codiceUniUo
            : selectedParty?.codiceUniAoo,
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
      request_id: requestId,
      party_id: selectedParty?.externalId,
      product_id: selectedProduct?.id,
      from: 'onboarding',
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
      Component: () =>
        StepSelectProduct({
          forward: forwardWithProduct,
          back,
          setLoading,
          setOutcome,
          institutionType,
        }),
    },
    {
      label: 'Search onboarded party',
      Component: () =>
        StepSearchOnboardedParty({
          selectedProduct,
          institutionType,
          forward: forwardWithInstitution,
          back: onBackAction,
        }),
    },
    {
      label: 'Insert manager data',
      Component: () =>
        StepAddManager({
          externalInstitutionId: selectedParty?.externalId ?? '',
          addUserFlow: true,
          product: selectedProduct,
          onboardingFormData,
          selectedParty,
          institutionType,
          isTechPartner,
          forward: (newFormData: Partial<FormData>) => {
            trackEvent('ONBOARDING_ADD_MANAGER', {
              request_id: requestId,
              party_id: selectedParty?.externalId,
              product_id: selectedProduct?.id,
            });
            forwardWithData(newFormData);
          },
          back,
        }),
    },
    {
      label: 'Insert admin data',
      Component: () =>
        StepAddAdmin({
          externalInstitutionId: selectedParty?.externalId ?? '',
          addUserFlow: true,
          product: selectedProduct,
          legal: isTechPartner ? undefined : (formData as any)?.users[0],
          partyName: selectedParty?.codiceUniAoo
            ? selectedParty.denominazioneAoo
            : selectedParty?.codiceUniUo
              ? selectedParty.descrizioneUo
              : selectedParty?.businessName
                ? selectedParty.businessName
                : (selectedParty?.description ?? ''),
          isTechPartner,
          forward: (newFormData: Partial<FormData>) => {
            const users = ((newFormData as any).users as Array<UserOnCreate>).map((u) => ({
              ...u,
              taxCode: u?.taxCode.toUpperCase(),
              email: u?.email.toLowerCase(),
            }));

            setFormData({ ...formData, ...newFormData });
            trackEvent('ONBOARDING_ADD_DELEGATE', {
              request_id: requestId,
              party_id: selectedParty?.externalId,
              product_id: selectedProduct?.id,
            });
            addUserRequest(users).catch(() => {
              trackEvent('ONBOARDING_ADD_NEW_USER', {
                request_id: requestId,
                party_id: selectedParty?.externalId,
                product_id: selectedProduct?.id,
                from: 'onboarding',
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
      {loading && <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />}
    </Container>
  );
}

export default withLogin(OnboardingUserComponent);
