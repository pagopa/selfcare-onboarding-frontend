import { render, screen } from '@testing-library/react';
import App from '../App';
import { ROUTES } from '../utils/constants';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import './../locale';

jest.mock('../views/onboarding/Onboarding', () => () => 'Onboarding');
jest.mock(
  '../views/uploadContract/cancel/CancelRequestComponent',
  () => () => 'Cancel onboarding request'
);
jest.mock(
  '../views/uploadContract/complete/CompleteRequestComponent',
  () => () => 'Complete onboarding request'
);

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
  screen.getByText('Onboarding');
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
  screen.getByText('Cancel onboarding request');
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
  screen.getByText('Complete onboarding request');
  checkRedirect(history, false);
});

function checkRedirect(history, expected: boolean) {
  expect(history.push.mock.calls.length).toBe(expected ? 1 : 0);
}
