import { styled } from '@mui/system';
import { Grid, TextField, Typography, useTheme, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { StepperStepComponentProps } from '../../../types';

const CustomTextField = styled(TextField)({
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
});

type Props = StepperStepComponentProps & {
  baseTextFieldProps: any;
};
export default function DpoSection({ baseTextFieldProps }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {/* DATI DEL DPO */}
      <Grid container item justifyContent="center" mt={6} mb={4}>
        <Grid item xs={12}>
          <Typography align="center" sx={{ fontWeight: 'fontWeightMedium', fontSize: '24px' }}>
            {t('stepBillingData.dpoTitle')}
          </Typography>
        </Grid>
      </Grid>
      <Paper elevation={8} sx={{ borderRadius: theme.spacing(2), p: 1 }}>
        <Grid item container spacing={3} p={3}>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps('dpoAddress', t('stepBillingData.dpoAddress'), 400, 18)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps('dpoPecAddress', t('stepBillingData.dpoPecAddress'), 400, 18)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              {...baseTextFieldProps(
                'dopEmailAddress',
                t('stepBillingData.dopEmailAddress'),
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
