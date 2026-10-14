import { expect, it, vi } from 'vitest';
import { InstitutionType } from '../../../../../../types';
import { OnboardingFormData } from '../../../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../../../utils/constants';
import { createInitialState } from '../../../state/onboardingProductReducer';
import { OnboardingStepName } from '../../../state/onboardingSteps';
import { createBackFunctions } from '../backFunctions';

type Overrides = {
  fromDashboard?: boolean;
  productAvoidStep?: boolean;
  subunitTypeByQuery?: string;
  institutionType?: InstitutionType;
  origin?: string;
  productId?: string;
  onboardingFormData?: OnboardingFormData;
  isRequiredDocumentsFlow?: boolean;
};

const buildBackFunctions = (overrides: Overrides = {}) => {
  const dispatch = vi.fn();
  const goBack = vi.fn();
  const productId = overrides.productId ?? PRODUCT_IDS.PAGOPA;

  const backFunctions = createBackFunctions({
    state: createInitialState({
      institutionType: overrides.institutionType,
      origin: overrides.origin,
      selectedProduct: { id: productId } as any,
      externalInstitutionId: 'institution-id',
      onboardingFormData: overrides.onboardingFormData,
    }),
    dispatch,
    ctx: {
      productId,
      fromDashboard: overrides.fromDashboard ?? false,
      productAvoidStep: overrides.productAvoidStep ?? false,
      subunitTypeByQuery: overrides.subunitTypeByQuery ?? '',
      isRequiredDocumentsFlow: overrides.isRequiredDocumentsFlow,
    },
    effects: { history: { goBack } },
  });

  return { ...backFunctions, dispatch, goBack };
};

const goToStep = (step: OnboardingStepName) => ({ type: 'GO_TO_STEP', step });

it('test handleOpenExitModal opens the modal with an exit action going back in history', () => {
  const { handleOpenExitModal, dispatch, goBack } = buildBackFunctions();

  handleOpenExitModal();

  expect(dispatch).toHaveBeenCalledWith({
    type: 'OPEN_EXIT_MODAL',
    onExitAction: expect.any(Function),
  });
  dispatch.mock.calls[0][0].onExitAction();
  expect(goBack).toHaveBeenCalled();
});

it('test backFromBillingData goes to the first step when coming from the dashboard', () => {
  const { backFromBillingData, dispatch } = buildBackFunctions({
    fromDashboard: true,
    institutionType: 'PA',
  });

  backFromBillingData();

  expect(dispatch).toHaveBeenCalledWith(goToStep('institutionType'));
});

it('test backFromBillingData asks to confirm the exit when the product step is skipped', () => {
  const fromDashboard = buildBackFunctions({
    fromDashboard: true,
    productAvoidStep: true,
    institutionType: 'PA',
  });

  fromDashboard.backFromBillingData();

  expect(fromDashboard.dispatch).toHaveBeenCalledTimes(1);
  expect(fromDashboard.dispatch.mock.calls[0][0].type).toBe('OPEN_EXIT_MODAL');

  const fromSubunit = buildBackFunctions({
    productAvoidStep: true,
    subunitTypeByQuery: 'AOO',
    institutionType: 'PA',
  });

  fromSubunit.backFromBillingData();

  expect(fromSubunit.dispatch.mock.calls[0][0].type).toBe('OPEN_EXIT_MODAL');
});

it('test backFromBillingData goes to the first step for a payment service provider', () => {
  const { backFromBillingData, dispatch } = buildBackFunctions({ institutionType: 'PSP' });

  backFromBillingData();

  expect(dispatch).toHaveBeenCalledWith(goToStep('institutionType'));
});

it('test backFromBillingData goes to the first step for an institution type without a search step', () => {
  const { backFromBillingData, dispatch } = buildBackFunctions({ institutionType: 'AS' });

  backFromBillingData();

  expect(dispatch).toHaveBeenCalledWith(goToStep('institutionType'));
});

it('test backFromBillingData goes back to the contracts summary in the required documents flow', () => {
  const { backFromBillingData, dispatch } = buildBackFunctions({
    institutionType: 'GSP',
    isRequiredDocumentsFlow: true,
  });

  backFromBillingData();

  expect(dispatch).toHaveBeenCalledWith(goToStep('contractsSummary'));
});

it('test backFromBillingData goes back to the search step by default', () => {
  const { backFromBillingData, dispatch } = buildBackFunctions({ institutionType: 'PA' });

  backFromBillingData();

  expect(dispatch).toHaveBeenCalledWith(goToStep('searchParty'));
});

it('test backFromManager skips the additional steps for a GSP from IPA on prod-pagopa', () => {
  const { backFromManager, dispatch } = buildBackFunctions({
    institutionType: 'GSP',
    origin: 'IPA',
    productId: PRODUCT_IDS.PAGOPA,
  });

  backFromManager();

  expect(dispatch).toHaveBeenCalledWith(goToStep('billingData'));
});

it('test backFromManager goes back to the additional info for a GSP outside IPA', () => {
  const { backFromManager, dispatch } = buildBackFunctions({
    institutionType: 'GSP',
    origin: 'SELC',
    productId: PRODUCT_IDS.PAGOPA,
  });

  backFromManager();

  expect(dispatch).toHaveBeenCalledWith(goToStep('additionalInfo'));
});

it('test backFromManager goes back to the additional GPU info for a GPU', () => {
  const { backFromManager, dispatch } = buildBackFunctions({ institutionType: 'GPU' });

  backFromManager();

  expect(dispatch).toHaveBeenCalledWith(goToStep('additionalGpuInfo'));
});

it('test backFromManager goes back to the onboarding data for a tech partner', () => {
  const { backFromManager, dispatch } = buildBackFunctions({ institutionType: 'PT' });

  backFromManager();

  expect(dispatch).toHaveBeenCalledWith(goToStep('onboardingData'));
});

it('test backFromManager goes back to the billing data for the other institution types', () => {
  const { backFromManager, dispatch } = buildBackFunctions({ institutionType: 'PA' });

  backFromManager();

  expect(dispatch).toHaveBeenCalledWith(goToStep('billingData'));
});

it('test backFromAdmin skips the manager step for a tech partner', () => {
  const { backFromAdmin, dispatch } = buildBackFunctions({ institutionType: 'PT' });

  backFromAdmin();

  expect(dispatch).toHaveBeenCalledWith(goToStep('billingData'));
});

it('test backFromAdmin goes back to the manager for the other institution types', () => {
  const { backFromAdmin, dispatch } = buildBackFunctions({ institutionType: 'PA' });

  backFromAdmin();

  expect(dispatch).toHaveBeenCalledWith(goToStep('manager'));
});

it('test backFromApplicantEmail goes back to the aggregates step for an aggregator', () => {
  const { backFromApplicantEmail, dispatch } = buildBackFunctions({
    onboardingFormData: { isAggregator: true } as OnboardingFormData,
  });

  backFromApplicantEmail();

  expect(dispatch).toHaveBeenCalledWith(goToStep('aggregates'));
});

it('test backFromApplicantEmail skips the aggregates step for a non aggregator', () => {
  const { backFromApplicantEmail, dispatch } = buildBackFunctions({
    onboardingFormData: { isAggregator: false } as OnboardingFormData,
  });

  backFromApplicantEmail();

  expect(dispatch).toHaveBeenCalledWith(goToStep('admins'));
});
