import { Button, Grid } from '@mui/material';

type ActionStep = {
  action?: () => void;
  label?: string;
  disabled?: boolean;
};

type ActionStepsProps = {
  forward?: ActionStep;
  back?: ActionStep;
};

export function OnboardingStepActions({ forward, back }: ActionStepsProps) {
  return (
    <Grid container spacing={2} justifyContent="center">
      {back && (
        <Grid item xs={2} >
          <Button sx={{width:'100%'}} color="primary" variant="outlined" onClick={back.action} disabled={back.disabled}>
            {back.label}
          </Button>
        </Grid>
      )}
      {forward && (
        <Grid item xs={2} >
          <Button
            sx={{width:'100%'}}
            color="primary"
            variant="contained"
            onClick={forward.action}
            disabled={forward.disabled}
          >
            {forward.label}
          </Button>
        </Grid>
      )}
    </Grid>
  );
}
