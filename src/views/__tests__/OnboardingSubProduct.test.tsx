import { render, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { User } from '../../../types';
import { HeaderContext, UserContext } from '../../lib/context';
import OnBoardingSubProduct from '../OnBoardingSubProduct/OnBoardingSubProduct';
import './../../locale';

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

    return (
      <HeaderContext.Provider
        value={{ subHeaderVisible, setSubHeaderVisible, onLogout, setOnLogout }}
      >
        <UserContext.Provider
          value={{ user, setUser, requiredLogin: false, setRequiredLogin: () => {} }}
        >
          <button onClick={onLogout}>LOGOUT</button>
          <OnBoardingSubProduct />
        </UserContext.Provider>
      </HeaderContext.Provider>
    );
  };

  render(<Component />);
};

test('test already onboarded to premium', async () => {});

test('test not have base product', async () => {});
