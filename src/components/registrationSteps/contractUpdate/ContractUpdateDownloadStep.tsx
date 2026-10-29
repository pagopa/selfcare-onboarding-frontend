import { Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import { IllusMIDownload, IllusMIUploadFile, MIButton, MIPaper } from '@pagopa/mui-italia';
import { Trans, useTranslation } from 'react-i18next';
import { ContractUpdateLayout } from './ContractUpdateLayout';

type Props = {
  productTitle?: string;
  onDownload: () => void;
  onGoToUpload: () => void;
};

export function ContractUpdateDownloadStep({ productTitle, onDownload, onGoToUpload }: Props) {
  const { t } = useTranslation();

  return (
    <ContractUpdateLayout maxWidth={627}>
      <Stack gap={3} py={2}>
        <MIPaper padding={24} borderRadius={16}>
          <Stack alignItems="center" textAlign="center" gap={2}>
            <IllusMIDownload size={64} />
            <Typography variant="h4" component="h1">
              {t('contractUpdate.download.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Trans i18nKey="contractUpdate.download.description" components={{ 2: <strong /> }} />
            </Typography>
            <MIButton variant="contained" endIcon={<DownloadIcon />} onClick={onDownload}>
              {t('contractUpdate.download.downloadContract')}
            </MIButton>
            <Typography variant="caption" color="text.secondary">
              {t('contractUpdate.download.disclaimer')}
            </Typography>
          </Stack>
        </MIPaper>
        <MIPaper padding={24} borderRadius={16}>
          <Stack alignItems="center" textAlign="center" gap={2}>
            <IllusMIUploadFile size={64} />
            <Typography variant="h4" component="h2">
              {t('contractUpdate.chooseUpload.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Trans
                i18nKey="contractUpdate.chooseUpload.description"
                values={{ productTitle }}
                components={{ 3: <strong /> }}
              />
            </Typography>
            <MIButton variant="contained" endIcon={<ArrowForwardIcon />} onClick={onGoToUpload}>
              {t('contractUpdate.chooseUpload.goToUpload')}
            </MIButton>
          </Stack>
        </MIPaper>
      </Stack>
    </ContractUpdateLayout>
  );
}
