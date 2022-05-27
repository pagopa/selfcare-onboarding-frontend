import { Box } from '@mui/system';
import { Grid, LinearProgress, Theme, Tooltip, Typography } from '@mui/material';
// import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ClipFileUploaded } from '../assets/clip_file_uploaded.svg';

type FileUploadedPreviewParams = {
  file: File;
  sx?: any;
  deleteUploadedFile: ((event: any) => void) | undefined;
  loading: boolean;
  theme: Theme;
};

export function FileUploadedPreview({
  file,
  sx,
  deleteUploadedFile,
  theme,
  loading,
}: FileUploadedPreviewParams): JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      {loading ? (
        <>
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
            <Box sx={{ borderRadius: '10px', border: `3px solid ${theme.palette.primary.main}` }}>
              <Grid
                container
                justifyContent="space-evenly"
                alignItems="center"
                width="400px"
                height="66px"
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
                            fontWeight: 700, // if is inserted the variant, the ellipsis doesn't work'
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
                    onClick={deleteUploadedFile}
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
        </Box>
      )}
    </>
  );
}
