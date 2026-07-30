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

test('Test: Successfull complete onboarding request of PA party for prod-idpay search by business name', async () => {
  renderComponent(PRODUCT_IDS.IDPAY);
  await executeStepInstitutionType(PRODUCT_IDS.IDPAY, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.IDPAY,
    'PA',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy
  );
  await executeStepBillingData(PRODUCT_IDS.IDPAY, 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.IDPAY, 'PA', fetchWithLogsSpy, 'IPA');
  await executeGoHome(mockedLocation);
});
