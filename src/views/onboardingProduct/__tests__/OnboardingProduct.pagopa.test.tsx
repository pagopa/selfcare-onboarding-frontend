import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import * as apiUtils from '../../../lib/api-utils';
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
  executeStepContractsSummary,
  executeStepInstitutionType,
  executeStepSearchParty,
  executeStepUploadRequiredDocuments,
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

const actualFetchWithLogs = apiUtils.fetchWithLogs;

const respondWith = (endpoint: string, response: unknown) =>
  fetchWithLogsSpy.mockImplementation((path: any, config: any, onRedirectToLogin: any) =>
    path?.endpoint === endpoint
      ? Promise.resolve(response as any)
      : actualFetchWithLogs(path, config, onRedirectToLogin)
  );

const callsTo = (endpoint: string) =>
  fetchWithLogsSpy.mock.calls.filter((call: any) => call[0]?.endpoint === endpoint);

const completeGspNoIpaUntilAdminStep = async () => {
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
  await executeStepContractsSummary();
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'GSP', false, false, 'NO_IPA', 'AGENCY X');
  await executeStepAdditionalInfo('NO_IPA');
  await executeStepAddManager(false);
};

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
  await completeGspNoIpaUntilAdminStep();
  await executeStepAddAdmin(true, false, false, false, false, false, undefined, true);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'GSP', fetchWithLogsSpy, 'NO_IPA');

  await waitFor(() => screen.getByText('Inserisci i documenti'));

  const postLegalsBefore = callsTo('ONBOARDING_POST_LEGALS').length;
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));
  await waitFor(() => screen.getByText("Indica l'Amministratore"));
  fireEvent.click(screen.getByLabelText('Continua'));
  await waitFor(() => screen.getByText('Inserisci i documenti'));
  expect(callsTo('ONBOARDING_POST_LEGALS')).toHaveLength(postLegalsBefore);

  await executeStepUploadRequiredDocuments(fetchWithLogsSpy);
  await executeGoHome(mockedLocation);
});

test('Test: GSP party without searching on IPA source skips the documents flow when the created onboarding is not found', async () => {
  await completeGspNoIpaUntilAdminStep();

  respondWith('ONBOARDING_GET_ONBOARDINGS', { data: [], status: 200, statusText: '200' });
  await executeStepAddAdmin(true, false, false, false, false, false, undefined, true);

  await waitFor(() => screen.getByText('Richiesta di adesione inviata'));
  expect(screen.queryByText('Inserisci i documenti')).not.toBeInTheDocument();
  await executeGoHome(mockedLocation);
});

test('Test: GSP party without searching on IPA source shows the error page when the created onboarding cannot be retrieved', async () => {
  await completeGspNoIpaUntilAdminStep();

  respondWith('ONBOARDING_GET_ONBOARDINGS', {
    isAxiosError: true,
    response: { data: '', status: 500 },
  });
  await executeStepAddAdmin(true, false, false, false, false, false, undefined, true);

  await waitFor(() => screen.getByText('Qualcosa è andato storto.'));
  expect(screen.queryByText('Inserisci i documenti')).not.toBeInTheDocument();
});

test('Test: Successfull complete onboarding request of PA party for product prod-pagopa', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'PA',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy
  );
  await executeStepBillingData(PRODUCT_IDS.PAGOPA, 'PA', false, false, 'IPA', 'AGENCY X');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.PAGOPA, 'PA', fetchWithLogsSpy, 'IPA');
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
