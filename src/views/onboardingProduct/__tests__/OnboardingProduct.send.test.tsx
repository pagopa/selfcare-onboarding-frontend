import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
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

test('Test: Successfull complete onboarding request of PA party for prod-pn search by business name', async () => {
  renderComponent(PRODUCT_IDS.SEND);
  await executeStepInstitutionType(PRODUCT_IDS.SEND, 'PA');

  await waitFor(() =>
    expect(
      screen.getByText(/Al momento possono aderire a SEND tramite Area Riservata solo le/)
    ).toBeInTheDocument()
  );

  await executeStepSearchParty(
    PRODUCT_IDS.SEND,
    'PA',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy
  );
  await executeStepBillingData(PRODUCT_IDS.SEND, 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.SEND, 'PA', fetchWithLogsSpy, 'IPA');
  await executeGoHome(mockedLocation);
});
