import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { OnboardingStepActions } from '../../../../components/registrationSteps/OnboardingStepActions';
import { RequiredDocument, UploadedDocument } from '../../../../model/Documents';
import ContractSummaryCard from '../components/ContractSummaryCard';

type Props = {
  requiredDocuments: Array<RequiredDocument>;
  documents: Array<UploadedDocument>;
  forward: () => void;
  back: () => void;
};

const UploadedContractsSummary = ({ requiredDocuments, documents, forward, back }: Props) => {
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
          {requiredDocuments.map((rd) => {
            const docsForRd = documents.filter((d) => d.documentCode === rd.id);
            const max = rd.maxDocumentsRequired ?? 1;
            return (
              <Grid item xs={12} width="100%" key={rd.id}>
                <ContractSummaryCard
                  document={max > 1 ? docsForRd : docsForRd[0]}
                  labelKey={rd.labelKey}
                  name={rd.name}
                />
              </Grid>
            );
          })}
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
