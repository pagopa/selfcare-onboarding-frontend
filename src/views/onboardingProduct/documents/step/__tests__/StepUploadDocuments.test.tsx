import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { RequiredDocument, UploadedDocument } from '../../../../../model/Documents';
import { renderComponentWithProviders } from '../../../../../utils/test/test-utils';
import StepUploadDocuments from '../StepUploadDocuments';

// Mock the uploader so we can drive onDropAccepted with a controlled file.
vi.mock('../../components/DocumentUploader', () => ({
  DocumentUploader: ({ onDropAccepted }: any) => (
    <button
      type="button"
      onClick={() =>
        onDropAccepted(
          new File([new Uint8Array(1024 * 1024 + 1)], 'big.pdf', { type: 'application/pdf' })
        )
      }
    >
      drop-large
    </button>
  ),
}));

const requiredDocuments: Array<RequiredDocument> = [
  {
    id: 'statuto',
    name: 'Statuto Ente',
    labelKey: 'statuto',
    required: true,
    mimeType: 'application/pdf',
    maxDocumentsRequired: 1,
    storageOrigin: 'USER',
  },
];

const documents: Array<UploadedDocument> = [
  { id: 'statuto-1', documentCode: 'statuto', name: 'Statuto', title: '' },
];

const renderStep = (forward = vi.fn()) =>
  renderComponentWithProviders(
    <StepUploadDocuments
      requiredDocuments={requiredDocuments}
      documents={documents}
      setDocuments={vi.fn()}
      loading={false}
      forward={forward}
    />
  );

it('test StepUploadDocuments shows the required alert when continuing without a file', () => {
  const forward = vi.fn();
  renderStep(forward);

  fireEvent.click(screen.getByRole('button', { name: 'Continua' }));

  expect(screen.getByText('Carica il file per proseguire.')).toBeInTheDocument();
  expect(forward).not.toHaveBeenCalled();
});

it('test StepUploadDocuments shows the file-too-large alert on an oversized file', () => {
  renderStep();

  fireEvent.click(screen.getByText('drop-large'));

  expect(screen.getByText('Il file è troppo grande.')).toBeInTheDocument();
});
