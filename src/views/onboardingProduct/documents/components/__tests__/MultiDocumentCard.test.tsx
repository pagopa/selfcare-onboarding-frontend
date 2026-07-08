import { fireEvent, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { RequiredDocument, UploadedDocument } from '../../../../../model/Documents';
import { renderComponentWithProviders } from '../../../../../utils/test/test-utils';
import MultiDocumentCard from '../MultiDocumentCard';

const requiredDocument: RequiredDocument = {
  id: 'attestazione-gsp',
  name: 'Attestazione di gestione del servizio pubblico',
  labelKey: 'attestazione-gsp',
  required: true,
  mimeType: 'application/pdf',
  maxDocumentsRequired: 3,
  storageOrigin: 'USER',
};

const documents: Array<UploadedDocument> = [
  { id: 'attestazione-gsp-1', documentCode: 'attestazione-gsp', name: 'A', title: '' },
];

it('test MultiDocumentCard appends a new instance when adding another document', () => {
  const setDocuments = vi.fn();

  renderComponentWithProviders(
    <MultiDocumentCard
      requiredDocument={requiredDocument}
      documents={documents}
      handleNext={vi.fn()}
      handleBack={vi.fn()}
      updateDocument={vi.fn()}
      removeDocument={vi.fn()}
      renderUploader={() => <div>uploader</div>}
      setDocuments={setDocuments}
      loading={false}
    />
  );

  fireEvent.click(screen.getByText('Aggiungi un altro documento'));

  expect(setDocuments).toHaveBeenCalled();
});
