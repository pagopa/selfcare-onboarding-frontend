export type UploadedDocument = {
  id: string;
  documentCode: string;
  name: string;
  title: string;
  file?: File;
  documentType?: DocumentType;
  documentOrigin?: string;
};

export type DocumentType = 'REQUIRED' | 'GENERIC';

// Mirrors RequiredDocumentModel in the BFF swagger (onboarding-api-docs.json).
export type RequiredDocument = {
  id: string;
  name: string;
  labelKey: string;
  required: boolean;
  mimeType: string;
  maxDocumentsRequired?: number;
  storageOrigin: 'USER' | 'SYSTEM';
};

export type RequiredDocumentsEnabled = {
  requiredDocumentsEnabled: boolean;
};
