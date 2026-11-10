import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import App from '../App';
import { ROUTES } from '../utils/constants';
import { MemoryRouter, useLocation } from 'react-router';
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

let store: any;
let currentPath: string;

const LocationSpy = () => {
  currentPath = useLocation().pathname;
  return null;
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Provider store={store}>
        <App />
        <LocationSpy />
      </Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  store = createStore();
});

test('test not served path', () => {
  renderAt('/some/bad/route');
  expect(currentPath).toBe(ROUTES.ONBOARDING_ROOT.PATH);
});

test('test deeper path under a product redirects to the product', () => {
  renderAt('/onboarding/PRODUCTID/sub/other');
  expect(currentPath).toBe('/onboarding/PRODUCTID');
  screen.getByText('OnboardingProduct');
});

test('test OnBoarding', () => {
  renderAt('/onboarding/PRODUCTID');
  screen.getByText('OnboardingProduct');
  expect(currentPath).toBe('/onboarding/PRODUCTID');
});

test('test Reject OnBoarding', () => {
  renderAt('/onboarding/cancel');
  screen.getByText('Cancel onboarding request');
  expect(currentPath).toBe('/onboarding/cancel');
});

test('test Confirm OnBoarding', () => {
  renderAt('/onboarding/confirm');
  screen.getByText('Complete onboarding request');
  expect(currentPath).toBe('/onboarding/confirm');
});

test('test Confirm OnBoarding keeps matching sub paths', () => {
  renderAt('/onboarding/confirm/extra');
  screen.getByText('Complete onboarding request');
});
