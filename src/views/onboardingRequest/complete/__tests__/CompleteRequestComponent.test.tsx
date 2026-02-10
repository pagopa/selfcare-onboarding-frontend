import { buildAssistanceURI } from '@pagopa/selfcare-common-frontend/lib/services/assistanceService';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import '../../../../locale';
import { ENV } from '../../../../utils/env';
import CompleteRequestComponent from '../CompleteRequest';
;

vi.setConfig({ testTimeout: 40000 });

vi.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: mockedLocation,
    replace: vi.fn(),
  }),
}));

vi.mock('react-router', () => ({
  useParams: () => ({}),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/services/assistanceService', () => ({
  buildAssistanceURI: vi.fn(),
}));

let mockedContract: File;

const oldWindowLocation = global.window.location;
const mockedLocation = {
  assign: vi.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
};

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});

beforeEach(() => {
  mockedContract = new File(['pdf'], 'contract.pdf', { type: 'multipart/form-data' });
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

test('Test: The jwt is not present and the onboarding request is not retrieved, so the error page is showed', async () => {
  mockedLocation.search = 'jwt=';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La pagina che cercavi non è disponibile'));
  const assistanceButton = screen.getByRole('button', {
    name: 'Contatta l’assistenza',
  });

  fireEvent.click(assistanceButton);
  waitFor(() => expect(buildAssistanceURI).toHaveBeenCalledWith(ENV.ASSISTANCE.EMAIL));
});

test('Test: The jwt is non-existent and the onboarding request is not retrieved, so the error page is showed', async () => {
  mockedLocation.search = 'jwt=wrongJwt';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La pagina che cercavi non è disponibile'));
  const assistanceButton = screen.getByText('Contatta l’assistenza');

  fireEvent.click(assistanceButton);
  waitFor(() => expect(buildAssistanceURI).toHaveBeenCalledWith(ENV.ASSISTANCE.EMAIL));
});

test('Test: The jwt exist and the request is correct retrieved, but it is already approved', async () => {
  mockedLocation.search = 'jwt=alreadyApproved';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La richiesta di adesione è stata accettata'));
  const login = screen.getByText('Accedi');

  fireEvent.click(login);
  waitFor(() => expect(buildAssistanceURI).toHaveBeenCalledWith(`${ENV.URL_FE.LOGIN}/login?onSuccess=`));
});

test('Test: The jwt exist but is expired', async () => {
  mockedLocation.search = 'jwt=expired';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La richiesta di adesione è scaduta'));
  const login = screen.getByText('Torna alla home');

  fireEvent.click(login);
  waitFor(() => expect(buildAssistanceURI).toHaveBeenCalledWith(ENV.URL_FE.LANDING));
});

test('Test: The jwt exist and the request is correctly retrieved and waiting for upload/download contract, starting the upload flow', async () => {
  mockedLocation.search = 'jwt=pendingRequest';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('Carica l’accordo firmato'));
  await waitFor(() => screen.getByText('Scarica l’accordo di adesione'));

  const uploadContract = await waitFor(() =>
    screen.getByRole('button', {
      name: 'Vai al caricamento',
    })
  );
  fireEvent.click(uploadContract);
  screen.getByText('carica il file');

  const submit = screen.getByRole('button', {
    name: 'Continua',
  }) as HTMLButtonElement;
  expect(submit.disabled).toBe(true);

  const upload = document.getElementById('file-uploader') as HTMLElement;

  userEvent.upload(upload, mockedContract);
});
