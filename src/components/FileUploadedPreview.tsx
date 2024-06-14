import { Box } from '@mui/system';
import { Grid, LinearProgress, Theme, Tooltip, Typography } from '@mui/material';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { useTranslation } from 'react-i18next';
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
  loading,
}: FileUploadedPreviewParams): JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      {files.map((file: File) =>
        loading ? (
          <>
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
          </>
        ) : (
          <Box key={file.name} sx={{ maxWidth: { xs: 300, md: 500, lg: 900 }, ...sx }}>
            <Box
              sx={{
                boxShadow:
                  '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
                borderRadius: '16px',
                p: 1,
              }}
            >
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '10px',
                  border: `1px solid ${theme.palette.primary.main}`,
                  width: '400px',
                  height: '66px',
                }}
              >
                <Grid item xs={1} pr={1}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      color: theme.palette.primary.main,
                    }}
                  >
                    <ClipFileUploaded height={24} />
                  </Box>
                </Grid>
                <Grid item xs={8}>
                  <Box display="flex" flexDirection="column">
                    <Tooltip title={file.name} placement="top" arrow={true}>
                      <Typography
                        sx={{
                          color: theme.palette.primary.main,
                          fontStyle: 'normal',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          fontSize: '14px',
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Grid>
                <Grid item xs={1} display="flex" justifyContent="flex-end">
                  <ClearOutlinedIcon
                    onClick={deleteUploadedFiles}
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: '24px',
                      cursor: 'pointer',
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )
      )}
    </>
  );
}
