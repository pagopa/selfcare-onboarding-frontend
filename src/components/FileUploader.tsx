import { Grid, Typography, Theme, Button } from '@mui/material';
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
  loading: boolean;
  theme: Theme;
  isAggregatesUpload: boolean;
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
  isAggregatesUpload,
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
      justifyItems="center"
      alignItems="center"
      justifyContent="center"
    >
      <input {...getInputProps()} />

      {uploadedFiles && uploadedFiles.length > 0 ? (
        <FileUploadedPreview
          theme={theme}
          loading={loading}
          files={uploadedFiles}
          deleteUploadedFiles={deleteUploadedFiles}
          isAggregatesUpload={isAggregatesUpload}
        />
      ) : (
        <Box
          className="fileDrop"
          sx={{
            boxShadow: isAggregatesUpload
              ? 'none'
              : '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
            borderRadius: '16px',
          }}
        >
          <Box
            m={1}
            sx={{
              borderRadius: '10px',
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%230073E6FF' stroke-width='2' stroke-dasharray='5.5' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e"); border-radius: 16px;`,
              width: '465px',
              backgroundColor: '#0073E612',
            }}
          >
            <Grid container xs={12} direction="column" alignItems={'center'} p={3}>
              <CloudUpload />
              <Typography
                color={theme.palette.text.primary}
                variant={'body2'}
                align="center"
                mt={1}
              >
                {title}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  marginTop: 1,
                  background: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
                onClick={(dropzoneRootProps as any).onClick}
              >
                {descriptionLink}
              </Button>
            </Grid>
          </Box>
        </Box>
      )}
    </Grid>
  );
}
