import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { OnboardingStepActions } from '../../../components/registrationSteps/OnboardingStepActions';
import { ContractSummaryDocument } from '../../../model/Documents';
import ContractSummaryCard from './components/ContractSummaryCard';

type Props = {
  contractSummary: ContractSummaryDocument;
  forward: () => void;
  back: () => void;
};

const UploadedContractsSummary = ({ contractSummary, forward, back }: Props) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" width="100%">
      <Grid
        container
        display="flex"
        justifyContent="center"
        direction="column"
        alignItems="center"
        mt={1}
      >
        <Grid item xs={12}>
          <Typography variant="h3" component="h1" align="center" sx={{ lineHeight: '1.2' }}>
            {t('upladDocuments.contractSummary.title')}
          </Typography>
        </Grid>
        <Grid item xs={12} my={2}>
          <Typography sx={{ fontWeight: 400 }} variant="body1" align="center">
            {t('upladDocuments.contractSummary.subtitle')}
          </Typography>
        </Grid>
        <Grid item xs={12} mt={1}>
          <Grid item xs={12} width="100%">
            <ContractSummaryCard document={contractSummary[0]} tkey="firstDocument" />
          </Grid>
          <Grid item xs={12} width="100%">
            <ContractSummaryCard document={contractSummary[1]} tkey="secondDocument" />
          </Grid>
          <Grid item xs={12} width="100%">
            <ContractSummaryCard document={contractSummary[2]} tkey="thirdDocument" />
          </Grid>
        </Grid>
        <Grid item xs={12} mt={1}>
          <Grid item xs={12} mt={1}>
            <OnboardingStepActions
              back={{
                action: back,
                label: t('onboardingFormData.backLabel'),
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

export default UploadedContractsSummary;
