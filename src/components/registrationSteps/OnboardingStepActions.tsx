import { Button, Grid, useTheme } from '@mui/material';

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
  const theme = useTheme();
  return (
    <Grid container justifyContent="center" spacing={2} mt={addUserFlow ? 2 : 0}>
      {back && (
        <Grid item>
          <Button
            sx={{
              width: '100%',
              color: theme.palette.primary.dark,
              borderColor: theme.palette.primary.dark,
              '&:hover': { borderColor: theme.palette.primary.dark },
            }}
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
            aria-label={forward.label}
          >
            {forward.label}
          </Button>
        </Grid>
      )}
    </Grid>
  );
}
