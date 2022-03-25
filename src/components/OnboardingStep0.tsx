import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stack, Switch } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { StepperStepComponentProps } from '../../types';
import { OnboardingStepActions } from './OnboardingStepActions';
import { StyledIntro } from './StyledIntro';

export function OnboardingStep0({ forward }: StepperStepComponentProps) {
  const [checked, setChecked] = useState<boolean>(false);

  const onForwardAction = () => {
    forward();
  };
  const { t } = useTranslation();
  return (
    <Stack spacing={10}>
      <StyledIntro>
        {{
          title: t('onboardingStep0.title'),
          description: <>{t('onboardingStep0.description')} test</>,
        }}
      </StyledIntro>
      <Box sx={{ textAlign: 'center' }}>
        <Switch checked={checked} onChange={(_, value) => setChecked(value)} />
        {t('onboardingStep0.privacyPolicyDescription')}
        <Link to="#">{t('onboardingStep0.privacyPolicyLink')}</Link>
      </Box>

      <OnboardingStepActions
        forward={{
          action: onForwardAction,
          label: t('onboardingStep0.actionLabel'),
          disabled: !checked,
        }}
      />
    </Stack>
  );
}
