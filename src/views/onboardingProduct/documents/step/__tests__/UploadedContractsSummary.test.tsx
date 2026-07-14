import { screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { RequiredDocument, UploadedDocument } from '../../../../../model/Documents';
import { renderComponentWithProviders } from '../../../../../utils/test/test-utils';
import UploadedContractsSummary from '../UploadedContractsSummary';

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

it('test UploadedContractsSummary shows the uploaded file name for a single document', () => {
  const file = new File(['content'], 'statuto.pdf', { type: 'application/pdf' });
  const documents: Array<UploadedDocument> = [
    { id: 'statuto-1', documentCode: 'statuto', name: 'Statuto', title: '', file },
  ];

  renderComponentWithProviders(
    <UploadedContractsSummary
      requiredDocuments={requiredDocuments}
      documents={documents}
      forward={() => undefined}
      back={() => undefined}
    />
  );

  expect(screen.getByText('statuto.pdf')).toBeInTheDocument();
});
