import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import { useState } from 'react';
import { User } from '../../../types';
import { HeaderContext, UserContext } from '../../lib/context';
import { ENV } from '../../utils/env';
import OnBoardingSubProduct from '../OnBoardingSubProduct/OnBoardingSubProduct';
import './../../locale';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'History';

jest.mock('../../lib/api-utils');

jest.setTimeout(20000);

let fetchWithLogsSpy: jest.SpyInstance;

beforeEach(() => {
  fetchWithLogsSpy = jest.spyOn(require('../../lib/api-utils'), 'fetchWithLogs');
});

const oldWindowLocation = global.window.location;
const initialLocation = {
  assign: jest.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
  state: undefined,
};
const mockedLocation = Object.assign({}, initialLocation);

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});
afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

beforeEach(() => Object.assign(mockedLocation, initialLocation));

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation) => Object.assign(mockedLocation, nextLocation),
  }),
}));

const renderComponent = () => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onLogout, setOnLogout] = useState<(() => void) | null | undefined>();

    const history = createMemoryHistory();
    const route = '/:productId/:subProductId';
    history.push(route);

    return (
      <HeaderContext.Provider
        value={{ subHeaderVisible, setSubHeaderVisible, onLogout, setOnLogout }}
      >
        <UserContext.Provider
          value={{ user, setUser, requiredLogin: false, setRequiredLogin: () => {} }}
        >
          <Router history={history}>
            <button onClick={onLogout}>LOGOUT</button>
            <OnBoardingSubProduct />
          </Router>
        </UserContext.Provider>
      </HeaderContext.Provider>
    );
  };
  render(<Component />);
};

const stepSelectInstitutionUnreleatedTitle = 'Seleziona il tuo ente';
const stepSelectInstitutionReleatedTitle = "Seleziona l'ente";
// stepBillingDataTitle = 'Indica i dati del tuo ente';
// stepAddManagerTitle = 'Indica il Legale rappresentante';
// successOnboardingSubProductTitle = 'La tua richiesta è stata inviata con successo';

test('test already subscribed to premium', async () => {
  renderComponent();
  await executeStepSelectInstitutionUnreleated('agency onboarded');
  await waitFor(() => screen.getByText('Sottoscrizione già avvenuta'));
  await executeGoLanding();
});

test('test not base product adhesion', async () => {
  renderComponent();
  await executeStepSelectInstitutionUnreleated('agency onboarded');
  await waitFor(() => screen.getByText("L'ente non ha aderito al prodotto"));
  await executeGoLanding();
});

const executeStepSelectInstitutionUnreleated = async (partyName: string) => {
  console.log('Testing step select institution UNRELEATED');

  screen.getByText(stepSelectInstitutionUnreleatedTitle);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties');

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'XXX' } });

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));
  expect(fetchWithLogsSpy).toBeCalledTimes(2);

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Conferma' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
};

const executeStepSelectInstitutionreleated = async (partyName: string) => {
  console.log('Testing step select institution RELEATED');

  screen.getByText(stepSelectInstitutionReleatedTitle);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(1));
  const inputPartyName = document.getElementById('Parties');

  expect(inputPartyName).toBeTruthy();
  fireEvent.change(inputPartyName, { target: { value: 'XXX' } });

  const partyNameSelection = await waitFor(() => screen.getByText(partyName));
  expect(fetchWithLogsSpy).toBeCalledTimes(2);

  fireEvent.click(partyNameSelection);

  const confirmButton = screen.getByRole('button', { name: 'Conferma' });
  expect(confirmButton).toBeEnabled();

  fireEvent.click(confirmButton);
  await waitFor(() => expect(fetchWithLogsSpy).toBeCalledTimes(3));
};

const executeGoLanding = async () => {
  console.log('Go Home');
  const goHomeButton = screen.getByRole('button', {
    name: 'Chiudi',
  });
  expect(goHomeButton).toBeEnabled();
  fireEvent.click(goHomeButton);
  await waitFor(() => expect(mockedLocation.assign).toBeCalledWith(ENV.URL_FE.LANDING));
};
