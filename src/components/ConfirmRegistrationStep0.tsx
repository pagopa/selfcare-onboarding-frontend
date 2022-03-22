import { Button, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StepperStepComponentProps } from '../../types';

export function ConfirmRegistrationStep0({ forward }: StepperStepComponentProps) {
  const onForwardAction = () => {
    forward();
  };
  const { t } = useTranslation();
  return (
    <Grid container direction="row" justifyContent={'flex-start'} alignItems={'center'}>
      <Grid item xs={1} />
      <Grid item xs={5}>
        <Grid container columns={5}>
          <Grid item xs={5}>
            <Typography color="textPrimary" variant={'h1'} sx={{ fontSize: '48px' }} align="left">
              {t('confirmRegistrationStep0.title')}
            </Typography>
          </Grid>
          <Grid item xs={4} mt={3}>
            <Typography color="textPrimary" variant={'body1'} align="left">
              {t('confirmRegistrationStep0.description')}
            </Typography>
          </Grid>

          <Grid item xs={2} mt={8}>
            <Button fullWidth color="primary" variant="contained" onClick={onForwardAction}>
              {t('confirmRegistrationStep0.confirmAction')}
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6} />
    </Grid>
  );
}
