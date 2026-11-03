import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { Trans, useTranslation } from 'react-i18next';
import { customErrors } from '../../../utils/constants';

type ErrorCode = keyof typeof customErrors;

type Props = {
  open: boolean;
  errorCode: ErrorCode;
  addUserFlow: boolean;
  onClose: () => void;
  onExit: () => void;
  onConfirm: () => void;
};

export const getUploadErrorMessageKey = (errorCode: ErrorCode, addUserFlow: boolean) => {
  if (errorCode === 'GENERIC') {
    return `completeRegistration.errors.${errorCode}.message`;
  }
  return `completeRegistration.errors.${errorCode}.${addUserFlow ? 'user' : 'product'}.message`;
};

export function UploadErrorModal({
  open,
  errorCode,
  addUserFlow,
  onClose,
  onExit,
  onConfirm,
}: Readonly<Props>) {
  const { t } = useTranslation();

  return (
    <SessionModal
      handleClose={onClose}
      handleExit={onExit}
      onConfirm={onConfirm}
      open={open}
      title={t(`completeRegistration.errors.${errorCode}.title`)}
      message={
        errorCode === 'INVALID_SIGN_FORMAT' ? (
          <Trans i18nKey={`completeRegistration.errors.${errorCode}.message`}>
            {'Il caricamento del documento non è andato a buon fine.'}
            <br />
            {'Carica un solo file in formato '}
            <strong>{'p7m'}</strong>
            {'.'}
          </Trans>
        ) : (
          t(getUploadErrorMessageKey(errorCode, addUserFlow))
        )
      }
      onConfirmLabel={t('completeRegistration.sessionModal.onConfirmLabel')}
      onCloseLabel={t('completeRegistration.sessionModal.onCloseLabel')}
    />
  );
}
