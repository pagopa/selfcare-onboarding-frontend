import { Box } from '@mui/system';
import { Grid, Tooltip, Typography, Theme } from '@mui/material';
// import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
// import { useTranslation } from 'react-i18next';

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
  // loading,
  theme,
}: FileUploadedPreviewParams): JSX.Element {
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
          <Box
            width="416px"
            height="90px"
            sx={{
              boxShadow:
                '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
              borderRadius: '16px',
            }}
          >
            <Box
              height="90px"
              m={2}
              sx={{ borderRadius: '10px', border: `3px solid ${theme.palette.primary.main}` }}
            >
              <Grid container direction={'row'} justifyItems={'center'} alignItems={'center'}>
                <Tooltip title={file.name}>
                  <Typography
                    sx={{
                      lineHeight: '37px',
                      color: 'text.primary',
                      fontStyle: 'normal',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      maxWidth: { xs: 250, md: 450, lg: 850 },
                    }}
                    variant={'body2'}
                    align="left"
                  >
                    {file.name}
                  </Typography>
                </Tooltip>
                <ClearOutlinedIcon
                  onClick={deleteUploadedFiles}
                  sx={{
                    mt: 0.5,
                    ml: 1,
                    color: 'primary.main',
                    fontSize: '24px',
                    cursor: 'pointer',
                  }}
                ></ClearOutlinedIcon>
              </Grid>

              {/* <Typography
                sx={{
                  lineHeight: '20px',
                  color: 'info.main',
                  fontStyle: loading ? 'italic' : 'normal',
                }}
                variant={'body2'}
                align="left"
              >
                {loading
                  ? t('fileUploadPreview.loadingStatus')
                  : t('fileUploadPreview.labelStatus')}
              </Typography> */}
            </Box>
          </Box>
        </Box>
      ))}
    </>
  );
}
