import { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Stack, Typography, Grid, useTheme } from '@mui/material';
import { AxiosError, AxiosResponse } from 'axios';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import { uniqueId } from 'lodash';
import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { withLogin } from '../../components/withLogin';
import {
  BillingData,
  InstitutionType,
  Product,
  RequestOutcome,
  RequestOutcomeOptions,
  Party,
  StepperStep,
  UserOnCreate,
} from '../../../types';
import { StepSearchParty } from '../../components/steps/StepSearchParty';
import { StepAddManager } from '../../components/steps/StepAddManager';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { MessageNoAction } from '../../components/MessageNoAction';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { ENV } from '../../utils/env';
import { HeaderContext, UserContext } from '../../lib/context';
import NoProductPage from '../NoProductPage';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepBillingData from '../../components/steps/StepBillingData';
import { registerUnloadEvent, unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import StepInstitutionType from '../../components/steps/StepInstitutionType';
import { OnboardingStep1_5 } from './components/OnboardingStep1_5';
import { OnBoardingProductStepDelegates } from './components/OnBoardingProductStepDelegates';

// eslint-disable-next-line sonarjs/cognitive-complexity
function OnboardingComponent({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [externalInstitutionId, setExternalInstitutionId] = useState<string>('');
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const history = useHistory();
  const [openExitModal, setOpenExitModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();
  const [openExitUrl, setOpenExitUrl] = useState(ENV.URL_FE.LOGOUT);
  const [billingData, setBillingData] = useState<BillingData>();
  const [institutionType, setInstitutionType] = useState<InstitutionType>();
  const [partyId, setPartyId] = useState<string>();
  const [origin, setOrigin] = useState<string>('');
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();
  const theme = useTheme();

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
    requestIdRef.current = uniqueId(`onboarding-${externalInstitutionId}-${productId}-`);
    void checkProductId().finally(() => {
      setLoading(false);
    });
  }, [productId]);

  const checkProductId = async () => {
    const onboardingProducts = await fetchWithLogs(
      { endpoint: 'ONBOARDING_VERIFY_PRODUCT', endpointParams: { productId } },
      { method: 'GET' },
      () => setRequiredLogin(true)
    );
    const result = getFetchOutcome(onboardingProducts);

    if (result === 'success') {
      const product = (onboardingProducts as AxiosResponse).data;
      setSelectedProduct(product);
    } else if ((onboardingProducts as AxiosError).response?.status === 404) {
      unregisterUnloadEvent(setOnLogout);
      setSelectedProduct(null);
    } else {
      console.error('Unexpected response', (onboardingProducts as AxiosError).response);
      unregisterUnloadEvent(setOnLogout);
      setSelectedProduct(null);
    }
  };

  const back = () => {
    setActiveStep(activeStep - 1);
  };

  const forward = () => {
    setActiveStep(activeStep + 1);
  };

  const forwardWithData = (newFormData: Partial<FormData>) => {
    setFormData({ ...formData, ...newFormData });
    forward();
  };

  const forwardWithDataAndInstitution = (newFormData: Partial<FormData>, party: Party) => {
    setExternalInstitutionId(party.externalId);
    setOrigin(party.origin);
    setBillingData({
      businessName: party.description,
      registeredOffice: party.address,
      digitalAddress: party.digitalAddress,
      taxCode: party.taxCode,
      vatNumber: '',
      recipientCode: party.origin === 'IPA' ? party.originId : '',
    });
    forwardWithData(newFormData);
    trackEvent('ONBOARDING_SELEZIONE_ENTE', {
      party_id: externalInstitutionId,
      request_id: requestIdRef.current,
      product_id: productId,
    });
  };

  const forwardWithBillingData = (newBillingData: BillingData) => {
    trackEvent('ONBOARDING_DATI_FATTURAZIONE', {
      party_id: externalInstitutionId,
      request_id: requestIdRef.current,
    });
    setBillingData(newBillingData);
    forward();
  };

  const submit = async (users: Array<UserOnCreate>) => {
    setLoading(true);
    const postLegalsResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_POST_LEGALS', endpointParams: { externalInstitutionId, productId } },
      { method: 'POST', data: { billingData, institutionType, origin, users } },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const outcome = getFetchOutcome(postLegalsResponse);

    setOutcome(outcome);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_SEND_SUCCESS', {
        party_id: externalInstitutionId,
        request_id: requestIdRef.current,
        product_id: productId,
      });
    } else if (outcome === 'error') {
      trackEvent('ONBOARDING_SEND_FAILURE', {
        party_id: externalInstitutionId,
        request_id: requestIdRef.current,
        product_id: productId,
      });
    }
  };

  const forwardWithOnboardingData = (
    _manager: BillingData,
    billingData?: BillingData,
    institutionType?: InstitutionType,
    partyId?: string
  ) => {
    if (billingData) {
      setBillingData(billingData);
    }
    setInstitutionType(institutionType);
    setPartyId(partyId);
    forward();
  };

  const forwardWithInstitutionType = (newInstitutionType: InstitutionType) => {
    trackEvent('ONBOARDING_TIPO_ENTE', {
      party_id: externalInstitutionId,
      request_id: requestIdRef.current,
    });
    setInstitutionType(newInstitutionType);
    forward();
  };

  const steps: Array<StepperStep> = [
    {
      label: "Seleziona l'ente",
      Component: () =>
        StepSearchParty({
          subTitle: (
            <Trans i18nKey="onboardingStep1.onboarding.bodyDescription">
              Seleziona dall&apos;Indice della Pubblica Amministrazione (IPA) l&apos;ente
              <br />
              per cui vuoi richiedere l&apos; adesione a {{ productTitle: selectedProduct?.title }}
            </Trans>
          ),
          product: selectedProduct,
          forward: forwardWithDataAndInstitution,
        }),
    },
    {
      label: 'Verifica ente',
      Component: () =>
        OnboardingStep1_5({
          product: selectedProduct,
          forward,
          externalInstitutionId,
          productId,
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
      label: 'Seleziona il tipo di ente',
      Component: () =>
        StepInstitutionType({
          institutionType: institutionType as InstitutionType,
          forward: forwardWithInstitutionType,
          back: () => {
            if (window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1) {
              setOpenExitUrl(`${ENV.URL_FE.DASHBOARD}/${partyId}`);
              setOpenExitModal(true);
            } else {
              setActiveStep(0);
            }
          },
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
            digitalAddress: '',
            taxCode: '',
            vatNumber: '',
            recipientCode: '',
          },
          origin,
          institutionType: institutionType as InstitutionType,
          subtitle: t('onBoardingSubProduct.billingData.subTitle'),
          forward: forwardWithBillingData,
          back,
        }),
    },
    {
      label: 'Inserisci i dati del rappresentante legale',
      Component: () =>
        StepAddManager({
          product: selectedProduct,
          forward: (newFormData: Partial<FormData>) => {
            trackEvent('ONBOARDING_LEGALE_RAPPRESENTANTE', {
              party_id: externalInstitutionId,
              request_id: requestIdRef.current,
            });
            forwardWithData(newFormData);
          },
          back,
        }),
    },
    {
      label: 'Inserisci i dati degli amministratori',
      Component: () =>
        OnBoardingProductStepDelegates({
          product: selectedProduct,
          legal: (formData as any).users[0],
          forward: (newFormData: Partial<FormData>) => {
            setFormData({ ...formData, ...newFormData });
            trackEvent('ONBOARDING_REFERENTE_AMMINISTRATIVO', {
              party_id: externalInstitutionId,
              request_id: requestIdRef.current,
              product_id: productId,
            });
            submit((newFormData as any).users).catch(() => {
              trackEvent('ONBOARDING_REFERENTE_AMMINISTRATIVO', {
                party_id: externalInstitutionId,
                request_id: requestIdRef.current,
                product_id: productId,
              });
            });
          },
          back,
        }),
    },
  ];

  const Step = useMemo(() => steps[activeStep].Component, [activeStep, selectedProduct]);

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      title: '',
      description: [
        <>
          <IllusCompleted size={60} />
          <Typography
            mt={3}
            variant={'h4'}
            sx={{ color: theme.palette.text.primary, marginBottom: 1 }}
          >
            <Trans i18nKey="onboarding.outcomeContent.success.title">
              La tua richiesta è stata inviata
              <br />
              con successo
            </Trans>
          </Typography>
          <Stack key="0" spacing={4}>
            <Typography variant="body1">
              <Trans i18nKey="onboarding.outcomeContent.success.description">
                Riceverai una PEC all’indirizzo istituzionale che hai indicato.
                <br />
                Al suo interno troverai le istruzioni per completare <br />
                l&apos;adesione.
              </Trans>
            </Typography>
            <Button
              variant="contained"
              sx={{ alignSelf: 'center' }}
              onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            >
              {t('onboarding.outcomeContent.success.backActionLabel')}
            </Button>
          </Stack>
        </>,
      ],
    },
    error: {
      title: '',
      description: [
        <>
          <IllusError size={60} />
          <Grid container direction="column" key="0" mt={3}>
            <Grid container item justifyContent="center">
              <Grid item xs={5}>
                <Typography variant="h4">{t('onboarding.outcomeContent.error.title')}</Typography>
              </Grid>
            </Grid>
            <Grid container item justifyContent="center" mb={3} mt={1}>
              <Grid item xs={5}>
                <Typography variant="body1">
                  <Trans i18nKey="onboarding.outcomeContent.error.description">
                    A causa di un errore del sistema non è possibile completare la procedura.
                    <br />
                    Ti chiediamo di riprovare più tardi.
                  </Trans>
                </Typography>
              </Grid>
            </Grid>
            <Grid container item justifyContent="center">
              <Grid item xs={4}>
                <Button
                  onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
                  variant={'contained'}
                >
                  <Typography width="100%" sx={{ color: theme.palette.primary.contrastText }}>
                    {t('onboarding.outcomeContent.error.backActionLabel')}
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </>,
      ],
    },
  };

  useEffect(() => {
    if (outcome) {
      unregisterUnloadEvent(setOnLogout);
    }
  }, [outcome]);

  const handleCloseExitModal = () => {
    setOpenExitModal(false);
    setOpenExitUrl(ENV.URL_FE.LOGOUT);
  };

  return selectedProduct === null ? (
    <NoProductPage />
  ) : !outcome ? (
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
        title={t('onboarding.sessionModal.title')}
        message={t('onboarding.sessionModal.message')}
        onConfirmLabel={t('onboarding.sessionModal.onConfirmLabel')}
        onCloseLabel={t('onboarding.sessionModal.onCloseLabel')}
      />
      {loading && <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />}
    </Container>
  ) : (
    <MessageNoAction {...outcomeContent[outcome]} />
  );
}

export default withLogin(OnboardingComponent);
