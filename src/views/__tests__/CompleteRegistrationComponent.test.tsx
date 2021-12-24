import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { URL_FE_LANDING } from '../../utils/constants';
import CompleteRegistrationComponent from '../CompleteRegistrationComponent';

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

  render(<CompleteRegistrationComponent />);

  const goHomeButton = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  fireEvent.click(goHomeButton);
  expect(mockedLocation.assign).toBeCalledWith(URL_FE_LANDING);
});

test('test', async () => {
  mockedLocation.search = 'jwt=asd';
  render(<CompleteRegistrationComponent />);

  const goOnButton = screen.getByRole('button', {
    name: 'Continua',
  });
  fireEvent.click(goOnButton);

  const sendButton = screen.getByRole('button', {
    name: 'Invia',
  });
  expect(sendButton).toBeDisabled();

  screen.getByText('selezionalo dal tuo computer');
});
