import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import '../../../locale';
import { PRODUCT_IDS } from '../../../utils/constants';
import { ENV } from '../../../utils/env';
import { phaseOutProductResponse, respondWith } from './shared/apiOverrides';
import { renderComponent } from './shared/stepHelpers';
import { mockedHistoryPush, mockedLocation, setupTestHooks } from './shared/testSetup';

// Characterization tests: they pin down the current navigation of the OnboardingProduct wizard
// (step transitions, back targets and entry points) so that it can be refactored safely.

vi.setConfig({ testTimeout: 80000 });

const mockedHistoryGoBack = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useHistory: () => ({
    location: mockedLocation,
    replace: (nextLocation: any) => Object.assign(mockedLocation, nextLocation),
    push: mockedHistoryPush,
    goBack: mockedHistoryGoBack,
  }),
}));
vi.mock('axios');

setupTestHooks(() => {
  mockedLocation.assign.mockClear();
  mockedHistoryGoBack.mockClear();
});

describe('Outcome pages', () => {
  test('A1: a product in phase-out shows the phase-out error page', async () => {
    respondWith('ONBOARDING_VERIFY_PRODUCT', phaseOutProductResponse(PRODUCT_IDS.PAGOPA));

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => screen.getByText(/a breve non sarà/));
    expect(screen.queryByText('Seleziona il tipo di ente che rappresenti')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Torna alla home' }));
    expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING);
  });

  test('A2: a pricing plan other than FA shows the invalid pricing plan page', async () => {
    mockedLocation.search = '?pricingPlan=XX';

    renderComponent(PRODUCT_IDS.PAGOPA);

    await waitFor(() => screen.getByText(/Non riusciamo a trovare la pagina che stai cercando/));
    expect(screen.queryByText('Seleziona il tipo di ente che rappresenti')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Torna alla home' }));
    expect(mockedLocation.assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING);
  });
});
