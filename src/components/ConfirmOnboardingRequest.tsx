import { SessionModal } from '@pagopa/selfcare-common-frontend';
import { Trans, useTranslation } from 'react-i18next';

type ModalProps = {
  open: boolean;
  productName?: string;
  partyName?: string;
  onConfirm: () => void;
  handleClose: () => void;
};

export const ConfirmOnboardingModal = ({
  open,
  productName,
  partyName,
  onConfirm,
  handleClose,
}: ModalProps) => {
  const { t } = useTranslation();

  return (
    <SessionModal
      open={open}
      title={t('onboarding.confirmationModal.title')}
      message={
        <Trans i18nKey="onboarding.confirmationModal.description">
          Stai inviando una richiesta di adesione al prodotto
          <b>
            {{
              productName,
            }}
          </b>
          per l’ente <b>{{ institutionName: partyName }}</b>.
          <br />
          L&apos;accordo di adesione arriverà alla PEC istituzionale dell’ente e dovrà essere
          sottoscritta dal Legale Rappresentante. Assicurati di essere autorizzato come dipendente a
          effettuare questa richiesta.
        </Trans>
      }
      onCloseLabel={t('onboarding.confirmationModal.cancelLabel')}
      onConfirmLabel={t('onboarding.confirmationModal.confirmLabel')}
      onConfirm={onConfirm}
      handleClose={handleClose}
    />
  );
};
