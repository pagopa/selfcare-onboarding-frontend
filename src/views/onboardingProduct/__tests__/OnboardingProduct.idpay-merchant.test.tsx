import '@testing-library/jest-dom';
import { test, vi } from 'vitest';
import { mockedPdndVisuraInfomacere } from '../../../lib/__mocks__/mockApiRequests';
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

test('Test: Successfull complete onboarding request of PRV party for prod-idpay-merchant search by taxCode', async () => {
  renderComponent(PRODUCT_IDS.IDPAY_MERCHANT);
  await executeStepInstitutionType(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV');
  await executeStepSearchParty(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    mockedPdndVisuraInfomacere[0].businessName,
    'taxCode',
    fetchWithLogsSpy,
    undefined,
    '12345678901'
  );
  await executeStepBillingData(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV', false, false, 'PDND_INFOCAMERE');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false, PRODUCT_IDS.IDPAY_MERCHANT);
  await verifySubmit(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    fetchWithLogsSpy,
    'PDND_INFOCAMERE',
    false,
    false,
    'taxCode'
  );
  await executeGoHome(mockedLocation);
}, 80000);

test('Test: Successfull complete onboarding request of PRV party for prod-idpay-merchant search by reaCode', async () => {
  renderComponent(PRODUCT_IDS.IDPAY_MERCHANT);
  await executeStepInstitutionType(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV');
  await executeStepSearchParty(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    mockedPdndVisuraInfomacere[0].businessName,
    'reaCode',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    'MI-123456'
  );
  await executeStepBillingData(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV', false, false, 'PDND_INFOCAMERE');
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false, PRODUCT_IDS.IDPAY_MERCHANT);
  await verifySubmit(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    fetchWithLogsSpy,
    'PDND_INFOCAMERE',
    false,
    false,
    'taxCode'
  );
  await executeGoHome(mockedLocation);
});

test('Test: Successfull complete onboarding request of PRV_PF party for prod-idpay-merchant search by personalTaxCode', async () => {
  renderComponent(PRODUCT_IDS.IDPAY_MERCHANT);
  await executeStepInstitutionType(PRODUCT_IDS.IDPAY_MERCHANT, 'PRV');
  await executeStepSearchParty(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV',
    mockedPdndVisuraInfomacere[5].businessName,
    'personalTaxCode',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    undefined,
    'LGGLGD80A01B354S'
  );
  await executeStepBillingData(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV_PF',
    false,
    false,
    'PDND_INFOCAMERE',
    undefined,
    false,
    false,
    'personalTaxCode'
  );
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false, PRODUCT_IDS.IDPAY_MERCHANT);
  await verifySubmit(
    PRODUCT_IDS.IDPAY_MERCHANT,
    'PRV_PF',
    fetchWithLogsSpy,
    'PDND_INFOCAMERE',
    false,
    false,
    'personalTaxCode'
  );
  await executeGoHome(mockedLocation);
});