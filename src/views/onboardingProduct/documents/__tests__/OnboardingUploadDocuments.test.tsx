import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosResponse } from 'axios';
import { afterAll, beforeAll, beforeEach, expect, it, type MockInstance, vi } from 'vitest';
import * as apiUtils from '../../../../lib/api-utils';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import OnboardingUploadDocuments from '../OnboardingUploadDocuments';

vi.setConfig({ testTimeout: 80000 });

const mockedLocation = {
  assign: vi.fn(),
  pathname: '',
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
};

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useParams: () => ({}),
}));

const oldWindowLocation = window.location;
const actualFetchWithLogs = apiUtils.fetchWithLogs;
let fetchWithLogsSpy: MockInstance;

const STATUTO_CARD_TITLE = 'DOCUMENTAZIONE SULLA NATURA GIURIDICA';
const VISURA_CARD_TITLE = 'VISURA CAMERALE';
const GSP_CARD_TITLE = 'DOCUMENTAZIONE SULLA GESTIONE DEL SERVIZIO PUBBLICO';

const pdf = (name: string) =>
  new File([new Uint8Array(1024)], name, { type: 'application/pdf' });

const fileInputs = () =>
  Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"]'));

const clickForward = () => fireEvent.click(screen.getByRole('button', { name: 'Continua' }));

const uploadFile = async (file: File) => {
  await userEvent.upload(fileInputs()[0], file);
  await screen.findByText(file.name);
};

const respondWith = (endpoint: string, response: unknown) =>
  fetchWithLogsSpy.mockImplementation((path: any, config: any, onRedirectToLogin: any) =>
    path?.endpoint === endpoint
      ? Promise.resolve(response as AxiosResponse)
      : actualFetchWithLogs(path, config, onRedirectToLogin)
  );

const renderRoute = (jwt: string) => {
  mockedLocation.search = jwt ? `jwt=${jwt}` : '';
  renderComponentWithProviders(<OnboardingUploadDocuments />);
};

const uploadEveryRequiredDocument = async () => {
  await screen.findByText(STATUTO_CARD_TITLE);
  await uploadFile(pdf('statuto.pdf'));
  clickForward();

  await screen.findByText(VISURA_CARD_TITLE);
  await uploadFile(pdf('visura.pdf'));
  clickForward();

  await screen.findByText(GSP_CARD_TITLE);
  fireEvent.change(screen.getByLabelText('Titolo del documento'), {
    target: { value: 'Convenzione 2024' },
  });
  await uploadFile(pdf('attestazione.pdf'));
  clickForward();

  await screen.findByText('Riepilogo documenti caricati');
  clickForward();
  fireEvent.click(await screen.findByRole('button', { name: 'Conferma' }));
};

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

beforeEach(() => {
  vi.clearAllMocks();
  if (fetchWithLogsSpy) {
    fetchWithLogsSpy.mockRestore();
  }
  fetchWithLogsSpy = vi.spyOn(apiUtils, 'fetchWithLogs');
});

it('test OnboardingUploadDocuments shows the not found page without a request id', async () => {
  renderRoute('');

  expect(await screen.findByText('La pagina che cercavi non è disponibile')).toBeInTheDocument();
});

it('test OnboardingUploadDocuments shows the not found page when the request does not exist', async () => {
  renderRoute('wrongJwt');

  expect(await screen.findByText('La pagina che cercavi non è disponibile')).toBeInTheDocument();
});

it('test OnboardingUploadDocuments shows the already accepted page', async () => {
  renderRoute('alreadyApproved');

  expect(
    await screen.findByText('La richiesta di adesione è stata accettata')
  ).toBeInTheDocument();
});

it('test OnboardingUploadDocuments shows the cancelled request page', async () => {
  renderRoute('alreadyRejected');

  expect(await screen.findByText('La richiesta di adesione è stata annullata')).toBeInTheDocument();
});

it('test OnboardingUploadDocuments shows the expired request page', async () => {
  renderRoute('expired');

  expect(await screen.findByText('La richiesta di adesione è scaduta')).toBeInTheDocument();
});

it('test OnboardingUploadDocuments uploads the required documents and confirms the request', async () => {
  renderRoute('pendingRequest');

  await uploadEveryRequiredDocument();

  expect(await screen.findByText('Adesione completata!')).toBeInTheDocument();
  expect(
    fetchWithLogsSpy.mock.calls
      .filter((call: any) => call[0]?.endpoint === 'ONBOARDING_POST_ATTACHMENT')
      .map((call: any) => call[0].endpointParams.filename)
  ).toEqual(['statuto.pdf', 'visura-camerale.pdf', 'attestazione-gsp.pdf']);
});

it('test OnboardingUploadDocuments falls back to the contract upload when documents are not enabled', async () => {
  respondWith('REQUIRED_DOCUMENTS_ENABLED', {
    data: { requiredDocumentsEnabled: false },
    status: 200,
    statusText: '200',
  });
  renderRoute('pendingRequest');

  expect(await screen.findByText('Carica l’accordo firmato')).toBeInTheDocument();
  expect(screen.queryByText(STATUTO_CARD_TITLE)).not.toBeInTheDocument();
});

it('test OnboardingUploadDocuments warns when the dropped file has the wrong format', async () => {
  renderRoute('pendingRequest');

  await screen.findByText(STATUTO_CARD_TITLE);
  fireEvent.change(fileInputs()[0], {
    target: { files: [new File(['content'], 'statuto.txt', { type: 'text/plain' })] },
  });

  expect(await screen.findByText(/Carica un solo file in formato/)).toBeInTheDocument();
});

it('test OnboardingUploadDocuments warns when the upload fails', async () => {
  renderRoute('pendingRequest');

  await screen.findByText(STATUTO_CARD_TITLE);
  respondWith('ONBOARDING_POST_ATTACHMENT', {
    isAxiosError: true,
    response: { data: '', status: 500 },
  });

  await uploadEveryRequiredDocument();

  expect(
    await screen.findByText(/Torna indietro e caricalo di nuovo/)
  ).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('Adesione completata!')).not.toBeInTheDocument());
});
