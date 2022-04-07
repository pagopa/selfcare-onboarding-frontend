import { Button, Grid } from '@mui/material';
import { Party } from '../../types';

type ActionStep = {
  action?: () => void;
  label?: string;
  disabled?: boolean;
};

type ActionStepsProps = {
  forward?: ActionStep;
  back?: ActionStep;
  parties?: Array<Party>;
};

export function OnboardingStepActions({ forward, back, parties }: ActionStepsProps) {
  return (
    <Grid container justifyContent="center" spacing={2}>
      {back && parties && parties.length > 0 && (
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
