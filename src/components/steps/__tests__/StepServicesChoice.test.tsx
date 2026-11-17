import { fireEvent, render, screen } from '@testing-library/react';
import StepServicesChoice from '../StepServicesChoice';

test('forward is disabled until a service is selected and returns the choice', () => {
  const forward = vi.fn();
  const back = vi.fn();
  render(<StepServicesChoice forward={forward} back={back} />);

  const continueButton = screen.getByRole('button',   { name: 'Continua' });
  expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText('Servizio Request to Pay (RTP)'));
  expect(continueButton).toBeEnabled();
  fireEvent.click(continueButton);
  expect(forward).toHaveBeenCalledWith({ rtp: true, repository: false });

  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));
  expect(back).toHaveBeenCalled();
});
