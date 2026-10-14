import { History } from 'history';
import { Dispatch } from 'react';
import {
  OnboardingProductAction,
  OnboardingProductState,
} from '../../state/onboardingProductReducer';
import {
  backFromAdditionalGpuInfo as backFromAdditionalGpuInfoTransition,
  backFromAdditionalInfo as backFromAdditionalInfoTransition,
  backFromAdmins,
  backFromAggregates as backFromAggregatesTransition,
  backFromApplicantEmail as backFromApplicantEmailTransition,
  backFromBillingData as backFromBillingDataTransition,
  backFromContractsSummary as backFromContractsSummaryTransition,
  backFromManager as backFromManagerTransition,
  backFromSearchParty as backFromSearchPartyTransition,
  Transition,
} from '../../state/onboardingTransitions';

export type BackFunctionsContext = {
  productId: string;
  fromDashboard: boolean;
  productAvoidStep: boolean;
  subunitTypeByQuery: string;
  isRequiredDocumentsFlow?: boolean;
};

export type BackFunctionsEffects = {
  history: Pick<History, 'goBack'>;
};

export type BackFunctionsParams = {
  state: OnboardingProductState;
  dispatch: Dispatch<OnboardingProductAction>;
  ctx: BackFunctionsContext;
  effects: BackFunctionsEffects;
};

/** Handlers of the back action of each step, driven by the back transitions. */
export const createBackFunctions = ({ state, dispatch, ctx, effects }: BackFunctionsParams) => {
  const { institutionType, origin, externalInstitutionId, selectedProduct, onboardingFormData } =
    state;
  const {
    productId,
    fromDashboard,
    productAvoidStep,
    subunitTypeByQuery,
    isRequiredDocumentsFlow,
  } = ctx;
  const { history } = effects;

  const handleOpenExitModal = () => {
    dispatch({ type: 'OPEN_EXIT_MODAL', onExitAction: () => history.goBack() });
  };

  const run = (transition: Transition) => {
    switch (transition.kind) {
      case 'goTo':
        dispatch({ type: 'GO_TO_STEP', step: transition.step });
        break;
      case 'openExitModal':
        handleOpenExitModal();
        break;
      case 'redirect':
        window.location.assign(transition.url);
        break;
      default:
        break;
    }
  };

  const backFromSearchParty = () => run(backFromSearchPartyTransition());

  const backFromContractsSummary = () => run(backFromContractsSummaryTransition());

  const backFromBillingData = () =>
    run(
      backFromBillingDataTransition({
        fromDashboard,
        productAvoidStep,
        subunitTypeByQuery,
        institutionType,
        productId,
        externalInstitutionId,
        isRequiredDocumentsFlow: !!isRequiredDocumentsFlow,
      })
    );

  const backFromAdditionalGpuInfo = () => run(backFromAdditionalGpuInfoTransition());

  const backFromAdditionalInfo = () => run(backFromAdditionalInfoTransition());

  const backFromManager = () =>
    run(
      backFromManagerTransition({ institutionType, origin, selectedProductId: selectedProduct?.id })
    );

  const backFromAdmin = () => run(backFromAdmins({ institutionType }));

  const backFromAggregates = () => run(backFromAggregatesTransition());

  const backFromApplicantEmail = () =>
    run(backFromApplicantEmailTransition({ isAggregator: !!onboardingFormData?.isAggregator }));

  return {
    handleOpenExitModal,
    backFromSearchParty,
    backFromContractsSummary,
    backFromBillingData,
    backFromAdditionalGpuInfo,
    backFromAdditionalInfo,
    backFromManager,
    backFromAdmin,
    backFromAggregates,
    backFromApplicantEmail,
  };
};
