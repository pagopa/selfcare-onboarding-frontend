import { Card, Grid, Link, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Party, StepperStepComponentProps } from '../../../../types';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { useHistoryState } from '../../../components/useHistoryState';

type Props = {
  parties: Array<Party>;
} & StepperStepComponentProps;

export function SubProductStepSelectUserParty({ forward, parties }: Props) {
  const institutionIdByQuery = new URLSearchParams(window.location.search).get('institutionId');

  const { t } = useTranslation();

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
  const bodyTitle = t('onBoardingSubProduct.selectUserPartyStep.title');

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
            {t('onBoardingSubProduct.selectUserPartyStep.subTitle')}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item display="flex" textAlign="center" justifyContent="center" mt={7} mb={4}>
        <Grid item xs={5}>
          {parties.map((p, index) => (
            <Box key={p.id}>
              <Card
                key={p.id}
                onClick={() => setSelected(p)}
                sx={{
                  cursor: 'pointer',
                  border: selected === p ? '2px solid #0073E6' : undefined,
                  width: '480px',
                  fontWeight: 700,
                  fontSize: '18px',
                  height: '113px',
                  top: '144px',
                  left: '480px',
                }}
              >
                {p.name}
              </Card>
              {index !== parties.length - 1 && <br />}
            </Box>
          ))}
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
              <Trans i18nKey="onBoardingSubProduct.selectUserPartyStep.helperLink">
                Non lo trovi?
                <Link sx={{ cursor: 'pointer' }} onClick={() => forward()}>
                  Registra un nuovo ente
                </Link>
              </Trans>
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid item mt={4}>
        <OnboardingStepActions
          forward={{
            action: onForwardAction,
            label: t('onBoardingSubProduct.selectUserPartyStep.confirmButton'),
            disabled: selected === undefined || selected === null,
          }}
        />
      </Grid>
    </Grid>
  );
}
