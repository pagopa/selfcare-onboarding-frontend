import { Grid, Typography, useTheme, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CustomTextField } from '../steps/StepOnboardingFormData';
import { OnboardingFormData } from '../../model/OnboardingFormData';

type Props = {
  baseTextFieldProps: any;
  dpoData: OnboardingFormData;
};
export default function DpoSection({ baseTextFieldProps, dpoData }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Paper
        elevation={8}
        id="dpo-data-section"
        sx={{ borderRadius: theme.spacing(2), p: 4, width: '704px', my: 2 }}
      >
        <Grid container item pb={3}>
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ fontWeight: 'fontWeightBold' }}>
              {t('onboardingFormData.dpoDataSection.dpoTitle')}
            </Typography>
          </Grid>
        </Grid>
        <Grid item container spacing={3}>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'address',
                t('onboardingFormData.dpoDataSection.dpoAddress'),
                600
              )}
              value={dpoData?.address}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'pec',
                t('onboardingFormData.dpoDataSection.dpoPecAddress'),
                600
              )}
              value={dpoData?.pec}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'email',
                t('onboardingFormData.dpoDataSection.dpoEmailAddress'),
                600
              )}
              value={dpoData?.email}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
