import { CircularProgress, Grid, Typography, Link, Theme } from '@mui/material';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import { Box } from '@mui/system';
import { FileUploadedPreview } from './FileUploadedPreview';

type FileUploaderOption = {
  title: string;
  description: string;
  descriptionLink?: string;
  uploadedFiles: Array<File>;
  deleteUploadedFiles?: (event: any | undefined) => void;
  onDropAccepted?: (t: Array<File>) => void;
  onDropRejected?: (fileRejections: Array<FileRejection>, event?: DropEvent) => void;
  maxFiles?: number;
  accept?: Array<string> | undefined;
  uploaderImageWidth?: number;
  loading: boolean;
  theme: Theme;
};

export function FileUploader({
  title,
  description,
  descriptionLink,
  uploadedFiles,
  deleteUploadedFiles,
  onDropAccepted,
  onDropRejected,
  maxFiles,
  accept,
  loading,
  theme,
}: FileUploaderOption) {
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted,
    onDropRejected,
    maxFiles: maxFiles ? maxFiles : 1,
    accept: accept ? accept : undefined,
  });

  const dropzoneRootProps = getRootProps({ className: 'dropzone' });
  return (
    <Grid
      {...dropzoneRootProps}
      onClick={() => {}}
      container
      direction="row"
      justifyItems={'center'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <input {...getInputProps()} />
      <Box sx={{ position: 'relative', display: loading ? undefined : 'none' }}>
        <CircularProgress
          variant="determinate"
          sx={{
            color: '#D1E7FF',
          }}
          size={180}
          thickness={5}
          value={100}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          sx={{
            color: 'primary.main',
            animationDuration: '1.5s',
            position: 'absolute',
            left: 0,
          }}
          size={180}
          thickness={7}
        />
      </Box>

      {uploadedFiles && uploadedFiles.length > 0 ? (
        <FileUploadedPreview
          theme={theme}
          loading={loading}
          files={uploadedFiles}
          deleteUploadedFiles={deleteUploadedFiles}
        />
      ) : (
        <Box
          sx={{
            boxShadow:
              '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
            borderRadius: '16px',
          }}
        >
          <Box
            m={1}
            sx={{ borderRadius: '10px', border: `3px dashed ${theme.palette.primary.main}` }}
          >
            <Grid container direction="column" alignItems={'center'} py={3} px={6}>
              <Typography color={theme.palette.text.primary} variant={'body2'} align="center">
                {title}
              </Typography>
              <Typography
                sx={{
                  lineHeight: '20px',
                  fontWeight: 'normal',
                  color: theme.palette.text.primary,
                }}
                variant={'body2'}
                align="center"
              >
                {description}
                <Link
                  sx={{ cursor: 'pointer', textDecoration: 'none' }}
                  onClick={(dropzoneRootProps as any).onClick}
                >
                  {descriptionLink}
                </Link>
              </Typography>
            </Grid>
          </Box>
        </Box>
      )}
    </Grid>
  );
}
