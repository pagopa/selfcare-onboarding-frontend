import { Box, Grid, Paper, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { OnboardingStepActions } from '../../../components/registrationSteps/OnboardingStepActions';

type Props = {
  forward: () => void;
  back?: () => void;
};

const StepContractsSummary = ({ forward, back }: Props) => {
  const { t } = useTranslation();
  const contractsSummary = [
    {
      icon: <DescriptionOutlinedIcon color="action" sx={{ fontSize: 40 }} />,
      title: 'Documentazione attestante la natura giuridica',
      description: 'Statuto in formato PDF',
    },
    {
      icon: <DescriptionOutlinedIcon color="action" sx={{ fontSize: 40 }} />,
      title: 'Visura',
      description: 'in formato PDF',
    },
    {
      icon: <DescriptionOutlinedIcon color="action" sx={{ fontSize: 40 }} />,
      title: 'Attestazione di gestione del servizio pubblico',
      description: '(es: convenzioni con PA o delibere comunali) in formato PDF',
    },
  ];

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Grid container direction="column" mt={1} width="60%">
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center" sx={{ lineHeight: '1.2' }}>
            {t('StepContractsSummary.title')}
          </Typography>
        </Grid>
        <Grid item xs={12} my={2}>
          <Typography sx={{ fontWeight: 400 }} variant="body1" component="h2" align="center">
            {t('StepContractsSummary.subTitle')}
          </Typography>
        </Grid>
        <Paper
          elevation={8}
          sx={{
            borderRadius: theme.spacing(2), 
            p: 7,
            width: '704px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Grid container spacing={3}>
            {contractsSummary.map((contract, index) => (
              <Grid container item direction="row" xs={12} key={index} my={2}>
                <Grid item xs={2}  alignItems="center" textAlign="center">
                  {contract.icon}
                </Grid>
                <Grid container item xs={10} direction="row" textAlign="start"> 
                  <Grid item xs={12}>
                    <Typography variant="h6" component="h2">
                      {contract.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: 400 }} variant="body1" component="h2">
                      {contract.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Paper>
        <Grid container item mt={1}>
          <Grid item xs={12} mb={2}>
            <OnboardingStepActions
              back={{
                action: back,
                label: t('onboardingFormData.backLabel'),
                disabled: false,
              }}
              forward={{
                action: forward,
                label: t('onboardingFormData.confirmLabel'),
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StepContractsSummary;
