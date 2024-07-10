import { Grid, Typography } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { useState } from 'react';
import { theme } from '@pagopa/mui-italia';
import { StepperStepComponentProps } from '../../../../types';
import { OnboardingStepActions } from '../../../components/OnboardingStepActions';
import { FileUploader } from '../../../components/FileUploader';

type Props = {
  productName?: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
} & StepperStepComponentProps;

export function StepUploadAggregates({ productName, loading, forward, back }: Props) {
  const { t } = useTranslation();

  const [uploadedFile, _setUploadedFiles] = useState<Array<File>>([]);

  return (
    <Grid container direction="column">
      <Grid container item justifyContent="center" mb={6}>
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" align="center">
            <Trans i18nKey="stepUploadAggregates.title" values={{ productName }}>
              {`Indica gli enti da aggregare per ${productName}`}
            </Trans>
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="center" pb={4}>
        <FileUploader
          title={t('stepUploadAggregates.dropArea.title')}
          descriptionLink={t('stepUploadAggregates.dropArea.button')}
          uploadedFiles={uploadedFile}
          // TODO Methods and relative props will be added with SELC-5205
          // deleteUploadedFiles={deleteUploadedFiles}
          // onDropAccepted={onDropAccepted}
          // onDropRejected={onDropRejected}
          accept={['.csv']}
          loading={loading}
          theme={theme}
        />
      </Grid>
      <OnboardingStepActions
        back={{ label: t('stepUploadAggregates.back'), action: back, disabled: false }}
        forward={{ label: t('stepUploadAggregates.forward'), action: forward, disabled: false }}
      />
    </Grid>
  );
}
