import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { Accept, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

type DocumentUploaderProps = {
  file?: File;
  onDropAccepted: (file: File) => void;
  onDropRejected: () => void;
  onDelete: () => void;
  dragLabel: string;
  uploadLabel: string;
  loading?: boolean;
  accept?: Accept;
};

export const DocumentUploader = ({
  file,
  onDropAccepted,
  onDropRejected,
  onDelete,
  dragLabel,
  uploadLabel,
  loading,
  accept,
}: DocumentUploaderProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { getRootProps, getInputProps, open } = useDropzone({
    onDropAccepted: (files) => onDropAccepted(files[0]),
    onDropRejected,
    multiple: false,
    maxFiles: 1,
    accept,
    noClick: true,
    noKeyboard: true,
  });

  if (file) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderRadius: theme.spacing(1),
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <InsertDriveFileOutlinedIcon color="primary" />
        <Box flex={1} minWidth={0}>
          <Tooltip title={file.name} placement="top" arrow>
            <Typography
              variant="body2"
              sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {file.name}
            </Typography>
          </Tooltip>
          {loading && <LinearProgress sx={{ mt: 0.5 }} />}
        </Box>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <IconButton
            size="small"
            onClick={onDelete}
            aria-label={t('upladDocuments.uploader.delete')}
          >
            <ClearOutlinedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Box
      {...getRootProps()}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
        py: 3,
        borderRadius: theme.spacing(1),
        border: `2px dashed ${theme.palette.primary.main}`,
        backgroundColor: `${theme.palette.primary.main}0A`,
        cursor: 'pointer',
      }}
      onClick={open}
    >
      <input {...getInputProps()} />

      <Grid container direction="column" display="flex" alignItems="center" gap={1}>
        <Grid item xs={12} textAlign="center">
          <CloudUploadIcon color="primary" />
        </Grid>
        <Grid item xs={12} textAlign="center">
          <Typography variant="body2" color={theme.palette.text.primary} align="center">
            {dragLabel}
          </Typography>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
          >
            {uploadLabel}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
