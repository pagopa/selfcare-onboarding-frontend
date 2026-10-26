import { Box, LinearProgress, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { MIButton, MIIconButton, MIPaper } from '@pagopa/mui-italia';
import { Accept, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

export type DragAndDropStatus =
  'Default' | 'DragOver' | 'Processing' | 'Failed' | 'Error' | 'Success';

export type DragAndDropDisposition = 'Horizontal' | 'Vertical';

type Props = {
  file?: File;
  accept: Accept;
  loading?: boolean;
  failed?: boolean;
  error?: boolean;
  required?: boolean;
  maxSizeLabel?: string;
  disposition?: DragAndDropDisposition;
  onFileSelected: (file: File) => void;
  onFileRemoved: () => void;
  onFileRejected: () => void;
};

const KEY = 'contractUpdate.upload.dragAndDrop';

// Keeps the selection time of each file across remounts of the parent step
const selectionDates = new WeakMap<File, Date>();

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

const getStatus = (
  file: File | undefined,
  loading: boolean,
  isDragActive: boolean,
  failed: boolean,
  error: boolean
): DragAndDropStatus => {
  if (loading) {
    return 'Processing';
  }
  if (file) {
    return 'Success';
  }
  if (isDragActive) {
    return 'DragOver';
  }
  if (failed) {
    return 'Failed';
  }
  return error ? 'Error' : 'Default';
};

function UploadedFileCard({ file, onFileRemoved }: { file: File; onFileRemoved: () => void }) {
  const { t, i18n } = useTranslation();
  const selectionDate = selectionDates.get(file) ?? new Date(file.lastModified);

  return (
    <MIPaper variant="outlined" padding={16} sx={{ width: '100%' }} data-testid="dnd-success">
      <Stack direction="row" alignItems="center" gap={2}>
        <CheckCircleIcon color="success" />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap title={file.name}>
            {file.name}
          </Typography>
          <Stack direction="row" gap={1}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {formatSize(file.size)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {selectionDate.toLocaleString(i18n.language, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center' }}>
          <MIIconButton aria-label={t(`${KEY}.remove`)} onClick={onFileRemoved}>
            <CloseIcon />
          </MIIconButton>
        </Box>
      </Stack>
    </MIPaper>
  );
}

export function ContractDragAndDrop({
  file,
  accept,
  loading = false,
  failed,
  error,
  required,
  maxSizeLabel,
  disposition,
  onFileSelected,
  onFileRemoved,
  onFileRejected,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isVertical = (disposition ?? (isMobile ? 'Vertical' : 'Horizontal')) === 'Vertical';

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled: loading,
    onDropAccepted: (files) => {
      selectionDates.set(files[0], new Date());
      onFileSelected(files[0]);
    },
    onDropRejected: onFileRejected,
  });

  const status = getStatus(file, loading, isDragActive, !!failed, !!error);
  const isError = status === 'Failed' || status === 'Error';
  const isProcessing = status === 'Processing';

  if (status === 'Success' && file) {
    return <UploadedFileCard file={file} onFileRemoved={onFileRemoved} />;
  }

  const getLabel = () => {
    if (status === 'DragOver') {
      return t(`${KEY}.dragOver`);
    }
    return status === 'Failed' ? t(`${KEY}.failed`) : t(`${KEY}.title`);
  };

  const getButtonLabel = () => {
    if (isProcessing) {
      return t(`${KEY}.cancel`);
    }
    return status === 'Failed' ? t(`${KEY}.retry`) : t(`${KEY}.upload`);
  };

  return (
    <Stack sx={{ width: '100%' }}>
      <Box {...getRootProps()} data-testid="dnd-dropzone" sx={{ width: '100%' }}>
        <MIPaper
          variant="outlined"
          padding={24}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            borderStyle: 'dashed',
            borderColor: isError ? 'error.main' : 'primary.main',
            backgroundColor:
              status === 'DragOver' ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
          }}
        >
          <input {...getInputProps()} />
          {isError ? (
            <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
          ) : (
            <CloudUploadIcon color="primary" sx={{ fontSize: 40 }} />
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: isVertical ? 'center' : 'left' }}>
            <Typography variant="body1" fontWeight={600}>
              {getLabel()}
            </Typography>
            {maxSizeLabel && (
              <Typography variant="caption" color="text.secondary">
                {maxSizeLabel} {required && '*'}
              </Typography>
            )}
          </Box>
          <MIButton
            variant="outlined"
            size="small"
            // The upload request cannot be aborted, so the cancel action is shown but disabled
            disabled={isProcessing}
            onClick={open}
            sx={{ flexShrink: 0 }}
          >
            {getButtonLabel()}
          </MIButton>
        </MIPaper>
      </Box>
      {isProcessing && <LinearProgress sx={{ width: '100%', mt: 1 }} />}
      {required && (
        <Typography
          variant="caption"
          color={status === 'Error' ? 'error' : 'text.secondary'}
          sx={{ ml: 1, mt: 1 }}
        >
          {t('contractUpdate.upload.requiredField')}
        </Typography>
      )}
    </Stack>
  );
}
