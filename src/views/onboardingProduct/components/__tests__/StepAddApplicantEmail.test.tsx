import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import StepAddApplicantEmail from '../StepAddApplicantEmail';

const user = { uid: 'uid', taxCode: 'TAXCODE', name: 'Mario', surname: 'Rossi', email: '' } as any;

const renderStep = (forward: () => void, isRequiredDocumentsFlow?: boolean) =>
  renderComponentWithProviders(
    <StepAddApplicantEmail
      forward={forward}
      back={vi.fn()}
      user={user}
      addUser={false}
      partyName="test party"
      productName="Piattaforma pagoPA"
      isRequiredDocumentsFlow={isRequiredDocumentsFlow}
    />
  );

const fillEmailAndContinue = () => {
  fireEvent.change(screen.getByTestId('email-applicant-test'), {
    target: { value: 'mario@rossi.it' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continua' }));
};

it('test StepAddApplicantEmail in required documents flow forwards without confirmation modal', () => {
  const forward = vi.fn();
  renderStep(forward, true);

  fillEmailAndContinue();

  expect(forward).toHaveBeenCalledWith({
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario@rossi.it',
  });
  expect(screen.queryByText('Confermi la richiesta di invio?')).not.toBeInTheDocument();
});

it('test StepAddApplicantEmail in standard flow opens the confirmation modal', () => {
  const forward = vi.fn();
  renderStep(forward);

  fillEmailAndContinue();

  expect(screen.getByText('Confermi la richiesta di invio?')).toBeInTheDocument();
  expect(forward).not.toHaveBeenCalled();
});
