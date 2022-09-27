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
  RequestOutcomeOptions,
  Party,
  StepperStep,
  UserOnCreate,
  Problem,
  RequestOutcomeMessage,
} from '../../../types';
import { StepSearchPartyFromBusinessNameFromBusinessName } from '../../components/steps/StepSearchPartyFromBusinessNameFromBusinessName';
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
import { StepSearchPartyFromTaxCode } from '../../components/steps/StepSearchPartyFromTaxCode';
import { StepSearchPartyFromTaxCode } from '../../components/steps/StepSearchPartyFromTaxCode';
import { OnboardingStep1_5 } from './components/OnboardingStep1_5';
import { OnBoardingProductStepDelegates } from './components/OnBoardingProductStepDelegates';

export type ValidateErrorType = 'conflictError';

// eslint-disable-next-line sonarjs/cognitive-complexity
function OnboardingComponent({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>();
  const [externalInstitutionId, setExternalInstitutionId] = useState<string>('');
  const [outcome, setOutcome] = useState<RequestOutcomeMessage>();
  const history = useHistory();
  const [openExitModal, setOpenExitModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();
  const [billingData, setBillingData] = useState<BillingData>();
  const [institutionType, setInstitutionType] = useState<InstitutionType>();
  const [origin, setOrigin] = useState<string>('');
  const [pricingPlan, setPricingPlan] = useState<string>();
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();
  const theme = useTheme();
  const [onExitAction, setOnExitAction] = useState<(() => void) | undefined>();
  const [selectedParty, setSelectedParty] = useState<Party>();

  const fromDashboard =
    window.location.search.indexOf(`partyExternalId=${externalInstitutionId}`) > -1;

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
    requestIdRef.current = uniqueId(`onboarding-${externalInstitutionId}-${productId}-`);
    void checkProductId().finally(() => {
      setLoading(false);
    });
    setPricingPlan(new URLSearchParams(window.location.search).get('pricingPlan') ?? undefined);
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
      unregisterUnloadEvent(setOnExit);
      setSelectedProduct(null);
    } else {
      console.error('Unexpected response', (onboardingProducts as AxiosError).response);
      unregisterUnloadEvent(setOnExit);
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
      zipCode: party.zipCode,
      digitalAddress: party.digitalAddress,
      taxCode: party.taxCode,
      vatNumber: '',
      recipientCode: party.origin === 'IPA' ? party.originId : '',
    });
    forwardWithData(newFormData);
    trackEvent('ONBOARDING_PARTY_SELECTION', {
      party_id: externalInstitutionId,
      request_id: requestIdRef.current,
      product_id: productId,
    });
    setSelectedParty(party);
    setInstitutionType(institutionType);
    setActiveStep(activeStep + 2);
  };

  const forwardWithBillingData = (newBillingData: BillingData) => {
    trackEvent('ONBOARDING_BILLING_DATA', {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
    });
    setBillingData(newBillingData);
    forward();
  };

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

  const notAllowedError: RequestOutcomeMessage = {
    title: '',
    description: [
      <>
        <IllusError size={60} />
        <Grid container direction="column" key="0" mt={3}>
          <Grid container item justifyContent="center">
            <Grid item xs={6}>
              <Typography variant="h4">
                <Trans i18nKey="onboarding.userNotAllowedError.title" />
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center" mb={2} mt={1}>
            <Grid item xs={6}>
              <Typography>
                <Trans i18nKey="onboarding.userNotAllowedError.description">
                  Al momento, l’ente
                  {{ partyName: selectedParty?.description }}
                  non ha il permesso di aderire a{{ productName: selectedProduct?.title }}
                </Trans>
              </Typography>
            </Grid>
          </Grid>
          <Grid container item justifyContent="center" mt={2}>
            <Grid item xs={4}>
              <Button
                variant="contained"
                sx={{ alignSelf: 'center' }}
                onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
              >
                <Trans i18nKey="onboarding.userNotAllowedError.backAction" />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </>,
    ],
  };

  const submit = async (users: Array<UserOnCreate>) => {
    setLoading(true);
    const postLegalsResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_POST_LEGALS', endpointParams: { externalInstitutionId, productId } },
      {
        method: 'POST',
        data: {
          billingData,
          institutionType,
          origin,
          users: users.map((u) => ({
            ...u,
            taxCode: u.taxCode.toUpperCase(),
            email: u.email.toLowerCase(),
          })),
          pricingPlan,
        },
      },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const outcome = getFetchOutcome(postLegalsResponse);

    if (outcome === 'success') {
      trackEvent('ONBOARDING_SEND_SUCCESS', {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
      setOutcome(outcomeContent[outcome]);
    } else {
      const event =
        (postLegalsResponse as AxiosError<Problem>).response?.status === 409
          ? 'ONBOARDING_SEND_CONFLICT_ERROR_FAILURE'
          : 'ONBOARDING_SEND_FAILURE';
      trackEvent(event, {
        request_id: requestIdRef.current,
        party_id: externalInstitutionId,
        product_id: productId,
      });
      if ((postLegalsResponse as AxiosError<Problem>).response?.status === 403) {
        trackEvent('ONBOARDING_NOT_ALLOWED_ERROR', {
          request_id: requestIdRef.current,
          party_id: externalInstitutionId,
          product_id: productId,
        });
        setOutcome(notAllowedError);
      } else {
        setOutcome(outcomeContent[outcome]);
      }
    }
  };

  const forwardWithOnboardingData = (
    _manager: BillingData,
    billingData?: BillingData,
    institutionType?: InstitutionType,
    _id?: string
  ) => {
    if (billingData) {
      setBillingData(billingData);
    }
    setInstitutionType(institutionType);
    forward();
  };

  const forwardWithInstitutionType = (newInstitutionType: InstitutionType) => {
    trackEvent('ONBOARDING_PARTY_TYPE_SELECTION', {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
    });
    setInstitutionType(newInstitutionType);
    setActiveStep(newInstitutionType !== 'PA' ? 2 : 1);
    setOrigin(newInstitutionType !== 'PA' ? 'INFOCAMERE' : 'IPA');
  };

  const steps: Array<StepperStep> = [
    {
      label: 'Seleziona il tipo di ente',
      Component: () =>
        StepInstitutionType({
          institutionType: institutionType as InstitutionType,
          fromDashboard,
          selectedProduct,
          forward: forwardWithInstitutionType,
          back: () => {
            setOnExitAction(() => () => history.goBack());
            setOpenExitModal(true);
          },
        }),
    },
    {
      label: 'Search party from businessName',
      Component: () =>
        StepSearchPartyFromBusinessName({
          subTitle: (
            <Trans i18nKey="onboardingStep1.onboarding.bodyDescription">
              Seleziona dall&apos;Indice della Pubblica Amministrazione (IPA) l&apos;ente
              <br />
              per cui vuoi richiedere l&apos; adesione a {{ productTitle: selectedProduct?.title }}
            </Trans>
          ),
          institutionType,
          product: selectedProduct,
          forward: forwardWithDataAndInstitution,
          back: () => {
            setActiveStep(0);
          },
        }),
    },
    {
      label: 'Search party from taxCode',
      Component: () =>
        StepSearchPartyFromTaxCode({
          subTitle: (
            <Trans i18nKey="stepSearchPartyFromTaxCode.bodyDescription">
              Inserisci il Codice Fiscale/Partita IVA del tuo ente per cui vuoi <br />
              richiedere l&apos;adesione a {{ selectedProduct: selectedProduct?.title }}
              `${selectedProduct?.title}.`
            </Trans>
          ),
          product: selectedProduct,
          forward: forwardWithDataAndInstitution,
          back: () => {
            setActiveStep(0);
          },
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
          selectedProduct,
          selectedParty,
        }),
    },
    {
      label: 'Get Onboarding Data',
      Component: () =>
        StepOnboardingData({
          externalInstitutionId,
          productId,
          institutionType,
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
          origin,
          institutionType: institutionType as InstitutionType,
          subtitle: t('onBoardingSubProduct.billingData.subTitle'),
          forward: forwardWithBillingData,
          back: () => {
            setActiveStep(institutionType === 'PA' ? 1 : 2);
          },
        }),
    },
    {
      label: 'Inserisci i dati del rappresentante legale',
      Component: () =>
        StepAddManager({
          externalInstitutionId,
          product: selectedProduct,
          forward: (newFormData: Partial<FormData>) => {
            trackEvent('ONBOARDING_ADD_MANAGER', {
              request_id: requestIdRef.current,
              party_id: externalInstitutionId,
              product_id: productId,
            });
            forwardWithData(newFormData);
          },
          back: () => {
            setActiveStep(fromDashboard ? 0 : 1);
          },
        }),
    },
    {
      label: 'Inserisci i dati degli amministratori',
      Component: () =>
        OnBoardingProductStepDelegates({
          externalInstitutionId,
          product: selectedProduct,
          legal: (formData as any).users[0],
          forward: (newFormData: Partial<FormData>) => {
            setFormData({ ...formData, ...newFormData });
            trackEvent('ONBOARDING_ADD_DELEGATE', {
              request_id: requestIdRef.current,
              party_id: externalInstitutionId,
              product_id: productId,
            });
            submit((newFormData as any).users).catch(() => {
              trackEvent('ONBOARDING_ADD_DELEGATE', {
                request_id: requestIdRef.current,
                party_id: externalInstitutionId,
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

  return selectedProduct === null ? (
    <NoProductPage />
  ) : outcome ? (
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

export default withLogin(OnboardingComponent);
