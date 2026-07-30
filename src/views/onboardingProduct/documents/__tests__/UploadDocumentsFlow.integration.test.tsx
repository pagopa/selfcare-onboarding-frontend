import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosResponse } from 'axios';
import { beforeEach, expect, it, type MockInstance, vi } from 'vitest';
import * as apiUtils from '../../../../lib/api-utils';
import { mockedRequiredDocuments } from '../../../../lib/__mocks__/mockApiRequests';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { renderComponentWithProviders } from '../../../../utils/test/test-utils';
import UploadDocumentsFlow from '../UploadDocumentsFlow';

const ONBOARDING_ID = 'onb-1';

const STATUTO_CARD_TITLE = 'DOCUMENTAZIONE SULLA NATURA GIURIDICA';
const VISURA_CARD_TITLE = 'VISURA CAMERALE';
const GSP_CARD_TITLE = 'DOCUMENTAZIONE SULLA GESTIONE DEL SERVIZIO PUBBLICO';
const SUMMARY_TITLE = 'Riepilogo documenti caricati';

const actualFetchWithLogs = apiUtils.fetchWithLogs;
let fetchWithLogsSpy: MockInstance;

const pdf = (name: string, size: number = 1024) =>
  new File([new Uint8Array(size)], name, { type: 'application/pdf' });

const fileInputs = () =>
  Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"]'));

const uploadFile = async (file: File, uploaderIndex: number = 0) => {
  await userEvent.upload(fileInputs()[uploaderIndex], file);
  await screen.findByText(file.name);
};

const clickForward = () => fireEvent.click(screen.getByRole('button', { name: 'Continua' }));

const respondWith = (endpoint: string, response: unknown) =>
  fetchWithLogsSpy.mockImplementation((path: any, config: any, onRedirectToLogin: any) =>
    path?.endpoint === endpoint
      ? Promise.resolve(response as AxiosResponse)
      : actualFetchWithLogs(path, config, onRedirectToLogin)
  );

const onlyRequiredDocument = (index: number) =>
  respondWith('GET_REQUIRED_DOCUMENTS', {
    data: [mockedRequiredDocuments[index]],
    status: 200,
    statusText: '200',
  });

const failEndpoint = (endpoint: string) =>
  respondWith(endpoint, { isAxiosError: true, response: { data: '', status: 500 } });

const attachmentUploads = () =>
  fetchWithLogsSpy.mock.calls
    .filter((call: any) => call[0]?.endpoint === 'ONBOARDING_POST_ATTACHMENT')
    .map((call: any) => ({
      filename: call[0].endpointParams.filename,
      attachmentId: (call[1].data as FormData).get('attachmentId'),
      description: (call[1].data as FormData).get('attachmentDescription'),
    }));

const triggerOnboardingCalls = () =>
  fetchWithLogsSpy.mock.calls.filter((call: any) => call[0]?.endpoint === 'TRIGGER_ONBOARDING');

const renderFlow = () => {
  const onSuccess = vi.fn();
  const back = vi.fn();

  renderComponentWithProviders(
    <UploadDocumentsFlow
      onboardingId={ONBOARDING_ID}
      productId={PRODUCT_IDS.PAGOPA}
      institutionType="GSP"
      origin="SELC"
      onSuccess={onSuccess}
      back={back}
    />,
    PRODUCT_IDS.PAGOPA
  );

  return { onSuccess, back };
};

const submitFromSummary = async () => {
  await screen.findByText(SUMMARY_TITLE);
  clickForward();
  fireEvent.click(await screen.findByRole('button', { name: 'Conferma' }));
};

beforeEach(() => {
  vi.clearAllMocks();
  if (fetchWithLogsSpy) {
    fetchWithLogsSpy.mockRestore();
  }
  fetchWithLogsSpy = vi.spyOn(apiUtils, 'fetchWithLogs');
});

it('test upload documents flow uploads every required document and triggers the onboarding', async () => {
  const { onSuccess } = renderFlow();

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

  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi un altro documento' }));
  const titles = await screen.findAllByLabelText('Titolo del documento');
  fireEvent.change(titles[1], { target: { value: 'Delibera 12' } });
  await uploadFile(pdf('delibera.pdf'));
  clickForward();

  await screen.findByText(SUMMARY_TITLE);
  expect(screen.getByText('statuto.pdf')).toBeInTheDocument();
  expect(screen.getByText('visura.pdf')).toBeInTheDocument();
  expect(screen.getByText('attestazione.pdf')).toBeInTheDocument();
  expect(screen.getByText('delibera.pdf')).toBeInTheDocument();

  clickForward();
  fireEvent.click(await screen.findByRole('button', { name: 'Conferma' }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalled());

  expect(attachmentUploads()).toEqual([
    { filename: 'statuto.pdf', attachmentId: 'statuto', description: null },
    { filename: 'visura-camerale.pdf', attachmentId: 'visura-camerale', description: null },
    {
      filename: 'attestazione-gsp.pdf',
      attachmentId: 'attestazione-gsp',
      description: 'Convenzione 2024',
    },
    {
      filename: 'attestazione-gsp-2.pdf',
      attachmentId: 'attestazione-gsp',
      description: 'Delibera 12',
    },
  ]);
  expect(triggerOnboardingCalls()).toHaveLength(1);
});

it('test upload documents flow blocks the step when the required file is missing', async () => {
  onlyRequiredDocument(0);
  renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  clickForward();

  expect(screen.getByText('Carica il file per proseguire.')).toBeInTheDocument();
  expect(screen.queryByText(SUMMARY_TITLE)).not.toBeInTheDocument();

  await uploadFile(pdf('statuto.pdf'));
  clickForward();

  await screen.findByText(SUMMARY_TITLE);
  expect(screen.queryByText('Carica il file per proseguire.')).not.toBeInTheDocument();
});

it('test upload documents flow rejects a file bigger than 1MB', async () => {
  onlyRequiredDocument(0);
  renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  await userEvent.upload(fileInputs()[0], pdf('big.pdf', 1024 * 1024 + 1));

  expect(await screen.findByText('Il file è troppo grande.')).toBeInTheDocument();
  expect(screen.queryByText('big.pdf')).not.toBeInTheDocument();
});

it('test upload documents flow removes an uploaded file and shows the uploader again', async () => {
  onlyRequiredDocument(0);
  renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  await uploadFile(pdf('statuto.pdf'));

  fireEvent.click(screen.getByRole('button', { name: 'Rimuovi il file caricato' }));

  await waitFor(() => expect(screen.queryByText('statuto.pdf')).not.toBeInTheDocument());
  expect(screen.getByText('Trascina qui il documento')).toBeInTheDocument();
});

it('test upload documents flow requires a title for every document of a multiple upload', async () => {
  onlyRequiredDocument(2);
  renderFlow();

  await screen.findByText(GSP_CARD_TITLE);
  await uploadFile(pdf('attestazione.pdf'));
  clickForward();

  expect(screen.getByText('Carica il file per proseguire.')).toBeInTheDocument();
  expect(screen.queryByText(SUMMARY_TITLE)).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Titolo del documento'), {
    target: { value: 'Convenzione 2024' },
  });
  clickForward();

  await screen.findByText(SUMMARY_TITLE);
});

it('test upload documents flow removes an extra document of a multiple upload', async () => {
  onlyRequiredDocument(2);
  renderFlow();

  await screen.findByText(GSP_CARD_TITLE);
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi un altro documento' }));

  await waitFor(() => expect(screen.getAllByLabelText('Titolo del documento')).toHaveLength(2));

  fireEvent.click(screen.getByRole('button', { name: 'Rimuovi il file caricato' }));

  await waitFor(() => expect(screen.getAllByLabelText('Titolo del documento')).toHaveLength(1));
});

it('test upload documents flow goes back from the summary keeping the uploaded file', async () => {
  onlyRequiredDocument(0);
  renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  await uploadFile(pdf('statuto.pdf'));
  clickForward();

  await screen.findByText(SUMMARY_TITLE);
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));

  await screen.findByText(STATUTO_CARD_TITLE);
  expect(screen.getByText('statuto.pdf')).toBeInTheDocument();
});

it('test upload documents flow goes back to the previous onboarding step from the first document', async () => {
  onlyRequiredDocument(0);
  const { back } = renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }));

  expect(back).toHaveBeenCalled();
});

it('test upload documents flow shows the failure page when an attachment upload fails', async () => {
  onlyRequiredDocument(0);
  const { onSuccess } = renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  await uploadFile(pdf('statuto.pdf'));
  clickForward();

  failEndpoint('ONBOARDING_POST_ATTACHMENT');
  await submitFromSummary();

  expect(await screen.findByText('Caricamento non riuscito')).toBeInTheDocument();
  expect(onSuccess).not.toHaveBeenCalled();
  expect(triggerOnboardingCalls()).toHaveLength(0);

  fireEvent.click(screen.getByRole('button', { name: 'Carica di nuovo' }));

  await screen.findByText(SUMMARY_TITLE);
});

it('test upload documents flow shows the failure page when the onboarding trigger fails', async () => {
  onlyRequiredDocument(0);
  const { onSuccess } = renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  await uploadFile(pdf('statuto.pdf'));
  clickForward();

  failEndpoint('TRIGGER_ONBOARDING');
  await submitFromSummary();

  expect(await screen.findByText('Caricamento non riuscito')).toBeInTheDocument();
  expect(attachmentUploads()).toHaveLength(1);
  expect(onSuccess).not.toHaveBeenCalled();
});

it('test upload documents flow ignores a file whose format is not allowed', async () => {
  onlyRequiredDocument(0);
  renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  fireEvent.change(fileInputs()[0], {
    target: { files: [new File(['content'], 'statuto.txt', { type: 'text/plain' })] },
  });

  await waitFor(() => expect(screen.getByText('Trascina qui il documento')).toBeInTheDocument());
  expect(screen.queryByText('statuto.txt')).not.toBeInTheDocument();
});

it('test upload documents flow stops adding documents once the maximum is reached', async () => {
  onlyRequiredDocument(2);
  renderFlow();

  await screen.findByText(GSP_CARD_TITLE);
  fireEvent.click(screen.getByRole('button', { name: 'Aggiungi un altro documento' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Aggiungi un altro documento' }));

  await waitFor(() => expect(screen.getAllByLabelText('Titolo del documento')).toHaveLength(3));
  expect(
    screen.queryByRole('button', { name: 'Aggiungi un altro documento' })
  ).not.toBeInTheDocument();
});

it('test upload documents flow sends nothing when the confirmation modal is dismissed', async () => {
  onlyRequiredDocument(0);
  const { onSuccess } = renderFlow();

  await screen.findByText(STATUTO_CARD_TITLE);
  await uploadFile(pdf('statuto.pdf'));
  clickForward();

  await screen.findByText(SUMMARY_TITLE);
  clickForward();

  const modal = await screen.findByRole('dialog');
  fireEvent.click(within(modal).getByRole('button', { name: 'Indietro' }));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(attachmentUploads()).toHaveLength(0);
  expect(triggerOnboardingCalls()).toHaveLength(0);
  expect(onSuccess).not.toHaveBeenCalled();
  expect(screen.getByText(SUMMARY_TITLE)).toBeInTheDocument();
});

it('test upload documents flow renders no step when the required documents cannot be retrieved', async () => {
  failEndpoint('GET_REQUIRED_DOCUMENTS');
  renderFlow();

  expect(await screen.findByText('Inserisci i documenti')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Continua' })).not.toBeInTheDocument();
});
