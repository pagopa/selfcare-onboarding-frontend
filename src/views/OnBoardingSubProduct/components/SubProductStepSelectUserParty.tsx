import { Grid, Link, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { Party, StepperStepComponentProps } from '../../../../types';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { useHistoryState } from '../../../components/useHistoryState';

type Props = {
  parties: Array<Party>;
} & StepperStepComponentProps;

export function SubProductStepSelectUserParty({ forward, parties }: Props) {
  const institutionIdByQuery = new URLSearchParams(window.location.search).get('institutionId');
  const theme = useTheme();

  const [selected, setSelected, setSelectedHistory] = useHistoryState<Party | null>(
    'SubProductStepSelectUserParty',
    null
  );
  const onForwardAction = () => {
    setSelectedHistory(selected);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { id } = selected!;
    forward(id);
  };
  const bodyTitle = "Seleziona l'ente";

  useEffect(() => {
    if (institutionIdByQuery) {
      const selectedParty = parties.find((p) => p.id === institutionIdByQuery);
      if (selectedParty) {
        setSelected(selectedParty);
      } else {
        forward();
      }
    }
  }, []);

  // callback of previous useEffect
  useEffect(() => {
    if (institutionIdByQuery && selected) {
      onForwardAction();
    }
  }, [selected]);

  return (
    <Grid
      container
      //  mt={16}
      direction="column"
    >
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" color={theme.palette.text.primary}>
            {bodyTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={2}>
        <Grid item xs={12}>
          <Typography
            variant="subtitle2"
            component="h2"
            align="center"
            color={theme.palette.text.primary}
          >
            Seleziona l&apos;ente per il quale stai richiedendo la sottoscrizione all&apos;offerta
            Premium
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={7} mb={4}>
        <Grid item xs={5}>
          {/* Todo */}
        </Grid>
      </Grid>

      <Grid container item justifyContent="center">
        <Grid item xs={6}>
          <Box
            sx={{
              fontSize: '14px',
              lineHeight: '24px',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                textAlign: 'center',
              }}
              variant="caption"
              color={theme.palette.text.primary}
            >
              Non lo trovi? <Link href="TODO redirect to onBoarding1">Registra un nuovo ente</Link>
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid item mt={4}>
        <OnboardingStepActions
          forward={{
            action: onForwardAction,
            label: 'Conferma',
            disabled: selected === undefined || selected === null,
          }}
        />
      </Grid>
    </Grid>
  );
}
