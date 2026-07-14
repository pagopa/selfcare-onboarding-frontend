import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Box,
  Button,
  Grid,
  LinearProgress,
  Typography,
  useTheme
} from '@mui/material';
import { Accept, useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import UploadedDocument from './UploadedDocument';

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
    return loading ? (
      <Box
        sx={{
          boxShadow:
            '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
          borderRadius: '16px',
          p: 1,
        }}
      >
        <Box sx={{ borderRadius: '10px', border: `1px solid ${theme.palette.primary.main}` }}>
          <Grid
            container
            justifyContent="space-evenly"
            alignItems="center"
            width="390px"
            height="90px"
          >
            <Grid item xs={6}>
              <Typography align="center" variant="body1">
                {t('fileUploadPreview.loadingStatus')}
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Box sx={{ width: '100%' }}>
                <LinearProgress />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    ) : (
      <UploadedDocument file={file} onDelete={onDelete} />
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
