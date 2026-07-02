import { Box, Grid, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { uniqueId } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadedDocument } from '../../../model/Documents';
import { DocumentCard } from './components/DocumentCard';
import { DocumentUploader } from './components/DocumentUploader';
import MultiDocumentCard from './components/MultiDocumentCard';

const PDF_ACCEPT = { 'application/pdf': ['.pdf'] };

export const buildInitialDocuments = (t: TFunction): Array<UploadedDocument> => [
  {
    id: uniqueId('natura-giuridica-'),
    group: 'naturaGiuridica',
    name: t('upladDocuments.uploader.first.name'),
    title: '',
  },
  {
    id: uniqueId('visura-'),
    group: 'visura',
    name: t('upladDocuments.uploader.second.name'),
    title: '',
  },
  {
    id: uniqueId('servizio-pubblico-'),
    group: 'servizioPubblico',
    name: t('upladDocuments.uploader.third.name'),
    title: '',
  },
];

type Props = {
  naturaGiuridica: UploadedDocument | undefined;
  visura: UploadedDocument | undefined;
  servizioPubblico: Array<UploadedDocument>;
  setDocuments: Dispatch<SetStateAction<Array<UploadedDocument>>>;
  loading: boolean;
  forward: () => void;
  onDropRejected?: () => void;
};

const StepUploadDocuments = ({
  naturaGiuridica,
  visura,
  servizioPubblico,
  setDocuments,
  loading,
  forward,
  onDropRejected,
}: Props) => {
  const { t } = useTranslation();

  const [activeStep, setActiveStep] = useState(0);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const updateDocument = (id: string, patch: Partial<UploadedDocument>) =>
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)));

  const removeDocument = (id: string) =>
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));

  const canSubmitServizio = servizioPubblico.every(
    (doc) => !!doc.file && doc.title.trim().length > 0
  );

  const renderUploader = (doc: UploadedDocument) => (
    <DocumentUploader
      file={doc.file}
      onDropAccepted={(f) => updateDocument(doc.id, { file: f })}
      onDropRejected={onDropRejected ?? (() => undefined)}
      onDelete={() => updateDocument(doc.id, { file: undefined })}
      dragLabel={t('upladDocuments.uploader.drag')}
      uploadLabel={t('upladDocuments.uploader.upload')}
      loading={loading}
      accept={PDF_ACCEPT}
    />
  );

  const stepLabels = [
    t('upladDocuments.uploader.first.name'),
    t('upladDocuments.uploader.second.name'),
    t('upladDocuments.uploader.third.name'),
  ];

  const steps: Array<React.ReactNode> = [
    <DocumentCard
      key="naturaGiuridica"
      title={t('upladDocuments.uploader.first.name')}
      description={t('upladDocuments.uploader.first.cardDescription')}
      helper={t('upladDocuments.uploader.helper')}
      canSubmit={!!naturaGiuridica?.file}
      forward={handleNext}
      back={handleBack}
      loading={loading}
    >
      {naturaGiuridica && renderUploader(naturaGiuridica)}
    </DocumentCard>,
    <DocumentCard
      key="visura"
      title={t('upladDocuments.uploader.second.name')}
      description={t('upladDocuments.uploader.second.cardDescription')}
      helper={t('upladDocuments.uploader.helper')}
      canSubmit={!!visura?.file}
      forward={handleNext}
      back={handleBack}
      loading={loading}
    >
      {visura && renderUploader(visura)}
    </DocumentCard>,
    <MultiDocumentCard
      key="servizioPubblico"
      servizioPubblico={servizioPubblico}
      canSubmitServizio={canSubmitServizio}
      handleNext={forward}
      handleBack={handleBack}
      updateDocument={updateDocument}
      removeDocument={removeDocument}
      renderUploader={renderUploader}
      setDocuments={setDocuments}
      loading={loading}
    />,
  ];

  return (
    <Box display="flex" justifyContent="center" alignItems="center" width="100%">
      <Grid
        container
        display="flex"
        justifyContent="center"
        direction="column"
        alignItems="center"
        mt={1}
        width="70%"
      >
        <Grid item xs={12}>
          <Typography variant="h3" component="h1" align="center" sx={{ lineHeight: '1.2' }}>
            {t('upladDocuments.title')}
          </Typography>
        </Grid>
        <Grid item xs={12} my={2}>
          <Typography sx={{ fontWeight: 400 }} variant="body1" align="center">
            {t('upladDocuments.subtitle')}
          </Typography>
        </Grid>

        <Grid item xs={12} width="70%" justifyContent="space-between" alignItems="center" mt={2}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {stepLabels.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Grid>

        <Grid item xs={12} mt={1} width="70%">
          {steps[activeStep]}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StepUploadDocuments;
