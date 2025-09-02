import { Paper, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { CustomTextField } from '../steps/StepOnboardingFormData';

type Props = {
  baseTextFieldProps: any;
  formik: any;
};
export default function IbanSection({ baseTextFieldProps, formik }: Props) {
  const { t } = useTranslation();

  const ibanTextFieldProps = (
    field: string,
    label: string,
    maxWidth: number,
    color: string
  ) => {
    const baseProps = baseTextFieldProps(field, label, maxWidth, color);
    const currentLength = formik.values[field]?.length || 0;
    const errorText = formik.errors[field] && formik.touched[field] ? formik.errors[field] : '';
    const counterText = `${currentLength}/27`;
    
    // helper text layout for errors and character counter
    const helperText = (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%'
      }}>
        <span style={{ 
          color: errorText ? theme.palette.error.main : 'transparent'
        }}>
          {errorText || ''}
        </span>
        <span style={{ 
          color: theme.palette.text.secondary,
          fontSize: '12px'
        }}>
          {counterText}
        </span>
      </div>
    );
    
    return {
      ...baseProps,
      helperText,
      error: !!(formik.errors[field] && formik.touched[field]),
      inputProps: {
        maxLength: 27,
        style: { 
          textTransform: 'uppercase' as const
        },
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        // remove spaces and convert to uppercase
        const cleanValue = e.target.value.replace(/\s/g, '').toUpperCase();
        // limit to 27 characters
        if (cleanValue.length <= 27) {
          formik.setFieldValue(field, cleanValue);
        }
      },
    };
  };

  return (
    <Paper elevation={8} sx={{ p: 4, borderRadius: 4, mb: 2, mt: 6,width: '704px' }}>
      <Grid container item pb={3}>
        <Grid item xs={12} display="flex">
          <Typography component="div" variant="caption" sx={{ fontWeight: 'fontWeightBold' }}>
            {t('onboardingFormData.ibanSection.title')}
          </Typography>
        </Grid>
        <Grid item xs={12} pt={3}>
          <CustomTextField
            {...baseTextFieldProps(
              'owner',
              t('onboardingFormData.ibanSection.owner'),
              600,
              theme.palette.text.primary
            )}
          />
        </Grid>
        <Grid item xs={12} pt={3}>
          <CustomTextField
            {...ibanTextFieldProps(
              'iban',
              t('onboardingFormData.ibanSection.iban'),
              600,
              theme.palette.text.primary
            )}
          />
        </Grid>
        <Grid item xs={12} pt={3}>
          <CustomTextField
            {...ibanTextFieldProps(
              'confirmIban',
              t('onboardingFormData.ibanSection.confirmIban'),
              600,
              theme.palette.text.primary
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
