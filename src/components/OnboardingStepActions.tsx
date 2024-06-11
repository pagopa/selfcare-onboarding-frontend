import { Button, Grid } from '@mui/material';

type ActionStep = {
  action?: () => void;
  label?: string;
  disabled?: boolean;
};

type ActionStepsProps = {
  forward?: ActionStep;
  back?: ActionStep;
  addUserFlow?: boolean;
};

export function OnboardingStepActions({ forward, back, addUserFlow }: ActionStepsProps) {
  return (
    <Grid container justifyContent="center" spacing={2} mt={addUserFlow ? 3 : 0}>
      {back && (
        <Grid item>
          <Button
            sx={{ width: '100%' }}
            variant="outlined"
            onClick={back.action}
            disabled={back.disabled}
          >
            {back.label}
          </Button>
        </Grid>
      )}
      {forward && (
        <Grid item>
          <Button
            sx={{ width: '100%' }}
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
