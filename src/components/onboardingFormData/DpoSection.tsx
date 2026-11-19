import { Grid, Typography, useTheme, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BaseTextFieldPropsFn, CustomTextField } from '../steps/StepOnboardingFormData';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { DataProtectionOfficerDto } from '../../../types';

type DpoField = keyof DataProtectionOfficerDto;

const DPO_FIELDS: ReadonlyArray<{ field: DpoField; labelKey: string }> = [
  { field: 'address', labelKey: 'onboardingFormData.dpoDataSection.dpoAddress' },
  { field: 'pec', labelKey: 'onboardingFormData.dpoDataSection.dpoPecAddress' },
  { field: 'email', labelKey: 'onboardingFormData.dpoDataSection.dpoEmailAddress' },
];

type Props = {
  baseTextFieldProps: BaseTextFieldPropsFn;
  dpoData: OnboardingFormData;
  disabled?: boolean;
};

export default function DpoSection({ baseTextFieldProps, dpoData, disabled }: Props) {
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
          {DPO_FIELDS.map(({ field, labelKey }) => (
            <Grid item xs={12} key={field}>
              <CustomTextField
                {...baseTextFieldProps(field, t(labelKey), 600)}
                value={dpoData?.[field]}
                disabled={disabled}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  );
}
