import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CompleteRegistrationComponent from '../CompleteRegistrationComponent';
import './../../locale';
import { buildAssistanceURI } from '@pagopa/selfcare-common-frontend/services/assistanceService';
import { ENV } from '../../utils/env';

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

jest.mock('@pagopa/selfcare-common-frontend/services/assistanceService', () => ({
  buildAssistanceURI: jest.fn(),
}));

test('test no jwt', () => {
  mockedLocation.search = undefined;

  render(<CompleteRegistrationComponent />);

  const homeButton = screen.getByRole('button', {
    name: 'Torna alla home',
  });

  fireEvent.click(homeButton);
  expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING);
});

test('test', async () => {
  mockedLocation.search = 'jwt=asd';

  render(<CompleteRegistrationComponent />);
  await waitFor(() => screen.getByText('Segui le istruzioni'));
  const goOnButton = await waitFor(() =>
    screen.getByRole('button', {
      name: 'Continua',
    })
  );
  fireEvent.click(goOnButton);
  screen.getByText('selezionalo dal tuo computer');

  const sendButton = screen.getByRole('button', {
    name: 'Continua',
  });
  expect(sendButton).toBeDisabled();
});
