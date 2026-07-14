import { Box, Grid, Paper, Typography } from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import { useTranslation } from 'react-i18next';
import { OnboardingStepActions } from '../../../../components/registrationSteps/OnboardingStepActions';

type DocumentCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  forward: () => void;
  back: () => void;
  loading: boolean;
  helper?: string;
};

export const DocumentCard = ({
  title,
  description,
  children,
  helper,
  forward,
  back,
  loading,
}: DocumentCardProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Grid container direction="column" alignItems="center" mt={1} width="100%">
        <Paper
          elevation={8}
          sx={{
            borderRadius: theme.spacing(2),
            p: 4,
            my: 2,
            width: '704px',
          }}
        >
          <Grid
            container
            display="flex"
            direction="column"
            alignItems="flex-start"
            justifyContent="center"
            sx={{ width: '100%' }}
          >
            <Grid item xs={12} textAlign="left">
              <Typography
                component="div"
                variant="caption"
                sx={{ fontWeight: 'fontWeightBold' }}
                mb={1}
              >
                {title.toUpperCase()}
              </Typography>
              <Typography sx={{ fontWeight: 400 }} variant="body2" mb={3}>
                {description}
              </Typography>
            </Grid>
            <Grid item xs={12} width="100%">
              {children}
            </Grid>
            <Grid item xs={12}>
              {helper && (
                <Typography variant="caption" color={theme.palette.text.secondary} align="center">
                  {helper}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
        <Grid item xs={12} mt={1}>
          <OnboardingStepActions
            back={{
              action: back,
              label: t('onboardingFormData.backLabel'),
              disabled: loading,
            }}
            forward={{
              action: forward,
              label: t('onboardingFormData.confirmLabel'),
              disabled: loading,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
