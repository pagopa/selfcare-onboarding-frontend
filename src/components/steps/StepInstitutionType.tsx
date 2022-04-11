import { useTheme } from '@mui/material';
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
  { labelKey: 'pa', value: 'PA' as OrganizationType },
  { labelKey: 'gsp', value: 'GSP' as OrganizationType },
  { labelKey: 'scp', value: 'SCP' as OrganizationType },
  { labelKey: 'pt', value: 'PT' as OrganizationType },
];

export default function StepInstitutionType({ back, forward, organizationType }: Props) {
  const [selectedValue, setSelectedValue] = React.useState<OrganizationType>(organizationType);

  const { t } = useTranslation();
  const theme = useTheme();

  const handleChange = (value: OrganizationType) => setSelectedValue(value);

  const onForwardAction = () => {
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
        width="580px"
        height="100%"
        sx={{
          boxShadow:
            '0px 8px 10px -5px rgba(0, 43, 85, 0.1), 0px 16px 24px 2px rgba(0, 43, 85, 0.05), 0px 6px 30px 5px rgba(0, 43, 85, 0.1)',
          borderRadius: '16px',
          p: 1,
        }}
      >
        <Grid container item>
          <Grid item xs={12} p={3}>
            <FormControl>
              <RadioGroup name="radio-buttons-group" defaultValue={organizationType}>
                {organizationTypeValues.map((ot) => (
                  <FormControlLabel
                    sx={{ p: '8px' }}
                    key={ot.labelKey}
                    onChange={() => handleChange(ot.value)}
                    value={ot.value}
                    control={<Radio id={ot.labelKey} />}
                    label={t(`stepInstitutionType.organizationTypeValues.${ot.labelKey}`) as string}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <Grid item xs={12} display="flex" justifyContent="center" p={4}>
        <Typography color={theme.palette.text.secondary} variant="body1">
          {t('stepInstitutionType.description')}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <OnboardingStepActions
          back={{
            action: onBackAction,
            label: t('stepInstitutionType.backLabel'),
            disabled: false,
          }}
          forward={{
            action: onForwardAction,
            label: t('stepInstitutionType.confirmLabel'),
            disabled: !selectedValue,
          }}
        />
      </Grid>
    </Grid>
  );
}
