import { Grid, Typography, Link, Theme } from '@mui/material';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import { Box } from '@mui/system';
import { ReactComponent as CloudUpload } from '../assets/cloud-upload.svg';
import { FileUploadedPreview } from './FileUploadedPreview';

type FileUploaderOption = {
  title: string;
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
            sx={{
              borderRadius: '10px',
              border: `2px dashed ${theme.palette.primary.main}`,
            }}
          >
            <Grid container direction="column" alignItems={'center'} py={3} px={6}>
              <CloudUpload />
              <Typography
                color={theme.palette.text.primary}
                variant={'body2'}
                align="center"
                mt={1}
              >
                {title}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 'normal',
                  color: theme.palette.text.primary,
                }}
                variant={'body2'}
                align="center"
              >
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
