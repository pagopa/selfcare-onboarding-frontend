import { fireEvent, render, screen } from '@testing-library/react';
import { RtpServiceTypeEnum } from '../../../api/generated/onboarding/RtpServiceType';
import StepServicesChoice from '../StepServicesChoice';

const RTP_LABEL = 'Servizio Request to Pay (RTP)';
const REPOSITORY_LABEL = 'Servizio di Gestione e Consultazione del Repository';

test('forward is disabled until a service is selected and returns the rtpServiceTypes', () => {
  const forward = vi.fn();
  const back = vi.fn();
  render(<StepServicesChoice forward={forward} back={back} />);

  const continueButton = screen.getByRole('button', { name: 'Continua' });
  expect(continueButton).toBeDisabled();

  fireEvent.click(screen.getByLabelText(RTP_LABEL));
  expect(continueButton).toBeEnabled();
  fireEvent.click(continueButton);
  expect(forward).toHaveBeenCalledWith([RtpServiceTypeEnum.RTP]);

  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));
  expect(back).toHaveBeenCalled();
});

test('restores the initial rtpServiceTypes and keeps the enum order on change', () => {
  const forward = vi.fn();
  render(
    <StepServicesChoice
      forward={forward}
      back={vi.fn()}
      initialServiceTypes={[RtpServiceTypeEnum.REPOSITORY_CONSULTATION]}
    />
  );

  expect(screen.getByLabelText(REPOSITORY_LABEL)).toBeChecked();
  expect(screen.getByLabelText(RTP_LABEL)).not.toBeChecked();

  fireEvent.click(screen.getByLabelText(RTP_LABEL));
  fireEvent.click(screen.getByRole('button', { name: 'Continua' }));
  expect(forward).toHaveBeenLastCalledWith([
    RtpServiceTypeEnum.RTP,
    RtpServiceTypeEnum.REPOSITORY_CONSULTATION,
  ]);

  fireEvent.click(screen.getByLabelText(REPOSITORY_LABEL));
  fireEvent.click(screen.getByRole('button', { name: 'Continua' }));
  expect(forward).toHaveBeenLastCalledWith([RtpServiceTypeEnum.RTP]);
});
