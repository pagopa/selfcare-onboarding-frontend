import { Paper, Grid, Typography, FormHelperText } from '@mui/material';
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
    // const isIbanField = field === 'iban' || field === 'confirmIban';

    return {
      ...baseProps,
      inputProps: {
        maxLength: 27,
        style: {
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
        },
        /* // disable copy/paste/cut for IBAN fields
        ...(isIbanField && {
          onPaste: (e: React.ClipboardEvent) => e.preventDefault(),
          onCopy: (e: React.ClipboardEvent) => e.preventDefault(),
          onCut: (e: React.ClipboardEvent) => e.preventDefault(),
        }), */
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleanValue = e.target.value.replace(/\s/g, '').toUpperCase();
        if (cleanValue.length <= 27) {
          formik.setFieldValue(field, cleanValue);
        }
      },
    };
  };
  const CharacterCounter = ({ field }: { field: string }) => {
    const currentLength = formik.values[field]?.length || 0;
    return (
      <FormHelperText
        sx={{
          textAlign: 'right',
          color: theme.palette.text.secondary,
          fontSize: '12px',
        }}
      >
        {currentLength}/27
      </FormHelperText>
    );
  };

  return (
    <Paper elevation={8} sx={{ p: 4, borderRadius: 4, my: 4, width: '704px' }}>
      <Grid container item pb={3}>
        <Grid item xs={12} display="flex">
          <Typography component="div" variant="caption" sx={{ fontWeight: 'fontWeightBold' }}>
            {t('onboardingFormData.ibanSection.title')}
          </Typography>
        </Grid>
        <Grid item xs={12} pt={3}>
            <CustomTextField
              {...baseTextFieldProps(
                'holder',
                t('onboardingFormData.ibanSection.holder'),
                600,
                theme.palette.text.primary
              )}
            />
        </Grid>
        <Grid item xs={12} pt={2}>
            <CustomTextField
              {...ibanTextFieldProps(
                'iban',
                t('onboardingFormData.ibanSection.iban'),
                600,
                theme.palette.text.primary
              )}
            />
            <CharacterCounter field="iban" />
        </Grid>
        <Grid item xs={12} pt={2}>
            <CustomTextField
              {...ibanTextFieldProps(
                'confirmIban',
                t('onboardingFormData.ibanSection.confirmIban'),
                600,
                theme.palette.text.primary
              )}
            />
            <CharacterCounter field="confirmIban" />
        </Grid>
      </Grid>
    </Paper>
  );
}
