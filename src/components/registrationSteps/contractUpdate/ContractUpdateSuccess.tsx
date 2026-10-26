import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import { MIButton } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../../utils/env';
import { ContractUpdateLayout } from './ContractUpdateLayout';

export function ContractUpdateSuccess() {
  const { t } = useTranslation();

  return (
    <ContractUpdateLayout>
      <Stack alignItems="center" justifyContent="center" spacing={2} minHeight="52vh">
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon color="primary" fontSize="small" />
        </Box>
        <Typography variant="h4" component="h1" align="center" sx={{ maxWidth: 300 }}>
          {t('contractUpdate.success.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 360 }}>
          {t('contractUpdate.success.description')}
        </Typography>
        <MIButton
          variant="contained"
          size="small"
          onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
        >
          {t('contractUpdate.success.backHome')}
        </MIButton>
      </Stack>
    </ContractUpdateLayout>
  );
}
