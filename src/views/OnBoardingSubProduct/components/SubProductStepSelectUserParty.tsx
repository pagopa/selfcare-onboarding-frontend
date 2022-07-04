import { Grid, Link, Typography, useTheme, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { PartyAccountItem } from '@pagopa/mui-italia/dist/components/PartyAccountItem';
import { Party, SelfcareParty, StepperStepComponentProps } from '../../../../types';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { useHistoryState } from '../../../components/useHistoryState';

type Props = {
  parties: Array<SelfcareParty>;
} & StepperStepComponentProps;

export function SubProductStepSelectUserParty({ forward, parties }: Props) {
  const partyExternalIdByQuery = new URLSearchParams(window.location.search).get('partyExternalId');

  const { t } = useTranslation();

  const theme = useTheme();

  const [selected, setSelected, setSelectedHistory] = useHistoryState<SelfcareParty | null>(
    'SubProductStepSelectUserParty',
    null
  );
  const onForwardAction = () => {
    setSelectedHistory(selected);
    forward(selected as Party);
  };
  const bodyTitle = t('onBoardingSubProduct.selectUserPartyStep.title');

  useEffect(() => {
    if (partyExternalIdByQuery) {
      const selectedParty = parties.find((p) => p.externalId === partyExternalIdByQuery);
      if (selectedParty) {
        setSelected(selectedParty);
      } else {
        forward();
      }
    }
  }, []);

  // callback of previous useEffect
  useEffect(() => {
    if (partyExternalIdByQuery && selected) {
      onForwardAction();
    }
  }, [selected]);

  return (
    <Grid container direction="column">
      <Grid container item justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" color={theme.palette.text.primary}>
            {bodyTitle}
          </Typography>
        </Grid>
      </Grid>

      <Grid container item justifyContent="center" mt={1}>
        <Grid item xs={12}>
          <Typography variant="body1" align="center" color={theme.palette.text.primary}>
            <Trans i18nKey="onBoardingSubProduct.selectUserPartyStep.subTitle">
              Seleziona l&apos;ente per il quale stai richiedendo la sottoscrizione <br />
              all&apos;offerta Premium
            </Trans>
          </Typography>
        </Grid>
      </Grid>

      <Grid container item textAlign="center" justifyContent="center" mt={4} mb={3}>
        <Grid item>
          {parties.map((p, index) => (
            <Box key={p.externalId}>
              <Paper
                elevation={8}
                aria-label={selected ? p.description : undefined}
                onClick={() => setSelected(p)}
                sx={{
                  cursor: 'pointer',
                  border: selected === p ? '2px solid #0073E6' : undefined,
                  width: '480px',
                  fontWeight: 700,
                  fontSize: '18px',
                  height: '113px',
                  borderRadius: theme.spacing(2),
                  display: 'flex',
                }}
              >
                <Grid mb={3} mt={4} px={4} aria-label={p.description}>
                  <PartyAccountItem
                    partyName={p.description}
                    partyRole=""
                    image={p.urlLogo}
                    noWrap={false}
                  />
                </Grid>
              </Paper>
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
              aria-label="Non lo trovi? Registra un nuovo ente"
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

      <Grid item mt={3}>
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
