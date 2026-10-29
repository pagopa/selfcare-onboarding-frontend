import BuildIcon from '@mui/icons-material/Build';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MIButton, MIIconButton, MIPaper } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../../utils/env';
import { ContractUpdateLayout } from './ContractUpdateLayout';

export type ContractUpdateErrorVariant =
  | 'generic'
  | 'expired'
  | 'alreadyCompleted'
  | 'cancelled'
  | 'notAllowed';

type Props = {
  variant: ContractUpdateErrorVariant;
  errorDescription?: string;
  institutionId?: string;
  productTitle?: string;
};

const SHOW_ERROR_DESCRIPTION: Array<ContractUpdateErrorVariant> = ['generic', 'expired'];
const SHOW_EXIT_AND_ASSISTANCE: Array<ContractUpdateErrorVariant> = ['generic', 'notAllowed'];
const SHOW_DOCUMENTS: Array<ContractUpdateErrorVariant> = ['expired', 'cancelled'];

export function ContractUpdateErrorPage({
  variant,
  errorDescription,
  institutionId,
  productTitle,
}: Props) {
  const { t } = useTranslation();

  const institutionUrl = institutionId
    ? `${ENV.URL_FE.DASHBOARD}/${institutionId}`
    : ENV.URL_FE.DASHBOARD;

  const showErrorDescription = SHOW_ERROR_DESCRIPTION.includes(variant) && !!errorDescription;

  return (
    <ContractUpdateLayout>
      <Stack alignItems="center" justifyContent="center" spacing={3} minHeight="52vh">
        <BuildIcon
          aria-hidden
          sx={{ fontSize: 40, color: (theme) => alpha(theme.palette.primary.main, 0.25) }}
        />
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" component="h1" align="center" sx={{ maxWidth: 280 }}>
            {t(`contractUpdate.error.${variant}.title`)}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 320 }}>
            {t(`contractUpdate.error.${variant}.description`, { productTitle })}
          </Typography>
        </Stack>

        {showErrorDescription && (
          <MIPaper padding={16} borderRadius={8} sx={{ width: '100%', maxWidth: 360 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography
                variant="body2"
                data-testid="contract-update-error-description"
                sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}
              >
                {errorDescription}
              </Typography>
              <MIIconButton
                size="small"
                aria-label={t('contractUpdate.error.copyErrorCode')}
                onClick={() => void navigator.clipboard?.writeText(errorDescription)}
              >
                <ContentCopyIcon fontSize="small" color="primary" />
              </MIIconButton>
            </Stack>
          </MIPaper>
        )}

        {SHOW_DOCUMENTS.includes(variant) && (
          <MIButton
            variant="contained"
            size="small"
            onClick={() =>
              window.location.assign(
                institutionId
                  ? `${ENV.URL_FE.DASHBOARD}/${institutionId}/documents`
                  : ENV.URL_FE.DASHBOARD
              )
            }
          >
            {t('contractUpdate.error.goToDocuments')}
          </MIButton>
        )}

        {variant === 'alreadyCompleted' && (
          <MIButton
            variant="contained"
            size="small"
            onClick={() => window.location.assign(institutionUrl)}
          >
            {t('contractUpdate.error.login')}
          </MIButton>
        )}

        {SHOW_EXIT_AND_ASSISTANCE.includes(variant) && (
          <Stack spacing={2} alignItems="center">
            <MIButton
              variant="contained"
              size="small"
              onClick={() => window.location.assign(ENV.URL_FE.LOGOUT)}
            >
              {t('contractUpdate.error.exit')}
            </MIButton>
            <MIButton
              variant="text"
              size="small"
              onClick={() => window.location.assign(ENV.URL_FE.ASSISTANCE)}
            >
              {t('contractUpdate.error.contactAssistance')}
            </MIButton>
          </Stack>
        )}
      </Stack>
    </ContractUpdateLayout>
  );
}
