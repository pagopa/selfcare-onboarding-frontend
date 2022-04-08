import { FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { OrganizationType, StepperStepComponentProps } from '../../../types';
import { OnboardingStepActions } from '../OnboardingStepActions';

type Props = StepperStepComponentProps & {
  organizationType: OrganizationType;
};

const organizationTypeValues = [
  { labelKey: 'pa', value: 'PA', label: 'Pubblica Amministrazione' },
  { labelKey: 'gsp', value: 'GSP', label: 'Gestore di servizi pubblici' },
  { labelKey: 'scp', value: 'SCP', label: 'Società a controllo pubblico' },
  { labelKey: 'pt', value: 'PT', label: 'Partner tecnologico' },
];

export default function StepInstitutionType({ back, forward, organizationType }: Props) {
  const [selectedValue, setSelectedValue] = React.useState<OrganizationType>(organizationType);

  const { t } = useTranslation();

  const handleChange = (value: string) => {
    console.log('value', value);
    return setSelectedValue(value as OrganizationType);
  };

  const onForwardAction = () => {
    console.log('selectedValue', selectedValue);
    forward(selectedValue);
  };

  const onBackAction = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    back!();
  };

  return (
    <Grid container display="flex" justifyContent="center" alignItems="center">
      <Grid item xs={12} display="flex" justifyContent="center">
        <Typography variant="h3" align="center" pb={4}>
          <Trans i18nKey="stepInstitutionType.title">
            Seleziona il tipo di ente che <br /> rappresenti
          </Trans>
        </Typography>
      </Grid>
      <Box
        width="480px"
        height="100%"
        sx={{
          boxShadow:
            '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
          borderRadius: '16px',
          p: 1,
        }}
      >
        <Grid container item>
          <Grid item xs={12} p={6}>
            <FormControl>
              <RadioGroup name="radio-buttons-group" defaultValue={organizationType}>
                {organizationTypeValues.map((ot) => (
                  <FormControlLabel
                    key={ot.labelKey}
                    onChange={() => handleChange(ot.value)}
                    value={ot.value}
                    control={<Radio />}
                    label={t(`stepInstitutionType.organizationTypeValues.${ot.labelKey}`) as string}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} my={4}>
            <OnboardingStepActions
              back={{
                action: onBackAction,
                label: t('stepBillingData.backLabel'),
                disabled: false,
              }}
              forward={{
                action: onForwardAction,
                label: t('stepBillingData.confirmLabel'),
                disabled: false,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
}
