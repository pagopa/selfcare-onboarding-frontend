import '@testing-library/jest-dom';
import { test, vi } from 'vitest';
import { InstitutionType } from '../../../../types';
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

const completeOnboardingPdndInfocamereRequest = async (institutionType: InstitutionType) => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, institutionType);
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    institutionType,
    'Mocked business 1',
    'taxCode',
    fetchWithLogsSpy,
    undefined,
    '00112233445',
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    institutionType,
    false,
    false,
    'PDND_INFOCAMERE',
    'Mocked business 1',
    false
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    institutionType,
    fetchWithLogsSpy,
    'PDND_INFOCAMERE',
    false,
    false,
    'taxCode',
    false
  );
  await executeGoHome(mockedLocation);
};

test('Test: Successfull complete onboarding request of AOO party for product prod-interop', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'PA',
    'denominazione aoo test 1',
    'aooCode',
    fetchWithLogsSpy,
    'A356E00'
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    'PA',
    true,
    false,
    'IPA',
    'denominazione aoo test 1'
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.INTEROP, 'PA', fetchWithLogsSpy, 'IPA', false, false, 'aooCode');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of SA for product prod-interop search by business name', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'SA');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'SA',
    'descriptionAnac1',
    'businessName',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(PRODUCT_IDS.INTEROP, 'SA', false, false, 'ANAC', 'descriptionAnac1');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    'SA',
    fetchWithLogsSpy,
    'ANAC',
    false,
    false,
    'businessName'
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of SA for product prod-interop search by tax code', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'SA');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'SA',
    'descriptionAnac1',
    'taxCode',
    fetchWithLogsSpy,
    undefined,
    '12345678911',
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(PRODUCT_IDS.INTEROP, 'SA', false, false, 'ANAC', 'descriptionAnac1');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(PRODUCT_IDS.INTEROP, 'SA', fetchWithLogsSpy, 'ANAC', false, false, 'taxCode');
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of foreign AS for product prod-interop search by business name', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'AS');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'AS',
    'mocked foreign insurance company 1',
    'businessName',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    'AS',
    false,
    false,
    'IVASS',
    'mocked foreign insurance company 1',
    true
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    'AS',
    fetchWithLogsSpy,
    'IVASS',
    false,
    false,
    'businessName',
    true
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of italian AS for product prod-interop search by ivass code', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'AS');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'AS',
    'mocked italian insurance company 1',
    'ivassCode',
    fetchWithLogsSpy,
    undefined,
    undefined,
    '232DC',
    undefined,
    undefined,
    false,
    undefined,
    false
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    'AS',
    false,
    false,
    'IVASS',
    'mocked italian insurance company 1',
    false
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    'AS',
    fetchWithLogsSpy,
    'IVASS',
    false,
    false,
    'taxCode',
    false
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of italian AS without tax code for product prod-interop search by ivass code', async () => {
  renderComponent(PRODUCT_IDS.INTEROP);
  await executeStepInstitutionType(PRODUCT_IDS.INTEROP, 'AS');
  await executeStepSearchParty(
    PRODUCT_IDS.INTEROP,
    'AS',
    'mocked italian insurance company without taxcode',
    'ivassCode',
    fetchWithLogsSpy,
    undefined,
    undefined,
    '4431B',
    undefined,
    undefined,
    false,
    true
  );
  await executeStepBillingData(
    PRODUCT_IDS.INTEROP,
    'AS',
    false,
    false,
    'IVASS',
    'mocked italian insurance company without taxcode',
    false,
    false
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);
  await verifySubmit(
    PRODUCT_IDS.INTEROP,
    'AS',
    fetchWithLogsSpy,
    'IVASS',
    false,
    false,
    'taxCode',
    false,
    false
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of SCP for product prod-interop search with tax code', async () => {
  await completeOnboardingPdndInfocamereRequest('SCP');
});

test('Test: Successfull complete onboarding request of PRV for product prod-interop search from infocamere with tax code', async () => {
  await completeOnboardingPdndInfocamereRequest('PRV');
});