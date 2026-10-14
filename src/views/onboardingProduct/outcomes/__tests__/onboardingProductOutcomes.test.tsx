import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'i18next';
import { InstitutionType, RequestOutcomeMessage } from '../../../../../types';
import { ENV } from '../../../../utils/env';
import { buildNotAllowedError, buildOutcomeContent } from '../onboardingProductOutcomes';

const renderOutcome = (outcome: RequestOutcomeMessage) =>
  render(
    <>
      {outcome.description.map((node, i) => (
        <div key={i}>{node}</div>
      ))}
    </>
  );

describe('onboardingProductOutcomes', () => {
  it.each<[string, InstitutionType | undefined, string, RegExp]>([
    ['tech partner', 'PT', 'onboarding.success.flow.techPartner.title', /esito della richiesta/],
    ['public administration', 'PA', 'onboarding.success.flow.product.title', /PEC primario/],
    ['other institution type', 'GSP', 'onboarding.success.flow.product.title', /PEC indicato\./],
    [
      'missing institution type',
      undefined,
      'onboarding.success.flow.product.title',
      /PEC indicato\./,
    ],
  ])('success page for %s', (_, institutionType, titleKey, description) => {
    renderOutcome(buildOutcomeContent(institutionType, i18n.t).success);

    expect(screen.getByText(i18n.t(titleKey))).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('error page shows the generic error and goes back to the landing', async () => {
    const orig = window.location;
    const assign = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...orig, assign },
      configurable: true,
    });
    try {
      renderOutcome(buildOutcomeContent('PA', i18n.t).error);

      expect(screen.getByText(i18n.t('onboarding.error.title'))).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: i18n.t('onboarding.backHome') }));
      expect(assign).toHaveBeenCalledWith(ENV.URL_FE.LANDING);
    } finally {
      Object.defineProperty(window, 'location', { value: orig, configurable: true });
    }
  });

  it('not allowed page shows party name and product title', () => {
    renderOutcome(buildNotAllowedError('Comune di Prova', 'App IO'));

    expect(
      screen.getByText(i18n.t('stepVerifyOnboarding.userNotAllowedError.title'))
    ).toBeInTheDocument();
    expect(screen.getByText(/Comune di Prova/)).toBeInTheDocument();
    expect(screen.getByText(/App IO/)).toBeInTheDocument();
  });
});
