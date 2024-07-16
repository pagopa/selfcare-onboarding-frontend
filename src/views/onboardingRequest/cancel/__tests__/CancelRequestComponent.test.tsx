import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ENV } from '../../../../utils/env';
import CancelRequestPage from '../pages/CancelRequestPage';
import '../../../../locale';
import { buildAssistanceURI } from '@pagopa/selfcare-common-frontend/lib/services/assistanceService';
import CancelRequestComponent from '../CancelRequest';

jest.mock('../../../../lib/api-utils');

let fetchWithLogsSpy: jest.SpyInstance;

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../../../lib/api-utils'), 'fetchWithLogs');
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

jest.mock('@pagopa/selfcare-common-frontend/lib/services/assistanceService', () => ({
  buildAssistanceURI: jest.fn(),
}));

test("Test: The onboarding request can't be cancel because is not found (jwt queryparam is empty)", async () => {
  mockedLocation.search = 'jwt=';

  render(<CancelRequestComponent />);
  await waitFor(() => screen.getByText('La pagina che cercavi non è disponibile'));
  const assistanceButton = screen.getByRole('button', {
    name: 'Contatta l’assistenza',
  });

  fireEvent.click(assistanceButton);
  // TODO Deprecated
  waitFor(() => expect(buildAssistanceURI).toBeCalledWith(ENV.ASSISTANCE.EMAIL));
});

test("Test: The onboarding request can't be cancel because is not found (not found the request jwt)", async () => {
  mockedLocation.search = 'jwt=wrongJwt';
  render(<CancelRequestComponent />);
  await waitFor(() => screen.getByText('La pagina che cercavi non è disponibile'));
  const assistanceButton = screen.getByText('Contatta l’assistenza');

  fireEvent.click(assistanceButton);
  // TODO Deprecated
  waitFor(() => expect(buildAssistanceURI).toBeCalledWith(ENV.ASSISTANCE.EMAIL));
});

test("Test: The onboarding request can't be cancel because is already approved", async () => {
  mockedLocation.search = 'jwt=alreadyApproved';
  render(<CancelRequestComponent />);

  await waitFor(() => screen.getByText('La richiesta di adesione è stata accettata'));
  const login = screen.getByText('Accedi');

  fireEvent.click(login);
  // TODO Deprecated
  waitFor(() => expect(buildAssistanceURI).toBeCalledWith(ENV.URL_FE.LOGIN));
});

test("Test: The onboarding request can't be cancel because is expired", async () => {
  mockedLocation.search = 'jwt=expired';
  render(<CancelRequestComponent />);

  await waitFor(() => screen.getByText('La richiesta di adesione è scaduta'));
  const login = screen.getByText('Torna alla home');

  fireEvent.click(login);
  // TODO Deprecated
  waitFor(() => expect(buildAssistanceURI).toBeCalledWith(ENV.URL_FE.LANDING));
});

test('Test: The jwt exist and the request is correctly retrieved, cancel onboarding request flow is started and correcly deleted', async () => {
  mockedLocation.search = 'jwt=pendingRequest';
  render(<CancelRequestComponent />);

  await waitFor(() => {
    screen.getByText('Vuoi eliminare la richiesta di adesione?', { exact: false });
  });

  const confirm = screen.getByText('Elimina la richiesta');
  fireEvent.click(confirm);

  await waitFor(() => {
    screen.getByText('Richiesta di adesione eliminata');
  });

  const goHome = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  fireEvent.click(goHome);

  // TODO Deprecated
  expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING);
  expect(fetchWithLogsSpy).toBeCalledTimes(1);
});

// TODO Review this
test('Test: The jwt exist and the request is correctly retrieved, cancel onboarding request flow is started and NOT correcly deleted', async () => {
  mockedLocation.search = 'jwt=error';
  render(<CancelRequestPage />);

  await waitFor(() => {
    screen.getByText('Se la elimini, tutti i dati inseriti verranno persi.');
  });

  const confirm = screen.getByRole('button', {
    name: 'Elimina la richiesta',
  });

  fireEvent.dblClick(confirm);

  const goHome = screen.getByRole('button', {
    name: 'Torna alla home',
  });
  fireEvent.click(goHome);

  // TODO Deprecated
  expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING);
});
