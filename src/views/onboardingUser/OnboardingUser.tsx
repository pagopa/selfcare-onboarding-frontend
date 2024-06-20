import Container from '@mui/material/Container';
import { useParams } from 'react-router';
import { useLocation, useHistory } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { withLogin } from '../../components/withLogin';
import { InstitutionType, Party, StepperStep } from '../../../types';
import StepOnboardingData from '../../components/steps/StepOnboardingData';
import StepOnboardingFormData from '../../components/steps/StepOnboardingFormData';

type OnboardingUserUrlParams = {
  productId: string;
};

function OnboardingUserComponent() {
  const { productId } = useParams<OnboardingUserUrlParams>();
  const location = useLocation();
  const history = useHistory();

  const [selectedParty, setSelectedParty] = useState<Party>();

  useEffect(() => {
    if (location.state) {
      setSelectedParty((location.state as any).data);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedParty) {
      history.replace({
        ...history.location,
        state: null,
      });
    }
  }, [selectedParty, history]);

  const steps: Array<StepperStep> = [
    {
      label: 'Get Onboarding Data',
      Component: () =>
        StepOnboardingData({
          productId,
          institutionType,
          forward: forwardWithOnboardingData,
        }),
    },
    {
      label: 'Insert Billing Data',
      Component: () =>
        StepOnboardingFormData({
          outcome,
          productId,
          selectedParty,
          selectedProduct,
          externalInstitutionId,
          initialFormData: onboardingFormData ?? {
            businessName: '',
            registeredOffice: '',
            zipCode: '',
            digitalAddress: '',
            taxCode: '',
            vatNumber: '',
            recipientCode: '',
            geographicTaxonomies: [],
          },
          aooSelected,
          uoSelected,
          origin,
          institutionType: institutionType as InstitutionType,
          subtitle:
            institutionType !== 'PT' ? (
              <Trans i18nKey="onboardingSubProduct.billingData.subTitle" components={{ 1: <br /> }}>
                {`Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti. <1 />Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`}
              </Trans>
            ) : (
              <Trans
                i18nKey="onboardingSubProduct.billingDataPt.subTitle"
                values={{ nameProduct: selectedProduct?.title }}
                components={{ 1: <br />, 3: <br />, 5: <strong /> }}
              >
                {`Inserisci le informazioni richieste e assicurati che siano corrette.<1 /> Serviranno a registrarti come Partner tecnologico per il<3/> prodotto <5>{{nameProduct}}</5>.`}
              </Trans>
            ),
          forward: forwardWithBillingData,
          back: () => {
            if (fromDashboard && !productAvoidStep) {
              setActiveStep(0);
            } else if ((fromDashboard || subunitTypeByQuery) && productAvoidStep) {
              setOnExitAction(() => () => history.goBack());
              setOpenExitModal(true);
            } else if (
              institutionType === 'PSP' ||
              (institutionType !== 'PA' && institutionType !== 'SA' && institutionType !== 'GSP')
            ) {
              setActiveStep(0);
            } else {
              setActiveStep(1);
            }
          },
        }),
    },
    {
      label: 'Inserisci i dati del rappresentante legale',
      Component: () =>
        StepAddManager({
          externalInstitutionId,
          addUserFlow,
          product: selectedProduct,
          isTechPartner,
          forward: (newFormData: Partial<FormData>) => {
            trackEvent('ONBOARDING_ADD_MANAGER', {
              request_id: requestIdRef.current,
              party_id: externalInstitutionId,
              product_id: productId,
            });
            forwardWithData(newFormData);
          },
          back: () => {
            if (productId === 'prod-pagopa' && institutionType === 'GSP') {
              back();
            } else if (addUserFlow) {
              setActiveStep(1);
            } else {
              setActiveStep(activeStep - 2);
            }
          },
        }),
    },
    {
      label: 'Inserisci i dati degli amministratori',
      Component: () =>
        OnBoardingProductStepDelegates({
          externalInstitutionId,
          addUserFlow,
          product: selectedProduct,
          legal: isTechPartner ? undefined : (formData as any)?.users[0],
          partyName: onboardingFormData?.businessName || '',
          isTechPartner,
          forward: (newFormData: Partial<FormData>) => {
            const users = ((newFormData as any).users as Array<UserOnCreate>).map((u) => ({
              ...u,
              taxCode: u?.taxCode.toUpperCase(),
              email: u?.email.toLowerCase(),
            }));

            const usersWithoutLegal = users.slice(0, 0).concat(users.slice(0 + 1));
            setFormData({ ...formData, ...newFormData });
            trackEvent('ONBOARDING_ADD_DELEGATE', {
              request_id: requestIdRef.current,
              party_id: externalInstitutionId,
              product_id: productId,
            });
            if (addUserFlow) {
              addUserRequest(users).catch(() => {
                trackEvent('ONBOARDING_ADD_NEW_USER', {
                  request_id: requestIdRef.current,
                  party_id: externalInstitutionId,
                  product_id: productId,
                });
              });
            } else {
              onboardingSubmit(isTechPartner ? usersWithoutLegal : users).catch(() => {
                trackEvent('ONBOARDING_ADD_DELEGATE', {
                  request_id: requestIdRef.current,
                  party_id: externalInstitutionId,
                  product_id: productId,
                });
              });
            }
          },
          back: () => {
            if (isTechPartner) {
              setActiveStep(activeStep - 3);
            } else {
              setActiveStep(activeStep - 1);
            }
          },
        }),
    },
  ];

  const Step = useMemo(() => steps[activeStep].Component, [activeStep, selectedProduct]);

  return (
    <Container>
      <Step />
    </Container>
  );
}

export default withLogin(OnboardingUserComponent);
