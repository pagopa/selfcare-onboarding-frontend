import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ENV } from '../../utils/env';
import RejectRegistration from '../RejectRegistration';
import './../../locale';

jest.mock('../../lib/api-utils');

let fetchWithLogsSpy: jest.SpyInstance;

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../lib/api-utils'), 'fetchWithLogs');
});

const oldWindowLocation = global.window.location;
const mockedLocation = {
  assign: jest.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
};

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: mockedLocation,
    replace: jest.fn(),
  }),
}));

test('test no jwt', async () => {
  mockedLocation.search = undefined;

  render(<RejectRegistration />);
  await waitFor(() => screen.getByText('Qualcosa è andato storto.'));
  const backButton = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  fireEvent.click(backButton);
  expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING);

  expect(fetchWithLogsSpy).toBeCalledTimes(0);
});

test('test', async () => {
  mockedLocation.search = 'jwt=asd';
  render(<RejectRegistration />);
  await waitFor(() => screen.getByText('Se la elimini, tutti i dati inseriti verranno persi.'));
  const confirmButton = screen.getByRole('button', {
    name: 'Elimina la richiesta',
  });
  fireEvent.click(confirmButton);
  await waitFor(() => {
    screen.getByText('Richiesta di adesione eliminata');
  });
  expect(fetchWithLogsSpy).toBeCalledTimes(2);
});

test('test cancel error', async () => {
  mockedLocation.search = 'jwt=error';
  render(<RejectRegistration />);

  await waitFor(() => {
    screen.getByText('Se la elimini, tutti i dati inseriti verranno persi.');
  });
  const confirmButton = screen.getByRole('button', {
    name: 'Elimina la richiesta',
  });
  fireEvent.click(confirmButton);
  await waitFor(() => {
    screen.getByText('Qualcosa è andato storto.');
  });
  const goHomeButton = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  fireEvent.click(goHomeButton);
  expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING);

  expect(fetchWithLogsSpy).toBeCalledTimes(2);
});
