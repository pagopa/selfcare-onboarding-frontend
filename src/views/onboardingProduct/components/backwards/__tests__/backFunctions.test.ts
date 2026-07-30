import { expect, it, vi } from 'vitest';
import { InstitutionType } from '../../../../../../types';
import { OnboardingFormData } from '../../../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../../../utils/constants';
import { createBackFunctions } from '../backFunctions';

const ACTIVE_STEP = 6;

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
  const setActiveStep = vi.fn();
  const setOpenExitModal = vi.fn();
  const setOnExitAction = vi.fn();
  const goBack = vi.fn();

  const backFunctions = createBackFunctions({
    activeStep: ACTIVE_STEP,
    setActiveStep,
    setOpenExitModal,
    setOnExitAction,
    history: { goBack } as any,
    fromDashboard: overrides.fromDashboard ?? false,
    productAvoidStep: overrides.productAvoidStep ?? false,
    subunitTypeByQuery: overrides.subunitTypeByQuery ?? '',
    institutionType: overrides.institutionType,
    selectedProduct: { id: overrides.productId ?? PRODUCT_IDS.PAGOPA } as any,
    origin: overrides.origin,
    productId: overrides.productId ?? PRODUCT_IDS.PAGOPA,
    externalInstitutionId: 'institution-id',
    onboardingFormData: overrides.onboardingFormData,
    isRequiredDocumentsFlow: overrides.isRequiredDocumentsFlow,
  });

  return { ...backFunctions, setActiveStep, setOpenExitModal, setOnExitAction, goBack };
};

it('test handleOpenExitModal opens the modal with an exit action going back in history', () => {
  const { handleOpenExitModal, setOpenExitModal, setOnExitAction, goBack } = buildBackFunctions();

  handleOpenExitModal();

  expect(setOpenExitModal).toHaveBeenCalledWith(true);
  const exitAction = setOnExitAction.mock.calls[0][0]();
  exitAction();
  expect(goBack).toHaveBeenCalled();
});

it('test backFromBillingData goes to the first step when coming from the dashboard', () => {
  const { backFromBillingData, setActiveStep } = buildBackFunctions({
    fromDashboard: true,
    institutionType: 'PA',
  });

  backFromBillingData();

  expect(setActiveStep).toHaveBeenCalledWith(0);
});

it('test backFromBillingData asks to confirm the exit when the product step is skipped', () => {
  const fromDashboard = buildBackFunctions({
    fromDashboard: true,
    productAvoidStep: true,
    institutionType: 'PA',
  });

  fromDashboard.backFromBillingData();

  expect(fromDashboard.setOpenExitModal).toHaveBeenCalledWith(true);
  expect(fromDashboard.setActiveStep).not.toHaveBeenCalled();

  const fromSubunit = buildBackFunctions({
    productAvoidStep: true,
    subunitTypeByQuery: 'AOO',
    institutionType: 'PA',
  });

  fromSubunit.backFromBillingData();

  expect(fromSubunit.setOpenExitModal).toHaveBeenCalledWith(true);
});

it('test backFromBillingData goes to the first step for a payment service provider', () => {
  const { backFromBillingData, setActiveStep } = buildBackFunctions({ institutionType: 'PSP' });

  backFromBillingData();

  expect(setActiveStep).toHaveBeenCalledWith(0);
});

it('test backFromBillingData goes to the first step for an institution type without a search step', () => {
  const { backFromBillingData, setActiveStep } = buildBackFunctions({ institutionType: 'AS' });

  backFromBillingData();

  expect(setActiveStep).toHaveBeenCalledWith(0);
});

it('test backFromBillingData goes back to the contracts summary in the required documents flow', () => {
  const { backFromBillingData, setActiveStep } = buildBackFunctions({
    institutionType: 'GSP',
    isRequiredDocumentsFlow: true,
  });

  backFromBillingData();

  expect(setActiveStep).toHaveBeenCalledWith(2);
});

it('test backFromBillingData goes back to the search step by default', () => {
  const { backFromBillingData, setActiveStep } = buildBackFunctions({ institutionType: 'PA' });

  backFromBillingData();

  expect(setActiveStep).toHaveBeenCalledWith(1);
});

it('test backFromManager skips the additional steps for a GSP from IPA on prod-pagopa', () => {
  const { backFromManager, setActiveStep } = buildBackFunctions({
    institutionType: 'GSP',
    origin: 'IPA',
    productId: PRODUCT_IDS.PAGOPA,
  });

  backFromManager();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 3);
});

it('test backFromManager goes back one step for a GSP outside IPA', () => {
  const { backFromManager, setActiveStep } = buildBackFunctions({
    institutionType: 'GSP',
    origin: 'SELC',
    productId: PRODUCT_IDS.PAGOPA,
  });

  backFromManager();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 1);
});

it('test backFromManager goes back two steps for a GPU', () => {
  const { backFromManager, setActiveStep } = buildBackFunctions({ institutionType: 'GPU' });

  backFromManager();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 2);
});

it('test backFromManager goes back four steps for a tech partner', () => {
  const { backFromManager, setActiveStep } = buildBackFunctions({ institutionType: 'PT' });

  backFromManager();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 4);
});

it('test backFromManager goes back three steps for the other institution types', () => {
  const { backFromManager, setActiveStep } = buildBackFunctions({ institutionType: 'PA' });

  backFromManager();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 3);
});

it('test backFromAdmin skips the manager step for a tech partner', () => {
  const { backFromAdmin, setActiveStep } = buildBackFunctions({ institutionType: 'PT' });

  backFromAdmin();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 4);
});

it('test backFromAdmin goes back one step for the other institution types', () => {
  const { backFromAdmin, setActiveStep } = buildBackFunctions({ institutionType: 'PA' });

  backFromAdmin();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 1);
});

it('test backFromApplicantEmail goes back to the aggregates step for an aggregator', () => {
  const { backFromApplicantEmail, setActiveStep } = buildBackFunctions({
    onboardingFormData: { isAggregator: true } as OnboardingFormData,
  });

  backFromApplicantEmail();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 1);
});

it('test backFromApplicantEmail skips the aggregates step for a non aggregator', () => {
  const { backFromApplicantEmail, setActiveStep } = buildBackFunctions({
    onboardingFormData: { isAggregator: false } as OnboardingFormData,
  });

  backFromApplicantEmail();

  expect(setActiveStep).toHaveBeenCalledWith(ACTIVE_STEP - 2);
});
