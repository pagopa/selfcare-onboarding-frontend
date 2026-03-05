/* eslint-disable functional/immutable-data */
import { Dispatch, SetStateAction } from 'react';
import { History } from 'history';
import { InstitutionType, Product } from '../../../../../types';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { ENV } from '../../../../utils/env';
import {
  isContractingAuthority,
  isGlobalServiceProvider,
  isPagoPaInsights,
  isPagoPaProduct,
  isPaymentServiceProvider,
  isPrivateInstitution,
  isPrivatePersonInstitution,
  isPublicAdministration,
  isTechPartner,
} from '../../../../utils/institutionTypeUtils';

interface BackFunctionsParams {
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  setOpenExitModal: Dispatch<SetStateAction<boolean>>;
  setOnExitAction: Dispatch<SetStateAction<(() => void) | undefined>>;
  history: History;
  fromDashboard: boolean;
  productAvoidStep: boolean;
  subunitTypeByQuery: string;
  institutionType: InstitutionType | undefined;
  selectedProduct: Product | null | undefined;
  origin: string | undefined;
  productId: string;
  externalInstitutionId: string;
  onboardingFormData: OnboardingFormData | undefined;
}

export const createBackFunctions = (params: BackFunctionsParams) => {
  const {
    activeStep,
    setActiveStep,
    setOpenExitModal,
    setOnExitAction,
    history,
    fromDashboard,
    productAvoidStep,
    subunitTypeByQuery,
    institutionType,
    selectedProduct,
    origin,
    productId,
    externalInstitutionId,
    onboardingFormData,
  } = params;

  const handleOpenExitModal = () => {
    setOnExitAction(() => () => history.goBack());
    setOpenExitModal(true);
  };

  const backFromBillingData = () => {
    if (fromDashboard && !productAvoidStep) {
      setActiveStep(0);
    } else if ((fromDashboard || subunitTypeByQuery) && productAvoidStep) {
      handleOpenExitModal();
    } else if (
      isPaymentServiceProvider(institutionType) ||
      (!isPublicAdministration(institutionType) &&
        !isContractingAuthority(institutionType) &&
        !isGlobalServiceProvider(institutionType) &&
        !isPrivateInstitution(institutionType) &&
        !isPrivatePersonInstitution(institutionType))
    ) {
      setActiveStep(0);
    } else if (fromDashboard && isPagoPaInsights(productId)) {
      window.location.assign(`${ENV.URL_FE.DASHBOARD}/${externalInstitutionId}`);
    } else {
      setActiveStep(1);
    }
  };

  const backFromManager = () => {
    switch (institutionType) {
      case 'GSP':
        if (origin === 'IPA' && isPagoPaProduct(selectedProduct?.id)) {
          setActiveStep(activeStep - 1);
        } else {
          setActiveStep(activeStep - 3);
        }
        break;
      case 'GPU':
        setActiveStep(activeStep - 2);
        break;
      case 'PT':
        setActiveStep(activeStep - 4);
        break;
      default:
        setActiveStep(activeStep - 3);
        break;
    }
  };

  const backFromAdmin = () => {
    if (isTechPartner(institutionType)) {
      setActiveStep(activeStep - 4);
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const backFromApplicantEmail = () => {
    if (onboardingFormData?.isAggregator) {
      setActiveStep(activeStep - 1);
    } else {
      setActiveStep(activeStep - 2);
    }
  };

  return {
    handleOpenExitModal,
    backFromBillingData,
    backFromManager,
    backFromAdmin,
    backFromApplicantEmail,
  };
};
