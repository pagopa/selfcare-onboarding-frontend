import { fireEvent, getByText, render, screen, waitFor } from '@testing-library/react';
import { fetchWithLogs } from '../../lib/api-utils';
import { URL_FE_LANDING } from '../../utils/constants';
import RejectRegistration from '../RejectRegistration';

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

test('test no jwt', () => {
  mockedLocation.search = undefined;

  render(<RejectRegistration />);

  screen.getByText('Spiacenti, qualcosa è andato storto.');
  const goHomeButton = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  fireEvent.click(goHomeButton);
  expect(mockedLocation.assign).toBeCalledWith(URL_FE_LANDING);

  expect(fetchWithLogsSpy).toBeCalledTimes(0);
});

test('test', async () => {
  mockedLocation.search = 'jwt=asd';
  render(<RejectRegistration />);

  await waitFor(() => {
    expect(fetchWithLogsSpy).toBeCalledTimes(1);
    screen.getByText('La tua richiesta di adesione è stata annullata');
    const goHomeButton = screen.getByRole('button', {
      name: 'Torna alla home',
    });
    fireEvent.click(goHomeButton);
    expect(mockedLocation.assign).toBeCalledWith(URL_FE_LANDING);
  });
});

test('test cancel error', async () => {
  mockedLocation.search = 'jwt=error';
  render(<RejectRegistration />);

  await waitFor(() => {
    expect(fetchWithLogsSpy).toBeCalledTimes(1);
    screen.getByText('Spiacenti, qualcosa è andato storto.');
    const goHomeButton = screen.getByRole('button', {
      name: 'Torna alla home',
    });
    fireEvent.click(goHomeButton);
    expect(mockedLocation.assign).toBeCalledWith(URL_FE_LANDING);
  });
});
