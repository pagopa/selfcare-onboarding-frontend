import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CompleteRequestComponent from '../CompleteRequest';
import '../../../../locale';
import React from 'react';
import { ENV } from '../../../../utils/env';
import { buildAssistanceURI } from '@pagopa/selfcare-common-frontend/lib/services/assistanceService';
import userEvent from '@testing-library/user-event';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';

jest.setTimeout(40000);

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: mockedLocation,
    replace: jest.fn(),
  }),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/services/assistanceService', () => ({
  buildAssistanceURI: jest.fn(),
}));

let mockedContract: File;

const oldWindowLocation = global.window.location;
const mockedLocation = {
  assign: jest.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
};

beforeAll(() => {
  i18n.changeLanguage('it');
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
  waitFor(() => expect(buildAssistanceURI).toBeCalledWith(ENV.ASSISTANCE.EMAIL));
});

test('Test: The jwt is non-existent and the onboarding request is not retrieved, so the error page is showed', async () => {
  mockedLocation.search = 'jwt=wrongJwt';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La pagina che cercavi non è disponibile'));
  const assistanceButton = screen.getByText('Contatta l’assistenza');

  fireEvent.click(assistanceButton);
  waitFor(() => expect(buildAssistanceURI).toBeCalledWith(ENV.ASSISTANCE.EMAIL));
});

test('Test: The jwt exist and the request is correct retrieved, but it is already approved', async () => {
  mockedLocation.search = 'jwt=alreadyApproved';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La richiesta di adesione è stata accettata'));
  const login = screen.getByText('Accedi');

  fireEvent.click(login);
  waitFor(() => expect(buildAssistanceURI).toBeCalledWith(ENV.URL_FE.LOGIN));
});

test('Test: The jwt exist but is expired', async () => {
  mockedLocation.search = 'jwt=expired';
  render(<CompleteRequestComponent />);

  await waitFor(() => screen.getByText('La richiesta di adesione è scaduta'));
  const login = screen.getByText('Torna alla home');

  fireEvent.click(login);
  waitFor(() => expect(buildAssistanceURI).toBeCalledWith(ENV.URL_FE.LANDING));
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
  });
  expect(submit).toBeDisabled();

  const upload = document.getElementById('file-uploader') as HTMLElement;

  userEvent.upload(upload, mockedContract);
});
