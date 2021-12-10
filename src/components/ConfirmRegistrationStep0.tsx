import { Button, Grid, Typography } from '@mui/material';
import { StepperStepComponentProps } from '../../types';

export function ConfirmRegistrationStep0({ forward }: StepperStepComponentProps) {
  const onForwardAction = () => {
    forward();
  };

  return (
    <Grid
      container
      direction="row"
      justifyContent={'flex-start'}
      alignItems={'center'}
      sx={{ minHeight: '50vh' }}
    >
      <Grid item xs={1} />
      <Grid item xs={5}>
        <Grid container columns={5}>
          <Grid item xs={5}>
            <Typography color="textPrimary" variant={'h1'} sx={{fontSize: '48px'}} align="left">
              {"Carica l'Accordo di Adesione"}
            </Typography>
          </Grid>
          <Grid item xs={4} mt={3}>
            <Typography color="textPrimary" variant={'body1'} align="left">
              {
                "Segui le istruzioni per inviare il documento firmato, servirà a completare l'inserimento del tuo Ente nel portale Self Care."
              }
            </Typography>
          </Grid>

          <Grid item xs={2} mt={8}>
            <Button fullWidth color="primary" variant="contained" onClick={onForwardAction}>
              Continua
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6} />
    </Grid>
  );
}
