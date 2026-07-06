import { RequiredDocument } from '../../model/Documents';

// TEMPORARY DEV MOCK — used while the required-documents BFF endpoints are not yet
// available on the backend. Remove this file and restore the real calls in
// OnboardingApiClient.ts once the backend exposes required-documents.
export const mockRequiredDocuments: Array<RequiredDocument> = [
  {
    id: 'statuto',
    name: 'Statuto Ente',
    labelKey: 'statuto',
    required: true,
    mimeType: 'application/pdf',
    maxDocumentsRequired: 1,
    storageOrigin: 'USER',
  },
  {
    id: 'visura-camerale',
    name: 'Visura Camerale',
    labelKey: 'visura',
    required: true,
    mimeType: 'application/pdf',
    maxDocumentsRequired: 1,
    storageOrigin: 'USER',
  },
  {
    id: 'attestazione-gsp',
    name: 'Attestazione di gestione del servizio pubblico',
    labelKey: 'attestazione-gsp',
    required: true,
    mimeType: 'application/pdf',
    maxDocumentsRequired: 3,
    storageOrigin: 'USER',
  },
];
