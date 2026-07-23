import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import UploadDocumentsFlow from '../UploadDocumentsFlow';

// Stub children/services to drive the orchestration without the full upload UI.
vi.mock('../step/StepUploadDocuments', () => ({
  default: ({ forward, back }: any) => (
    <>
      <button type="button" onClick={forward}>
        go-to-summary
      </button>
      <button type="button" onClick={back}>
        back-to-admin
      </button>
    </>
  ),
}));

vi.mock('../step/UploadedContractsSummary', () => ({
  default: ({ forward }: any) => (
    <button type="button" onClick={forward}>
      open-confirm
    </button>
  ),
}));

vi.mock('../../../../components/modals/ConfirmOnboardingRequest', () => ({
  ConfirmOnboardingModal: ({ open, onConfirm }: any) =>
    open ? (
      <button type="button" onClick={onConfirm}>
        confirm-submit
      </button>
    ) : null,
}));

vi.mock('../../../../services/documentServices', () => ({
  fetchRequiredDocuments: vi.fn(() => Promise.resolve()),
  submitDocuments: vi.fn((_id, _rd, _docs, _err, _load, onSuccess) => onSuccess()),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it('test UploadDocumentsFlow reaches summary, confirms, submits and calls onSuccess', async () => {
  const onSuccess = vi.fn();

  renderComponentWithProviders(
    <UploadDocumentsFlow
      onboardingId="onb-1"
      productId="prod-pagopa"
      institutionType="GSP"
      origin="SELC"
      onSuccess={onSuccess}
      back={vi.fn()}
    />
  );

  // The required documents are fetched behind a loading overlay, so the step mounts asynchronously.
  fireEvent.click(await screen.findByText('go-to-summary'));
  fireEvent.click(screen.getByText('open-confirm'));
  fireEvent.click(screen.getByText('confirm-submit'));

  expect(onSuccess).toHaveBeenCalled();
});

it('test UploadDocumentsFlow back from the first document step goes back to the admin step', async () => {
  const back = vi.fn();

  renderComponentWithProviders(
    <UploadDocumentsFlow
      onboardingId="onb-1"
      productId="prod-pagopa"
      institutionType="GSP"
      origin="SELC"
      onSuccess={vi.fn()}
      back={back}
    />
  );

  fireEvent.click(await screen.findByText('back-to-admin'));

  expect(back).toHaveBeenCalled();
});
