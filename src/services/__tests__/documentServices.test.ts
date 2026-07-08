import { beforeEach, expect, it, vi } from 'vitest';
import { OnboardingApi } from '../../api/OnboardingApiClient';
import { RequiredDocument, UploadedDocument } from '../../model/Documents';
import { fetchRequiredDocuments, requiredDocumentsFlow, submitDocuments } from '../documentServices';

vi.mock('../../api/OnboardingApiClient', () => ({
  OnboardingApi: {
    getRequiredDocumentsEnabled: vi.fn(),
    getRequiredDocuments: vi.fn(),
    uploadAttachment: vi.fn(),
    triggerOnboarding: vi.fn(),
  },
}));

const addError = vi.fn();
const setRequiredDocumentsEnabled = vi.fn();
const setRequiredDocuments = vi.fn();
const setLoading = vi.fn();
const onSuccess = vi.fn();
const onError = vi.fn();

const mockedRequiredDocuments: Array<RequiredDocument> = [
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

beforeEach(() => {
  vi.clearAllMocks();
});

it('test requiredDocumentsFlow success sets the enabled flag', async () => {
  vi.mocked(OnboardingApi.getRequiredDocumentsEnabled).mockResolvedValue({
    requiredDocumentsEnabled: true,
  });

  await requiredDocumentsFlow('prod-pagopa', 'GSP', 'SELC', addError, setRequiredDocumentsEnabled);

  expect(setRequiredDocumentsEnabled).toHaveBeenCalledWith(true);
  expect(addError).not.toHaveBeenCalled();
});

it('test requiredDocumentsFlow failure notifies error and disables the flow', async () => {
  vi.mocked(OnboardingApi.getRequiredDocumentsEnabled).mockRejectedValue(new Error('boom'));

  await requiredDocumentsFlow('prod-pagopa', 'GSP', 'SELC', addError, setRequiredDocumentsEnabled);

  expect(addError).toHaveBeenCalled();
  expect(setRequiredDocumentsEnabled).toHaveBeenCalledWith(false);
});

it('test fetchRequiredDocuments success sets the documents list', async () => {
  vi.mocked(OnboardingApi.getRequiredDocuments).mockResolvedValue(mockedRequiredDocuments);

  await fetchRequiredDocuments('prod-pagopa', 'GSP', 'SELC', addError, setRequiredDocuments);

  expect(setRequiredDocuments).toHaveBeenCalledWith(mockedRequiredDocuments);
  expect(addError).not.toHaveBeenCalled();
});

it('test fetchRequiredDocuments failure notifies error and sets an empty list', async () => {
  vi.mocked(OnboardingApi.getRequiredDocuments).mockRejectedValue(new Error('boom'));

  await fetchRequiredDocuments('prod-pagopa', 'GSP', 'SELC', addError, setRequiredDocuments);

  expect(addError).toHaveBeenCalled();
  expect(setRequiredDocuments).toHaveBeenCalledWith([]);
});

it('test submitDocuments uploads each file then triggers onboarding and calls onSuccess', async () => {
  vi.mocked(OnboardingApi.uploadAttachment).mockResolvedValue(undefined);
  vi.mocked(OnboardingApi.triggerOnboarding).mockResolvedValue(undefined);
  const file = new File(['content'], 'statuto.pdf', { type: 'application/pdf' });
  const documents: Array<UploadedDocument> = [
    { id: 'statuto-1', documentCode: 'statuto', name: 'Statuto', title: '', file },
  ];

  await submitDocuments(
    'onb-1',
    mockedRequiredDocuments,
    documents,
    addError,
    setLoading,
    onSuccess,
    onError
  );

  expect(OnboardingApi.uploadAttachment).toHaveBeenCalledWith(
    'onb-1',
    'statuto',
    file,
    'statuto',
    undefined
  );
  expect(OnboardingApi.triggerOnboarding).toHaveBeenCalledWith('onb-1');
  expect(onSuccess).toHaveBeenCalled();
  expect(onError).not.toHaveBeenCalled();
});

it('test submitDocuments failure notifies error and calls onError', async () => {
  vi.mocked(OnboardingApi.uploadAttachment).mockRejectedValue(new Error('boom'));
  const file = new File(['content'], 'statuto.pdf', { type: 'application/pdf' });
  const documents: Array<UploadedDocument> = [
    { id: 'statuto-1', documentCode: 'statuto', name: 'Statuto', title: '', file },
  ];

  await submitDocuments(
    'onb-1',
    mockedRequiredDocuments,
    documents,
    addError,
    setLoading,
    onSuccess,
    onError
  );

  expect(addError).toHaveBeenCalled();
  expect(onError).toHaveBeenCalled();
  expect(onSuccess).not.toHaveBeenCalled();
});
