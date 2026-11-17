import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { OnboardingStepActions } from '../registrationSteps/OnboardingStepActions';

export type ServicesChoice = {
  rtp: boolean;
  repository: boolean;
};

type Props = {
  forward: (services: ServicesChoice) => void;
  back: () => void;
  initialServices?: ServicesChoice;
};

const SERVICES: Array<keyof ServicesChoice> = ['rtp', 'repository'];

export default function StepServicesChoice({
  forward,
  back,
  initialServices = { rtp: false, repository: false },
}: Props) {
  const [services, setServices] = useState<ServicesChoice>(initialServices);
  const { t } = useTranslation();
  const theme = useTheme();

  const handleChange = (service: keyof ServicesChoice, checked: boolean) =>
    setServices((prev) => ({ ...prev, [service]: checked }));

  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12} display="flex" justifyContent="center">
        <Typography variant="h3" align="center" pb={1}>
          {t('stepServicesChoice.title')}
        </Typography>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center">
        <Typography variant="body1" align="center" pb={4} sx={{ maxWidth: '580px' }}>
          <Trans i18nKey="stepServicesChoice.subtitle" components={{ 1: <strong /> }}>
            {
              'Scegli il servizio a cui vuoi aderire come <1>Service Provider del Debitore</1>. Se desideri aderire anche con la funzione Technical Solution Provider devi mandare una PEC per fare richiesta.'
            }
          </Trans>
        </Typography>
      </Grid>
      <Paper
        elevation={8}
        sx={{ borderRadius: theme.spacing(2), p: 1, width: '580px', height: '100%' }}
      >
        <Grid item xs={12} p={3}>
          <FormControl component="fieldset">
            <FormGroup>
              {SERVICES.map((service) => (
                <FormControlLabel
                  key={service}
                  sx={{ p: '8px' }}
                  control={
                    <Checkbox
                      id={`service-${service}`}
                      checked={services[service]}
                      onChange={(_, checked) => handleChange(service, checked)}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#17324D' }}>
                      {t(`stepServicesChoice.services.${service}`)}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>
      </Paper>
      <Grid item xs={12} mt={2}>
        <OnboardingStepActions
          back={{
            action: back,
            label: t('stepServicesChoice.backLabel'),
            disabled: false,
          }}
          forward={{
            action: () => forward(services),
            label: t('stepServicesChoice.confirmLabel'),
            disabled: !services.rtp && !services.repository,
          }}
        />
      </Grid>
    </Grid>
  );
}
