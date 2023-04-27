import { Grid, Typography, useTheme, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CustomTextField } from '../steps/StepOnboardingFormData';

type Props = {
  baseTextFieldProps: any;
};
export default function DpoSection({ baseTextFieldProps }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {/* DATI DEL DPO */}
      <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 4, width: '704px' }}>
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
                'dpoAddress',
                t('onboardingFormData.dpoDataSection.dpoAddress'),
                400,
                18
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'dpoPecAddress',
                t('onboardingFormData.dpoDataSection.dpoPecAddress'),
                400,
                18
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'dopEmailAddress',
                t('onboardingFormData.dpoDataSection.dopEmailAddress'),
                400,
                18
              )}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
