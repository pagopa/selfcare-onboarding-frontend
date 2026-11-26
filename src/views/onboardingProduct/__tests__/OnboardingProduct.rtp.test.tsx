import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { RtpServiceTypeEnum } from '../../../api/generated/onboarding/RtpServiceType';
import '../../../locale';
import { PRODUCT_IDS } from '../../../utils/constants';
import { executeStepAddAdmin, executeStepAddManager } from '../../../utils/test/test-utils';
import { renderComponent, waitForSearchFormToSettle } from './shared/stepHelpers';
import { fetchWithLogsSpy, setupTestHooks } from './shared/testSetup';

vi.setConfig({ testTimeout: 80000 });
vi.mock('axios');

setupTestHooks();

const BILLING_TITLE = 'Dati dell’ente';
const RTP_PSP_TAX_CODE = '25301208621';

const clickContinue = async () => {
  const continueButton = screen.getByRole('button', { name: 'Continua' });
  await waitFor(() => expect(continueButton).toBeEnabled());
  fireEvent.click(continueButton);
};

const selectRtpPsp = async () => {
  await waitFor(() => screen.getByText('Cerca il tuo ente'));
  await waitForSearchFormToSettle();
  fireEvent.change(document.getElementById('Parties') as HTMLElement, {
    target: { value: RTP_PSP_TAX_CODE },
  });
  fireEvent.click(await waitFor(() => screen.getByText('antico credito arcorese')));
  await clickContinue();
};

const submittedRtpServiceTypes = () =>
  fetchWithLogsSpy.mock.calls
    .filter(([{ endpoint }]) => endpoint === 'ONBOARDING_POST_LEGALS')
    .map(
      ([, { data }]) => (data as { rtpServiceTypes?: Array<RtpServiceTypeEnum> }).rtpServiceTypes
    );

test('prod-rtp: skips the services choice and always sends rtpServiceTypes RTP on submit', async () => {
  // PSP is the only institution type of prod-rtp: the wizard lands on the party search
  renderComponent(PRODUCT_IDS.RTP);
  await selectRtpPsp();

  await waitFor(() => screen.getByText(BILLING_TITLE));
  await clickContinue();
  await executeStepAddManager(false);
  await executeStepAddAdmin(true, false, false, false, false, false);

  expect(submittedRtpServiceTypes()).toEqual([[RtpServiceTypeEnum.RTP]]);
});