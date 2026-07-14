import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { Box, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import ClipFileUploaded from '../../../../assets/clip_file_uploaded.svg?react';

type Props = {
  file: File | undefined;
  onDelete?: () => void;
};

const UploadedDocumentComponent = ({ file, onDelete }: Props) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        maxWidth: { xs: 280, sm: 325, md: 600, lg: 900 },
        borderRadius: '16px',
        p: 1,
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
          border: `1px solid ${theme.palette.primary.main}`,
          width: '100%',
          height: '66px',
          paddingRight: '20px',
          paddingLeft: '10px',
        }}
      >
        <Grid item xs={1} pr={1}>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', color: theme.palette.primary.main }}
          >
            <ClipFileUploaded height={24} />
          </Box>
        </Grid>
        <Grid
          item
          xs={onDelete ? 10 : 11}
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="start"
          gap={1}
          aria-label={file?.name}
        >
          <Tooltip title={file?.name} placement="top" arrow>
            <Typography
              aria-hidden="true"
              sx={{
                color: theme.palette.primary.main,
                fontStyle: 'normal',
                fontWeight: 'fontWeightRegular',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: '14px',
              }}
            >
              {file?.name && file.name.length > 30 ? `${file.name.slice(0, 30)}...` : file?.name}
            </Typography>
          </Tooltip>
          <Typography
            variant="body1"
            fontWeight="fontWeightBold"
            color={theme.palette.text.primary}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {file?.size && Math.round(file?.size / 1024)} KB
          </Typography>
        </Grid>
        {onDelete && (
          <Grid item xs={1} display="flex" justifyContent="flex-end">
            <IconButton
              onClick={onDelete}
              sx={{ color: theme.palette.text.primary, fontSize: '24px', cursor: 'pointer' }}
              aria-label={t('upladDocuments.uploader.delete')}
            >
              <ClearOutlinedIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UploadedDocumentComponent;
