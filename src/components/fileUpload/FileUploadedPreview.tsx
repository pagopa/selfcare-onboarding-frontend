/* eslint-disable sonarjs/cognitive-complexity */
import { Box } from '@mui/system';
import { Grid, LinearProgress, Theme, Tooltip, Typography } from '@mui/material';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ClipFileUploaded } from '../../assets/clip_file_uploaded.svg';

type FileUploadedPreviewParams = {
  files: Array<File>;
  deleteUploadedFiles: ((event: any) => void) | undefined;
  loading: boolean;
  theme: Theme;
  isAggregatesUpload: boolean;
};

export function FileUploadedPreview({
  files,
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
                  width={isAggregatesUpload ? '664px' : '390px'}
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
          <Box
            key={file.name}
            sx={{
              maxWidth: { xs: 280, sm: 325, md: 600, lg: 900 },
              marginTop: isAggregatesUpload ? 2 : 0,
              boxShadow: isAggregatesUpload
                ? 'none'
                : '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
              borderRadius: '16px',
              p: 1,
              border: isAggregatesUpload ? `1px solid ${theme.palette.primary.main}` : 'none',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Grid
              container
              sx={{
                maxWidth: { xs: 280, sm: 325, md: 600, lg: 900 },
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '10px',
                border: isAggregatesUpload ? 'none' : `1px solid ${theme.palette.primary.main}`,
                width: isAggregatesUpload ? '664px' : '440px',
                height: isAggregatesUpload ? '46px' : '66px',
                paddingRight: '20px',
                paddingLeft: '10px',
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
              <Grid
                item
                xs={isAggregatesUpload ? 10 : 8}
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="start"
              >
                <Box display="flex" flexDirection="row">
                  <Tooltip title={file.name} placement="top" arrow={true}>
                    <Typography
                      sx={{
                        color: theme.palette.primary.main,
                        fontStyle: 'normal',
                        fontWeight: 'fontWeightRegular',
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
                        color: theme.palette.text.primary,
                        fontSize: '14px',
                        fontWeight: 'fontWeightBold',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        width: '100%',
                        pl: 4,
                      }}
                    >
                      {file.size.toString().concat(' KB')}
                    </Typography>
                  )}
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
        )
      )}
    </>
  );
}
