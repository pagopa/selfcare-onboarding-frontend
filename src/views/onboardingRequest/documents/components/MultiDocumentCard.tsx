import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Grid, IconButton, Link, Paper, TextField, Typography, useTheme } from '@mui/material';
import { uniqueId } from 'lodash';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { OnboardingStepActions } from '../../../../components/registrationSteps/OnboardingStepActions';
import { RequiredDocument, UploadedDocument } from '../../../../model/Documents';

type Props = {
  requiredDocument: RequiredDocument;
  documents: Array<UploadedDocument>;
  handleNext: () => void;
  handleBack: () => void;
  updateDocument: (id: string, updates: Partial<UploadedDocument>) => void;
  removeDocument: (id: string) => void;
  renderUploader: (doc: UploadedDocument) => JSX.Element;
  setDocuments: Dispatch<SetStateAction<Array<UploadedDocument>>>;
  loading: boolean;
  alert?: ReactNode;
};

const MultiDocumentCard = ({
  requiredDocument,
  documents,
  handleNext,
  handleBack,
  updateDocument,
  removeDocument,
  renderUploader,
  setDocuments,
  loading,
  alert,
}: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const max = requiredDocument.maxDocumentsRequired ?? 1;
  const canAddMore = documents.length < max;

  const addDocument = () =>
    setDocuments((prev) => [
      ...prev,
      {
        id: uniqueId(`${requiredDocument.id}-`),
        documentCode: requiredDocument.id,
        name: requiredDocument.name,
        title: '',
        documentType: 'REQUIRED',
      },
    ]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Grid container direction="column" alignItems="center" mt={1} width="100%">
        {documents.map((doc, index) => (
          <Paper
            key={doc.id}
            elevation={8}
            sx={{
              borderRadius: theme.spacing(2),
              p: 4,
              my: 2,
              width: '704px',
            }}
          >
            {index === 0 ? (
              <Box mb={3} width="100%" textAlign="left">
                <Typography
                  component="div"
                  variant="caption"
                  sx={{ fontWeight: 'fontWeightBold' }}
                  mb={1}
                >
                  {t(`upladDocuments.uploader.${requiredDocument.labelKey}.cardTitle`, {
                    defaultValue: requiredDocument.name,
                  }).toUpperCase()}
                </Typography>
                <Typography sx={{ fontWeight: 400 }} variant="body2">
                  {t(`upladDocuments.uploader.${requiredDocument.labelKey}.cardDescription`, {
                    defaultValue: '',
                  })}
                </Typography>
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" mb={1}>
                <IconButton
                  aria-label={t('upladDocuments.uploader.delete')}
                  onClick={() => removeDocument(doc.id)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
            <TextField
              fullWidth
              size="small"
              label={t('upladDocuments.uploader.documentTitle')}
              value={doc.title}
              onChange={(e) => updateDocument(doc.id, { title: e.target.value })}
              sx={{ mb: 2 }}
            />
            {index === 0 && alert}
            {renderUploader(doc)}
          </Paper>
        ))}

        {canAddMore && (
          <Box mt={1} display="flex" justifyContent="center">
            <Link
              component="button"
              variant="body2"
              onClick={addDocument}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <AddOutlinedIcon fontSize="small" />
              {t('upladDocuments.uploader.addDocument')}
            </Link>
          </Box>
        )}

        <Grid item xs={12} mt={3}>
          <OnboardingStepActions
            back={{
              action: handleBack,
              label: t('onboardingFormData.backLabel'),
              disabled: loading,
            }}
            forward={{
              action: handleNext,
              label: t('onboardingFormData.confirmLabel'),
              disabled: loading,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MultiDocumentCard;
