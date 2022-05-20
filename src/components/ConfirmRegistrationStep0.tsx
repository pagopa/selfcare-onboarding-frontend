import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import { IllusUploadFile } from '@pagopa/mui-italia';
import { useTranslation, Trans } from 'react-i18next';
import { StepperStepComponentProps } from '../../types';

export function ConfirmRegistrationStep0({ forward }: StepperStepComponentProps) {
  const onForwardAction = () => {
    forward();
  };
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12} pb={4}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IllusUploadFile size={60} />
        </Box>
      </Grid>
      <Grid item xs={10} p={1}>
        <Typography
          color={theme.palette.text.primary}
          display="flex"
          justifyContent="center"
          variant="h4"
        >
          {t('confirmRegistrationStep0.title')}
        </Typography>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
        <Typography color={theme.palette.text.primary} variant="body1" align={'center'}>
          <Trans i18nKey="confirmRegistrationStep0.description">
            <strong> Segui le istruzioni</strong> per inviare il documento firmato,
            <br />
            servirà a completare l&apos;adesione al prodotto scelto.
          </Trans>
        </Typography>
      </Grid>
      <Grid item>
        <Grid container>
          <Button
            fullWidth
            color="primary"
            variant="contained"
            onClick={onForwardAction}
            sx={{ width: '100%' }}
          >
            {t('confirmRegistrationStep0.confirmAction')}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
