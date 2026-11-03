import { createTheme } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { FileUploader } from '../FileUploader';

const theme = createTheme();
const file = new File(['data'], 'contract.pdf', { type: 'application/pdf' });

const renderUploader = (options: Partial<ComponentProps<typeof FileUploader>> = {}) =>
  render(
    <FileUploader
      title="Trascina il file"
      descriptionLink="oppure selezionalo"
      uploadedFiles={[]}
      loading={false}
      theme={theme}
      isAggregatesUpload={false}
      {...options}
    />
  );

const selectFile = () =>
  fireEvent.change(document.getElementById('file-uploader') as HTMLInputElement, {
    target: { files: [file] },
  });

test('shows the drop area when no file is uploaded', () => {
  renderUploader();

  expect(screen.getByRole('button', { name: 'oppure selezionalo' })).toBeInTheDocument();
  expect(screen.queryByText('contract.pdf')).not.toBeInTheDocument();
});

test('shows the preview with the file name and a delete button when a file is uploaded', () => {
  const deleteUploadedFiles = vi.fn();
  renderUploader({ uploadedFiles: [file], deleteUploadedFiles });

  expect(screen.getByText('contract.pdf')).toBeInTheDocument();
  expect(screen.queryByText('oppure selezionalo')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancella il file caricato' }));
  expect(deleteUploadedFiles).toHaveBeenCalledTimes(1);
});

test('shows the file size only for aggregates upload', () => {
  const { unmount } = renderUploader({ uploadedFiles: [file], isAggregatesUpload: true });
  expect(screen.getByText('4 KB')).toBeInTheDocument();
  unmount();

  renderUploader({ uploadedFiles: [file], isAggregatesUpload: false });
  expect(screen.queryByText('4 KB')).not.toBeInTheDocument();
});

test('shows the loading status instead of the file while loading', () => {
  renderUploader({ uploadedFiles: [file], loading: true });

  expect(screen.getByText('Caricamento...')).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  expect(screen.queryByText('contract.pdf')).not.toBeInTheDocument();
});

test('calls onDropAccepted when a file is selected through the input', async () => {
  const onDropAccepted = vi.fn();
  renderUploader({ onDropAccepted });

  selectFile();

  await vi.waitFor(() => expect(onDropAccepted).toHaveBeenCalled());
  expect(onDropAccepted.mock.calls[0][0]).toEqual([file]);
});

test('calls onDropRejected when the file type is not accepted', async () => {
  const onDropRejected = vi.fn();
  renderUploader({ onDropRejected, accept: { 'text/csv': ['.csv'] } });

  selectFile();

  await vi.waitFor(() => expect(onDropRejected).toHaveBeenCalled());
});
