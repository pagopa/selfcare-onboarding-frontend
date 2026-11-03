import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComponentProps } from 'react';
import { OnboardingApi } from '../../../../api/OnboardingApiClient';
import { StepUploadAggregates } from '../StepUploadAggregates';

vi.mock('../../../../api/OnboardingApiClient', () => ({
  OnboardingApi: { verifyAggregatesCsv: vi.fn() },
}));

const csv = new File(['a'], 'aggregates.csv', { type: 'text/csv' });
const forward = vi.fn();
const setLoading = vi.fn();
const setOutcome = vi.fn();

const renderStep = (props: Partial<ComponentProps<typeof StepUploadAggregates>> = {}) =>
  render(
    <StepUploadAggregates
      loading={false}
      setLoading={setLoading}
      setOutcome={setOutcome}
      productId="prod-io"
      productName="App IO"
      partyName="Comune"
      forward={forward}
      back={vi.fn()}
      {...props}
    />
  );

const selectFile = (file: File) =>
  fireEvent.change(document.getElementById('file-uploader') as HTMLInputElement, {
    target: { files: [file] },
  });

const forwardButton = () => screen.getByRole('button', { name: 'Continua' });

beforeEach(() => {
  vi.clearAllMocks();
  window.URL.createObjectURL = vi.fn(() => 'blob:errors');
});

test('forward is disabled until a csv file is uploaded and can be cleared', async () => {
  renderStep();
  expect(forwardButton()).toBeDisabled();

  selectFile(csv);
  expect(await screen.findByText('aggregates.csv')).toBeInTheDocument();
  expect(forwardButton()).toBeEnabled();

  fireEvent.click(screen.getByRole('button', { name: 'Cancella il file caricato' }));
  await waitFor(() => expect(screen.queryByText('aggregates.csv')).not.toBeInTheDocument());
  expect(forwardButton()).toBeDisabled();
});

test('a file that is not a csv shows the invalid format alert', async () => {
  renderStep();

  selectFile(new File(['a'], 'a.pdf', { type: 'application/pdf' }));

  expect(
    await screen.findByText('È possibile caricare solo file in formato .csv')
  ).toBeInTheDocument();
  expect(forwardButton()).toBeDisabled();
});

test('a valid csv is verified and forwarded with the aggregates', async () => {
  vi.mocked(OnboardingApi.verifyAggregatesCsv).mockResolvedValue({
    aggregates: [{ taxCode: '123' }],
    errors: [],
  });
  renderStep({ institutionType: 'PA' });

  selectFile(csv);
  await screen.findByText('aggregates.csv');
  fireEvent.click(forwardButton());

  await waitFor(() => expect(forward).toHaveBeenCalledWith(undefined, [{ taxCode: '123' }]));
  expect(OnboardingApi.verifyAggregatesCsv).toHaveBeenCalledWith(csv, 'prod-io', 'PA');
});

test('row errors show the report alert with a downloadable csv', async () => {
  vi.mocked(OnboardingApi.verifyAggregatesCsv).mockResolvedValue({
    errors: [
      { riga: 3, 'codice fiscale': 'CF3', errore: null },
      { riga: 2, 'codice fiscale': 'CF2', errore: 'bad' },
    ],
  } as never);
  renderStep();

  selectFile(csv);
  await screen.findByText('aggregates.csv');
  fireEvent.click(forwardButton());

  expect(await screen.findByText('Il file contiene uno o più errori')).toBeInTheDocument();
  expect(forward).not.toHaveBeenCalled();
  expect(screen.getByRole('link', { name: 'Scarica il report' })).toHaveAttribute(
    'href',
    'blob:errors'
  );

  const blob = vi.mocked(window.URL.createObjectURL).mock.calls[0][0] as Blob;
  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    // eslint-disable-next-line functional/immutable-data
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });
  expect(text.split('\r\n')).toEqual(['riga,codice fiscale,errore', '3,"CF3",""', '2,"CF2","bad"']);
});

test('a failing verification sets the generic outcome', async () => {
  vi.mocked(OnboardingApi.verifyAggregatesCsv).mockRejectedValue(new Error('boom'));
  renderStep();

  selectFile(csv);
  await screen.findByText('aggregates.csv');
  fireEvent.click(forwardButton());

  await waitFor(() => expect(setOutcome).toHaveBeenCalled());
  expect(forward).not.toHaveBeenCalled();
});
