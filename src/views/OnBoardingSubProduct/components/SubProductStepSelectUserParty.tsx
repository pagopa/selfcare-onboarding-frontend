import { Grid, Link, Typography, useTheme, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { PartyAccountItemButton } from '@pagopa/mui-italia/dist/components/PartyAccountItemButton';
import { roleLabels } from '@pagopa/selfcare-common-frontend/utils/constants';
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

  useEffect(() => {
    if (parties.length === 1) {
      setSelected(parties[0]);
    }
  }, []);

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
        <Paper elevation={8} sx={{ borderRadius: theme.spacing(2) }}>
          <Grid pl={3} pr={3} mb={3} mt={3}>
            {parties.map((p) => (
              <Box key={p.externalId}>
                <Grid
                  aria-label={p.description}
                  sx={{
                    width: '480px',
                    fontWeight: 700,
                    fontSize: '18px',
                    height: '80px',
                    display: 'flex',
                    textAlign: 'initial',
                    pointerEvents: parties.length !== 1 ? 'auto' : 'none',
                  }}
                >
                  <PartyAccountItemButton
                    aria-label={p.description}
                    partyName={p.description}
                    partyRole={p.userRole ? t(roleLabels[p?.userRole].longLabelKey) : ''}
                    image={p.urlLogo}
                    action={() => setSelected(p)}
                    selectedItem={parties.length !== 1 ? selected?.id === p.id : false}
                    maxCharactersNumberMultiLine={20}
                  />
                </Grid>
              </Box>
            ))}
          </Grid>
        </Paper>
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
            disabled: parties.length > 1 && (selected === undefined || selected === null),
          }}
        />
      </Grid>
    </Grid>
  );
}
