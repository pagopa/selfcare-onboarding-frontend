/* eslint-disable sonarjs/cognitive-complexity */
import { Box } from '@mui/system';
import { Chip, Grid, LinearProgress, Theme, Tooltip, Typography } from '@mui/material';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ReactComponent as ClipFileUploaded } from '../assets/clip_file_uploaded.svg';

type FileUploadedPreviewParams = {
  files: Array<File>;
  sx?: any;
  deleteUploadedFiles: ((event: any) => void) | undefined;
  loading: boolean;
  theme: Theme;
  isAggregatesUpload: boolean;
};

export function FileUploadedPreview({
  files,
  sx,
  deleteUploadedFiles,
  theme,
  loading,
  isAggregatesUpload,
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
                  width={isAggregatesUpload ? '480px' : '390px'}
                  height={isAggregatesUpload ? '62px' : '90px'}
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
                boxShadow: isAggregatesUpload
                  ? 'none'
                  : '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
                borderRadius: '16px',
                p: 1,
                border: isAggregatesUpload ? `1px solid ${theme.palette.divider}` : 'none',
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '10px',
                  border: isAggregatesUpload ? 'none' : `1px solid ${theme.palette.primary.main}`,
                  width: '440px',
                  height: isAggregatesUpload ? '46px' : '66px',
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
                    {isAggregatesUpload ? (
                      <CheckCircleIcon style={{ color: theme.palette.success.light }} height={20} />
                    ) : (
                      <ClipFileUploaded height={24} />
                    )}
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={isAggregatesUpload ? 9 : 8}
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" flexDirection="row">
                    <Tooltip title={file.name} placement="top" arrow={true}>
                      <Typography
                        sx={{
                          color: isAggregatesUpload
                            ? theme.palette.text.primary
                            : theme.palette.primary.main,
                          fontStyle: 'normal',
                          fontWeight: isAggregatesUpload ? 'fontWeightMedium' : 'fontWeightRegular',
                          overflow: isAggregatesUpload ? 'visible' : 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: isAggregatesUpload ? '-moz-initial' : 'ellipsis',
                          width: '100%',
                          fontSize: '14px',
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Tooltip>
                    {isAggregatesUpload && (
                      <Typography
                        sx={{
                          color: isAggregatesUpload
                            ? theme.palette.text.primary
                            : theme.palette.primary.main,
                          fontStyle: 'normal',
                          fontWeight: isAggregatesUpload ? 'fontWeightMedium' : 'fontWeightRegular',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          fontSize: '14px',
                          pl: 4,
                        }}
                      >
                        {file.size.toString().concat(' KB')}
                      </Typography>
                    )}
                  </Box>
                  {isAggregatesUpload && (
                    <Chip
                      style={{ backgroundColor: theme.palette.success.light }}
                      label={t('stepUploadAggregates.dropArea.valid')}
                    />
                  )}
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
