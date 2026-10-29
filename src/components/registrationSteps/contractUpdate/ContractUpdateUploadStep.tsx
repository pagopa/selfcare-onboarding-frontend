import { Box, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { MIButton, MIPaper } from '@pagopa/mui-italia';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../../utils/env';
import { ContractDragAndDrop } from '../../fileUpload/ContractDragAndDrop';
import { ContractUpdateLayout } from './ContractUpdateLayout';

const ACCEPTED_FILES = {
  'application/pdf': ['.pdf'],
  'application/x-pkcs7-certificates': ['.p7c'],
  'application/x-pkcs7-certreqresp': ['.p7r'],
  'application/x-pkcs7-mime': ['.p7m'],
  'application/x-pkcs7-signature': ['.p7z'],
};

type Props = {
  loading: boolean;
  uploadedFiles: Array<File>;
  onFilesChange: (files: Array<File>) => void;
  onContinue: () => void;
  onBack?: () => void;
};

export function ContractUpdateUploadStep({
  loading,
  uploadedFiles,
  onFilesChange,
  onContinue,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState<boolean>(false);
  const [requiredError, setRequiredError] = useState<boolean>(false);
  const file = uploadedFiles?.[0];

  const handleContinue = () => {
    if (file) {
      onContinue();
    } else {
      setRequiredError(true);
    }
  };

  return (
    <ContractUpdateLayout>
      <Stack gap={3} py={2}>
        <Box>
          <MIButton
            variant="text"
            size="small"
            startIcon={<CloseIcon />}
            onClick={() => window.location.assign(ENV.URL_FE.LANDING)}
            sx={{ '&&': { color: 'text.primary' } }}
          >
            {t('contractUpdate.exit')}
          </MIButton>
        </Box>
        <Box>
          <Typography variant="h4" component="h1">
            {t('contractUpdate.upload.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            {t('contractUpdate.upload.description')}
          </Typography>
        </Box>
        <MIPaper padding={24}>
          <ContractDragAndDrop
            file={file}
            accept={ACCEPTED_FILES}
            loading={loading}
            failed={failed}
            error={requiredError}
            required
            onFileSelected={(selected) => {
              setFailed(false);
              onFilesChange([selected]);
            }}
            onFileRemoved={() => onFilesChange([])}
            onFileRejected={() => setFailed(true)}
          />
        </MIPaper>
        <Stack direction="row" justifyContent="space-between" gap={2}>
          {onBack ? (
            <MIButton variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
              {t('contractUpdate.upload.back')}
            </MIButton>
          ) : (
            <span />
          )}
          <MIButton variant="contained" isLoading={loading} onClick={handleContinue}>
            {t('contractUpdate.upload.continue')}
          </MIButton>
        </Stack>
      </Stack>
    </ContractUpdateLayout>
  );
}
