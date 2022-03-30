import { Box } from '@mui/system';
import { Grid, Theme, Tooltip, Typography } from '@mui/material';
// import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
// import { useTranslation } from 'react-i18next';
import { ReactComponent as ClipFileUploaded } from '../assets/clip_file_uploaded.svg';

type FileUploadedPreviewParams = {
  files: Array<File>;
  sx?: any;
  deleteUploadedFiles: ((event: any) => void) | undefined;
  loading: boolean;
  theme: Theme;
};

export function FileUploadedPreview({
  files,
  sx,
  deleteUploadedFiles,
  theme,
}: // loading,
FileUploadedPreviewParams): JSX.Element {
  // const cleanFileType = (fileType: string): string => {
  //   // eslint-disable-next-line functional/no-let
  //   let type = fileType;
  //   if (fileType.includes('application/')) {
  //     type = type.replace('application/', '');
  //   }
  //   return type;
  // };
  // const { t } = useTranslation();

  return (
    <>
      {files.map((file: File) => (
        <Box key={file.name} sx={{ maxWidth: { xs: 300, md: 500, lg: 900 }, ...sx }}>
          {/* <DescriptionOutlinedIcon
              sx={{ color: '#ADB7C0', width: 'auto', height: '24px', marginRight: 0.5 }}
            /> */}
          <Box
            sx={{
              boxShadow:
                '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
              borderRadius: '16px',
              p: 1,
            }}
          >
            <Box sx={{ borderRadius: '10px', border: `3px solid ${theme.palette.primary.main}` }}>
              <Grid
                container
                justifyContent="space-evenly"
                alignItems="center"
                width="390px"
                height="90px"
              >
                <Grid item xs={1}>
                  <Box px={2} sx={{ color: theme.palette.primary.main }}>
                    <ClipFileUploaded />
                  </Box>
                </Grid>
                <Grid item xs={8}>
                  <Box display="flex" flexDirection="column">
                    <Box>
                      <Tooltip title={file.name}>
                        <Typography
                          sx={{
                            color: theme.palette.primary.main,
                            fontStyle: 'normal',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            width: '100%',
                            fontSize: '14px',
                            fontWeight: 700,
                          }}
                        >
                          {file.name}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontStyle: 'normal',
                          fontWeight: 600,
                          fontSize: '14px',
                          lineHeight: '24px',
                          textTransform: 'uppercase',
                          color: theme.palette.text.primary,
                        }}
                        variant={'body1'}
                        align="left"
                      >
                        {`${(file.size / 1024).toFixed(0)} KB`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={1}>
                  <ClearOutlinedIcon
                    onClick={deleteUploadedFiles}
                    sx={{
                      mt: 0.5,
                      ml: 1,
                      color: theme.palette.text.primary,
                      fontSize: '24px',
                      cursor: 'pointer',
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
          {/* <Typography
            sx={{
              lineHeight: '20px',
              color: 'info.main',
              fontStyle: loading ? 'italic' : 'normal',
            }}
            variant={'body2'}
            align="left"
          >
            {loading ? t('fileUploadPreview.loadingStatus') : t('fileUploadPreview.labelStatus')}
          </Typography> */}
        </Box>
      ))}
    </>
  );
}
