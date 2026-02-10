import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import App from '../App';
import { ROUTES } from '../utils/constants';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import './../locale';
import { createStore } from '../redux/store';
import { Provider } from 'react-redux';

vi.mock('../views/onboardingProduct/OnboardingProduct', () => ({
  default: () => 'OnboardingProduct',
}));
vi.mock('../views/onboardingRequest/cancel/CancelRequest', () => ({
  default: () => 'Cancel onboarding request',
}));
vi.mock('../views/onboardingRequest/complete/CompleteRequest', () => ({
  default: () => 'Complete onboarding request',
}));

let history: any;
let store: any;

beforeEach(() => {
  history = createMemoryHistory();
  store = createStore();
});

test('test not served path', () => {
  history.push('/some/bad/route');
  vi.spyOn(history, 'push');

  render(
    <Router history={history}>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  );
  expect(history.location.pathname).toBe(ROUTES.ONBOARDING_ROOT.PATH);
  checkRedirect(history, false);
});

test('test OnBoarding', () => {
  history.push('/onboarding/PRODUCTID');
  vi.spyOn(history, 'push');
  render(
    <Router history={history}>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  );
  screen.getByText('OnboardingProduct');
  checkRedirect(history, false);
});

test('test Reject OnBoarding', () => {
  history.push('/onboarding/cancel');
  vi.spyOn(history, 'push');

  render(
    <Router history={history}>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  );
  screen.getByText('Cancel onboarding request');
  checkRedirect(history, false);
});

test('test Confirm OnBoarding', () => {
  history.push('/onboarding/confirm');
  vi.spyOn(history, 'push');

  render(
    <Router history={history}>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  );
  screen.getByText('Complete onboarding request');
  checkRedirect(history, false);
});

function checkRedirect(history: any, expected: boolean) {
  expect(history.push.mock.calls.length).toBe(expected ? 1 : 0);
}
