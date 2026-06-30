import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, Grid, IconButton, Link, TextField, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { uniqueId } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { OnboardingStepActions } from '../../../../components/registrationSteps/OnboardingStepActions';
import { DocumentCard } from './DocumentCard';
import { DocumentUploader } from './DocumentUploader';

export type DocumentGroup = 'naturaGiuridica' | 'visura' | 'servizioPubblico';

export type UploadedDocument = {
  id: string;
  group: DocumentGroup;
  /** Name sent to the backend as the attachment name */
  name: string;
  /** User-entered title, used only for the "servizio pubblico" documents */
  title: string;
  file?: File;
};

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
  documents: Array<UploadedDocument>;
  setDocuments: Dispatch<SetStateAction<Array<UploadedDocument>>>;
  loading: boolean;
  forward: () => void;
  back: () => void;
  onDropRejected?: () => void;
};

export function StepUploadDocuments({
  documents,
  setDocuments,
  loading,
  forward,
  back,
  onDropRejected,
}: Props) {
  const { t } = useTranslation();

  const naturaGiuridica = documents.find((d) => d.group === 'naturaGiuridica');
  const visura = documents.find((d) => d.group === 'visura');
  const servizioPubblico = documents.filter((d) => d.group === 'servizioPubblico');

  const updateDocument = (id: string, patch: Partial<UploadedDocument>) =>
    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)));

  const addServizioPubblico = () =>
    setDocuments((prev) => [
      ...prev,
      {
        id: uniqueId('servizio-pubblico-'),
        group: 'servizioPubblico',
        name: t('upladDocuments.uploader.third.name'),
        title: '',
      },
    ]);

  const removeDocument = (id: string) =>
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));

  // natura giuridica + visura require a file; every servizio pubblico doc requires title + file
  const canSubmit =
    !!naturaGiuridica?.file &&
    !!visura?.file &&
    servizioPubblico.every((doc) => !!doc.file && doc.title.trim().length > 0);

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

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Grid container direction="column" alignItems="center" mt={1} width="100%">
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

        {/* Card 1 - Natura giuridica */}
        {naturaGiuridica && (
          <DocumentCard
            title={t('upladDocuments.uploader.first.cardTitle')}
            description={t('upladDocuments.uploader.first.cardDescription')}
            helper={t('upladDocuments.uploader.helper')}
          >
            {renderUploader(naturaGiuridica)}
          </DocumentCard>
        )}

        {/* Card 2 - Visura */}
        {visura && (
          <DocumentCard
            title={t('upladDocuments.uploader.second.name')}
            description={t('upladDocuments.uploader.second.cardDescription')}
            helper={t('upladDocuments.uploader.helper')}
          >
            {renderUploader(visura)}
          </DocumentCard>
        )}

        {/* Card 3 - Gestione del servizio pubblico (multiple documents) */}
        <DocumentCard
          title={t('upladDocuments.uploader.third.cardTitle')}
          description={t('upladDocuments.uploader.third.cardDescription')}
          helper={t('upladDocuments.uploader.helper')}
        >
          {servizioPubblico.map((doc, index) => (
            <Box key={doc.id} mb={index < servizioPubblico.length - 1 ? 3 : 0}>
              <Grid container alignItems="center" spacing={1} mb={2}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('upladDocuments.uploader.third.documentTitle')}
                    value={doc.title}
                    onChange={(e) => updateDocument(doc.id, { title: e.target.value })}
                  />
                </Grid>
                {servizioPubblico.length > 1 && (
                  <Grid item>
                    <IconButton
                      aria-label={t('upladDocuments.uploader.third.documentTitle')}
                      onClick={() => removeDocument(doc.id)}
                    >
                      <DeleteOutlineOutlinedIcon color="error" />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
              {renderUploader(doc)}
            </Box>
          ))}
          <Box mt={2} display="flex" justifyContent="flex-start">
            <Link
              component="button"
              variant="body2"
              onClick={addServizioPubblico}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <AddOutlinedIcon fontSize="small" />
              {t('upladDocuments.uploader.third.addDocument')}
            </Link>
          </Box>
        </DocumentCard>

        <Grid container item mt={1} maxWidth="704px">
          <Grid item xs={12} mb={2}>
            <OnboardingStepActions
              back={{
                action: back,
                label: t('onboardingFormData.backLabel'),
                disabled: loading,
              }}
              forward={{
                action: forward,
                label: t('onboardingFormData.confirmLabel'),
                disabled: !canSubmit || loading,
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
