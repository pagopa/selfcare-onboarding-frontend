import '@testing-library/jest-dom';
import { test, vi } from 'vitest';
import '../../../locale';
import { PRODUCT_IDS } from '../../../utils/constants';
import {
  executeGoHome,
  executeStepAddAdmin,
  executeStepAddApplicantEmailForm,
  executeStepAddManager,
  verifySubmit,
} from '../../../utils/test/test-utils';
import {
  executeStepBillingData,
  executeStepInstitutionType,
  executeStepSearchParty,
  executeStepUploadAggregates,
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

let aggregatesCsv: File;
setupTestHooks(() => {
  aggregatesCsv = new File(['csv data'], 'aggregates.csv', { type: 'multipart/form-data' });
});

test('Test: Successfull complete onboarding request of PA party for prod-io search by business name', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
  await executeStepSearchParty(PRODUCT_IDS.IO, 'PA', 'AGENCY X', 'businessName', fetchWithLogsSpy);
  await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, true);
  await executeStepAddApplicantEmailForm();
  await verifySubmit(
    PRODUCT_IDS.IO,
    'PA',
    fetchWithLogsSpy,
    'IPA',
    false,
    false,
    'businessName',
    undefined,
    undefined,
    undefined,
    true
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PA party for prod-io search by tax code', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.IO,
    'PA',
    'Comune Di Milano',
    'taxCode',
    fetchWithLogsSpy,
    undefined,
    '33445673222'
  );
  await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'Comune di Milano');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.IO, 'PA', fetchWithLogsSpy, 'IPA', false, false, 'taxCode');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PA aggregator party for prod-io search by business name', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.IO,
    'PA',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    false,
    true
  );
  await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, true, false, false, false);
  await executeStepUploadAggregates(aggregatesCsv);
  await verifySubmit(
    PRODUCT_IDS.IO,
    'PA',
    fetchWithLogsSpy,
    'IPA',
    false,
    false,
    'businessName',
    undefined,
    true,
    true,
    false
  );
  await executeGoHome(mockedLocation);
});

test('Test: Error on submit onboarding request of PA party for prod-io search by business name', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.IO,
    'PA',
    'AGENCY ERROR',
    'businessName',
    fetchWithLogsSpy
  );
  await executeStepBillingData(PRODUCT_IDS.IO, 'PA', false, false, 'IPA', 'AGENCY ERROR');
  await executeStepAddManager(false);
  await executeStepAddAdmin(false, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.IO, 'PA', fetchWithLogsSpy, 'IPA', false, true);
  await executeGoHome(mockedLocation);
});