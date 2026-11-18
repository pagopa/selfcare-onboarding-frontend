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
import { OnboardingProductDto } from '../../api/generated/onboarding/OnboardingProductDto';
import { RtpServiceTypeEnum } from '../../api/generated/onboarding/RtpServiceType';
import { OnboardingStepActions } from '../registrationSteps/OnboardingStepActions';

export type RtpServiceTypes = NonNullable<OnboardingProductDto['rtpServiceTypes']>;

type Props = {
  forward: (rtpServiceTypes: RtpServiceTypes) => void;
  back: () => void;
  initialServiceTypes?: RtpServiceTypes;
};

const SERVICE_LABEL_KEYS: Record<RtpServiceTypeEnum, string> = {
  [RtpServiceTypeEnum.RTP]: 'stepServicesChoice.services.rtp',
  [RtpServiceTypeEnum.REPOSITORY_CONSULTATION]: 'stepServicesChoice.services.repository',
};

const SERVICES: ReadonlyArray<RtpServiceTypeEnum> = [
  RtpServiceTypeEnum.RTP,
  RtpServiceTypeEnum.REPOSITORY_CONSULTATION,
];

export default function StepServicesChoice({ forward, back, initialServiceTypes = [] }: Props) {
  const [serviceTypes, setServiceTypes] = useState<RtpServiceTypes>(initialServiceTypes);
  const { t } = useTranslation();
  const theme = useTheme();

  const handleChange = (service: RtpServiceTypeEnum, checked: boolean) =>
    setServiceTypes((prev) => SERVICES.filter((s) => (s === service ? checked : prev.includes(s))));

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
                      checked={serviceTypes.includes(service)}
                      onChange={(_, checked) => handleChange(service, checked)}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#17324D' }}>
                      {t(SERVICE_LABEL_KEYS[service])}
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
            action: () => forward(serviceTypes),
            label: t('stepServicesChoice.confirmLabel'),
            disabled: serviceTypes.length === 0,
          }}
        />
      </Grid>
    </Grid>
  );
}
