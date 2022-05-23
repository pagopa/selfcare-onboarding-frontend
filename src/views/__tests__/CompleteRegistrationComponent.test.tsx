import { fireEvent, render, screen } from '@testing-library/react';
import CompleteRegistrationComponent from '../CompleteRegistrationComponent';
import './../../locale';
import { buildAssistanceURI } from '@pagopa/selfcare-common-frontend/services/assistanceService';

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

  render(<CompleteRegistrationComponent assistanceEmail="assistance.selfcare@email.com" />);

  const assistanceButton = screen.getByRole('button', {
    name: 'Contatta l’assistenza',
  });

  fireEvent.click(assistanceButton);
  expect(buildAssistanceURI).toBeCalledWith('assistance.selfcare@email.com');
});

test('test', async () => {
  mockedLocation.search = 'jwt=asd';
  render(<CompleteRegistrationComponent />);

  const goOnButton = screen.getByRole('button', {
    name: 'Continua',
  });
  fireEvent.click(goOnButton);

  const sendButton = screen.getByRole('button', {
    name: 'Continua',
  });
  expect(sendButton).toBeDisabled();

  screen.getByText('selezionalo dal tuo computer');
});
