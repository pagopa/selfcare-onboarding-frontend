import { Box, Grid, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RequiredDocument, UploadedDocument } from '../../../../model/Documents';
import DocumentAlert from '../components/DocumentAlert';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentUploader } from '../components/DocumentUploader';
import MultiDocumentCard from '../components/MultiDocumentCard';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
type DocError = 'required' | 'size';
type Props = {
  requiredDocuments: Array<RequiredDocument>;
  documents: Array<UploadedDocument>;
  setDocuments: Dispatch<SetStateAction<Array<UploadedDocument>>>;
  loading: boolean;
  forward: () => void;
  onDropRejected?: () => void;
};

const StepUploadDocuments = ({
  requiredDocuments,
  documents,
  setDocuments,
  loading,
  forward,
  onDropRejected,
}: Props) => {
  const { t } = useTranslation();

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, DocError | undefined>>({});
  const PDF_ACCEPT = { 'application/pdf': ['.pdf'] };

  const setError = (documentCode: string, error: DocError | undefined) =>
    setErrors((prev) => ({ ...prev, [documentCode]: error }));

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

  const label = (labelKey: string, suffix: string, fallback: string) =>
    t(`upladDocuments.uploader.${labelKey}.${suffix}`, { defaultValue: fallback });

  const stepLabels = requiredDocuments.map((rd) => label(rd.labelKey, 'name', rd.name));

  const renderUploader = (doc: UploadedDocument) => (
    <DocumentUploader
      file={doc.file}
      onDropAccepted={(f) => {
        if (f.size > MAX_FILE_SIZE) {
          setError(doc.documentCode, 'size');
          return;
        }
        setError(doc.documentCode, undefined);
        updateDocument(doc.id, { file: f });
      }}
      onDropRejected={onDropRejected ?? (() => undefined)}
      onDelete={() => updateDocument(doc.id, { file: undefined })}
      dragLabel={t('upladDocuments.uploader.drag')}
      uploadLabel={t('upladDocuments.uploader.upload')}
      loading={loading}
      accept={PDF_ACCEPT}
    />
  );

  const isStepValid = (rd: RequiredDocument): boolean => {
    const docs = documents.filter((d) => d.documentCode === rd.id);
    if ((rd.maxDocumentsRequired ?? 1) > 1) {
      return docs.length > 0 && docs.every((d) => !!d.file && d.title.trim().length > 0);
    }
    return !!docs[0]?.file;
  };

  const handleForward = (rd: RequiredDocument, goForward: () => void) => {
    if (!isStepValid(rd)) {
      setError(rd.id, 'required');
      return;
    }
    setError(rd.id, undefined);
    goForward();
  };

  const renderAlert = (error: DocError | undefined) => {
    if (!error) {
      return null;
    }
    const key = error === 'size' ? 'fileTooLarge' : 'required';
    return (
      <DocumentAlert
        title={t(`upladDocuments.alert.${key}.title`)}
        description={t(`upladDocuments.alert.${key}.description`)}
      />
    );
  };

  const steps: Array<React.ReactNode> = requiredDocuments.map((rd, index) => {
    const docsForStep = documents.filter((d) => d.documentCode === rd.id);
    const isLast = index === requiredDocuments.length - 1;
    const goForward = isLast ? forward : handleNext;
    const max = rd.maxDocumentsRequired ?? 1;

    if (max > 1) {
      return (
        <MultiDocumentCard
          key={rd.id}
          requiredDocument={rd}
          documents={docsForStep}
          handleNext={() => handleForward(rd, goForward)}
          handleBack={handleBack}
          updateDocument={updateDocument}
          removeDocument={removeDocument}
          renderUploader={renderUploader}
          setDocuments={setDocuments}
          loading={loading}
          alert={renderAlert(errors[rd.id])}
        />
      );
    }

    const doc = docsForStep[0];
    return (
      <DocumentCard
        key={rd.id}
        title={label(rd.labelKey, 'cardTitle', rd.name)}
        description={label(rd.labelKey, 'cardDescription', '')}
        helper={t('upladDocuments.uploader.helper')}
        forward={() => handleForward(rd, goForward)}
        back={handleBack}
        loading={loading}
      >
        {renderAlert(errors[rd.id])}
        {doc && renderUploader(doc)}
      </DocumentCard>
    );
  });

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
