import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import '../../../locale';
import { PRODUCT_IDS } from '../../../utils/constants';
import { ENV } from '../../../utils/env';
import { performLogout } from '../../../utils/test/test-utils';
import {
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

test('Test: Party already onboarded for a product that allow add new user, so the link is available', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'PA',
    'AGENCY ONBOARDED',
    'businessName',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true
  );
  await waitFor(() => screen.getByText(/L'ente selezionato ha già aderito/));
});

test('Test: Error retrieving onboarding info', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'PA',
    'AGENCY INFO ERROR',
    'businessName',
    fetchWithLogsSpy,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true
  );
  await waitFor(() => screen.getByText('Qualcosa è andato storto'));
});

test('Test: Invalid productId', async () => {
  renderComponent('error');
  await waitFor(() => expect(fetchWithLogsSpy).toHaveBeenCalledTimes(2));
  await waitFor(() => {
    expect(screen.getByText('Impossibile individuare il prodotto desiderato')).toBeInTheDocument();
  });
});

test('Test: Exiting during flow with unload event', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'PA',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy
  );
  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  await waitFor(
    () =>
      (event.returnValue as unknown as string) ===
      "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it."
  );
});

test('Test: Exiting during flow with logout', async () => {
  renderComponent(PRODUCT_IDS.IO);
  await executeStepInstitutionType(PRODUCT_IDS.IO, 'PA');

  await executeStepSearchParty(
    PRODUCT_IDS.IO,
    'PA',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy
  );

  expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull();

  const logoutButton = screen.getByText('LOGOUT');
  await performLogout(logoutButton);

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
  await waitFor(() => expect(screen.queryByText('Vuoi davvero uscire?')).toBeNull());

  await performLogout(logoutButton);
  fireEvent.click(screen.getByRole('button', { name: 'Esci' }));
  await waitFor(() => expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGOUT));
});

test('Test: Search trying to type invalid characters', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  const inputPartyName = document.getElementById('Parties') as HTMLElement;

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'AGENCY X ())!/!/££!' } });

  await waitFor(() => screen.getByText('AGENCY X'));
});

test('Test: RecipientCode input client validation', async () => {
  renderComponent(PRODUCT_IDS.PAGOPA);
  await executeStepInstitutionType(PRODUCT_IDS.PAGOPA, 'PA');
  await executeStepSearchParty(
    PRODUCT_IDS.PAGOPA,
    'PA',
    'AGENCY X',
    'businessName',
    fetchWithLogsSpy
  );
  const confirmButtonEnabled = await waitFor(() =>
    screen.getByRole('button', { name: 'Continua' })
  );
  fireEvent.click(confirmButtonEnabled);

  const recipientCodeInput = document.getElementById('recipientCode') as HTMLInputElement;

  fireEvent.input(recipientCodeInput, { target: { value: 'abc123!@#' } });
  expect(recipientCodeInput.value).toBe('ABC123');

  fireEvent.input(recipientCodeInput, { target: { value: '!@#$%^&*' } });
  expect(recipientCodeInput.value).toBe('');

  fireEvent.input(recipientCodeInput, { target: { value: 'ab@c1#2' } });
  expect(recipientCodeInput.value).toBe('ABC12');

  fireEvent.input(recipientCodeInput, { target: { value: 'AB123CD' } });
  expect(recipientCodeInput.value).toBe('AB123CD');
});