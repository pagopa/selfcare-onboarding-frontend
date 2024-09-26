import { render, screen } from '@testing-library/react';
import App from '../App';
import { ROUTES } from '../utils/constants';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import './../locale';

jest.mock('../views/onboardingProduct/OnboardingProduct', () => () => 'OnboardingProduct');
jest.mock(
  '../views/onboardingRequest/cancel/CancelRequest',
  () => () => 'Cancel onboarding request'
);
jest.mock(
  '../views/onboardingRequest/complete/CompleteRequest',
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
  screen.getByText('OnboardingProduct');
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
