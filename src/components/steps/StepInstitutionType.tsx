import {
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { InstitutionType, StepperStepComponentProps } from '../../../types';
import { OnboardingStepActions } from '../OnboardingStepActions';

type Props = StepperStepComponentProps & {
  institutionType: InstitutionType;
};

const institutionTypeValues: Array<{ labelKey: string; value: InstitutionType }> = [
  { labelKey: 'pa', value: 'PA' },
  { labelKey: 'gsp', value: 'GSP' },
  { labelKey: 'scp', value: 'SCP' },
  { labelKey: 'pt', value: 'PT' },
];

export default function StepInstitutionType({ back, forward, institutionType }: Props) {
  const [selectedValue, setSelectedValue] = React.useState<InstitutionType>(institutionType);

  const { t } = useTranslation();

  const theme = useTheme();

  const handleChange = (value: InstitutionType) => setSelectedValue(value);

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
      <Paper
        elevation={8}
        sx={{ borderRadius: theme.spacing(2), p: 1, width: '580px', height: '100%' }}
      >
        <Grid container item>
          <Grid item xs={12} p={3}>
            <FormControl>
              <RadioGroup name="radio-buttons-group" defaultValue={institutionType}>
                {institutionTypeValues.map((ot) => (
                  <FormControlLabel
                    sx={{ p: '8px' }}
                    key={ot.labelKey}
                    onChange={() => handleChange(ot.value)}
                    value={ot.value}
                    control={<Radio id={ot.labelKey} />}
                    label={
                      <>
                        <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#17324D' }}>
                          {t(`stepInstitutionType.institutionTypeValues.${ot.labelKey}`) as string}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#5C6F82',
                          }}
                        >
                          {ot.value === 'PT'
                            ? t('stepInstitutionType.cadArticle6')
                            : t('stepInstitutionType.cadArticle2')}
                        </Typography>
                      </>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      <Grid item xs={12} mt={4}>
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
