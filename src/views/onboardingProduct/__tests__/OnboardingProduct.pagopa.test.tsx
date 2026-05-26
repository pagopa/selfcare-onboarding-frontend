import '@testing-library/jest-dom';
import { test, vi } from 'vitest';
import '../../../locale';
import { PRODUCT_IDS } from '../../../utils/constants';
import {
  executeGoHome,
  executeStepAddAdmin,
  executeStepAddManager,
  verifySubmit,
} from '../../../utils/test/test-utils';
import {
  executeStepAdditionalGpuInformations,
  executeStepAdditionalInfo,
  executeStepBillingData,
  executeStepInstitutionType,
  executeStepSearchParty,
  renderComponent,
} from './shared/stepHelpers';
import {
  fetchWithLogsSpy,
  mockedHistoryPush,
  mockedLocation,
  setupTestHooks,
} from './shared/testSetup';

vi.setConfig({ testTimeout: 40000 });
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation: any) => Object.assign(mockedLocation, nextLocation),
    push: mockedHistoryPush,
  }),
}));
vi.mock('axios');

setupTestHooks();

test('Test: Successfull complete onboarding request of GSP party searching from IPA source for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'GSP');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'GSP',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    false
  );
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'GSP', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'GSP', fetchWithLogsSpy, 'IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of GSP party without searching on IPA source for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'GSP');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'GSP',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    true,
    false
  );
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'GSP', false, false, 'NO_IPA', 'AGENCY X');
  await executeStepAdditionalInfo('NO_IPA');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'GSP', fetchWithLogsSpy, 'NO_IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of GPU for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'GPU');
  await executeStepBillingData(
    PRODUCT_IDS.PAGOPA,
    'GPU',
    false,
    false,
    'NO_IPA',
    'Mocked GPU name',
    false
  );
  await executeStepAdditionalGpuInformations();
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'GPU', fetchWithLogsSpy, 'NO_IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PT for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PT');
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'PT', false, false, 'NO_IPA');
  await executeStepAddAdmin(true, true, false, false, true, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'PT', fetchWithLogsSpy, 'NO_IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PSP for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PSP');
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'PSP', false, false, 'NO_IPA');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'PSP', fetchWithLogsSpy, 'NO_IPA');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PRV for product prod-pagopa skipping step search party', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'oth');
  await executeStepBillingData(
    PRODUCT_IDS.PAGOPA,
    'PRV',
    false,
    false,
    undefined,
    'Mocked private 1',
    false
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.PAGOPA,
    'PRV',
    fetchWithLogsSpy,
    undefined,
    false,
    false,
    undefined,
    false,
    undefined,
    undefined
  );
  await executeGoHome(mockedLocation);
});