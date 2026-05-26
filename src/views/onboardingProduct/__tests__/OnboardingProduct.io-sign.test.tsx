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

test('Test: Successfull complete onboarding request of UO party for product prod-io-sign', async () => {
  renderComponent(PRODUCT_IDS.IO_SIGN);
  await executeStepInstitutionType(PRODUCT_IDS.IO_SIGN, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.IO_SIGN,
    'PA',
    'denominazione uo test 1',
    'uoCode',
    fetchWithLogsSpy,
    'A1B2C3'
  );
  await executeStepBillingData(
    PRODUCT_IDS.IO_SIGN,
    'PA',
    false,
    true,
    'IPA',
    'denominazione uo test 1'
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.IO_SIGN, 'PA', fetchWithLogsSpy, 'IPA', true, false, 'uoCode');
  await executeGoHome(mockedLocation);
});