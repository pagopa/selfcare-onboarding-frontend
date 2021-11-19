import { CircularProgress, Grid, Typography } from '@mui/material';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import { Box } from '@mui/system';
import uploadedImage from '../assets/uploaded_doc.png';
import uploadImage from '../assets/upload_doc.png';
import { FileUploadedPreview } from './FileUploadedPreview';

type FileUploaderOption = {
  title: string;
  description: string;
  uploadedFiles: Array<File>;
  deleteUploadedFiles?: (event: any | undefined) => void;
  onDropAccepted?: (t: Array<File>) => void;
  onDropRejected?: (fileRejections: Array<FileRejection>, event?: DropEvent) => void;
  maxFiles?: number;
  accept?: Array<string> | undefined;
  uploaderImageWidth?: number;
  loading: boolean;
};

export function FileUploader({
  title,
  description,
  uploadedFiles,
  deleteUploadedFiles,
  onDropAccepted,
  onDropRejected,
  maxFiles,
  accept,
  uploaderImageWidth,
  loading,
}: FileUploaderOption) {
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted,
    onDropRejected,
    maxFiles: maxFiles ? maxFiles : 1,
    accept: accept ? accept : undefined,
  });

  return (
    <Grid
      {...getRootProps({ className: 'dropzone' })}
      container
      direction="row"
      justifyItems={'center'}
      alignItems={'center'}
      sx={{ mt: '56px' }}
    >
      <input {...getInputProps()} />
      <Box sx={{ display: !loading ? undefined : 'none' }}>
        <img
          width={uploaderImageWidth ? uploaderImageWidth : 180}
          src={uploadedFiles && uploadedFiles.length > 0 ? uploadedImage : uploadImage}
        />
      </Box>
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
          loading={loading}
          files={uploadedFiles}
          deleteUploadedFiles={deleteUploadedFiles}
          sx={{ ml: '27px' }}
        ></FileUploadedPreview>
      ) : (
        <Grid container direction="column" alignItems={'center'} sx={{ width: 'auto', ml: '27px' }}>
          <Typography
            sx={{
              color: 'text.primary',
              lineHeight: '36,5px',
            }}
            variant={'h4'}
            align="left"
          >
            {title}
          </Typography>
          <Typography
            sx={{
              lineHeight: '20px',
              fontWeight: 'normal',
              color: 'secondary.main',
            }}
            variant={'body2'}
            align="left"
          >
            {description}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
