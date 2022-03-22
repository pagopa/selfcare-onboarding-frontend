import { render, screen } from '@testing-library/react';
import App from '../App';
import { ROUTES } from '../utils/constants';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import './../locale';

jest.mock('../views/Onboarding', () => () => 'ONBOARDING');
jest.mock('../views/RejectRegistration', () => () => 'REJECT ONBOARDING');
jest.mock('../views/CompleteRegistrationComponent', () => () => 'CONFIRM ONBOARDING');

let history;

beforeEach(() => {
  history = createMemoryHistory();
});

test('test not served path', () => {
  history.push('/some/bad/route');
  jest.spyOn(history, 'push');

  render(
    <Router history={history}>
      <App />
    </Router>
  );
  expect(history.location.pathname).toBe(ROUTES.ONBOARDING_ROOT.PATH);
  checkRedirect(history, false);
});

test('test OnBoarding', () => {
  history.push('/onboarding/PRODUCTID');
  jest.spyOn(history, 'push');
  render(
    <Router history={history}>
      <App />
    </Router>
  );
  screen.getByText('ONBOARDING');
  checkRedirect(history, false);
});

test('test Reject OnBoarding', () => {
  history.push('/onboarding/cancel');
  jest.spyOn(history, 'push');

  render(
    <Router history={history}>
      <App />
    </Router>
  );
  screen.getByText('REJECT ONBOARDING');
  checkRedirect(history, false);
});

test('test Confirm OnBoarding', () => {
  history.push('/onboarding/confirm');
  jest.spyOn(history, 'push');

  render(
    <Router history={history}>
      <App />
    </Router>
  );
  screen.getByText('CONFIRM ONBOARDING');
  checkRedirect(history, false);
});

function checkRedirect(history, expected: boolean) {
  expect(history.push.mock.calls.length).toBe(expected ? 1 : 0);
}
