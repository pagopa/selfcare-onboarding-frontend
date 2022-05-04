import { FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@mui/material';
import { Box } from '@mui/system';
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
      </Box>
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
