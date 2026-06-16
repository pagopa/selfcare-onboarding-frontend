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

vi.setConfig({ testTimeout: 80000 });
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

test('Test: Successfull complete onboarding request of PA party for prod-ced search by business name', async () => {
  renderComponent(PRODUCT_IDS.CED);
  await executeStepInstitutionType(PRODUCT_IDS.CED, 'PA');
  await executeStepSearchParty(PRODUCT_IDS.CED, 'PA', 'AGENCY X', 'businessName', fetchWithLogsSpy);
  await executeStepBillingData(PRODUCT_IDS.CED, 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false, undefined, undefined, undefined, PRODUCT_IDS.CED);
  await executeStepAddAdmin(true, false, false, false, false, false, PRODUCT_IDS.CED);
  await verifySubmit(
    PRODUCT_IDS.CED,
    'PA',
    fetchWithLogsSpy,
    'IPA',
    false,
    false,
    'businessName',
    undefined,
    undefined,
    undefined,
    false
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PRV for product prod-ced skipping step search party', async () => {
  renderComponent(PRODUCT_IDS.CED);
  await executeStepInstitutionType(PRODUCT_IDS.CED, 'PRV');
  await executeStepBillingData(
    PRODUCT_IDS.CED,
    'PRV',
    false,
    false,
    undefined,
    'Mocked private 1',
    false
  );
  await executeStepAddManager(false, undefined, undefined, undefined, PRODUCT_IDS.CED);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.CED,
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
