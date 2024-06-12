import { Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { SessionModal } from '@pagopa/selfcare-common-frontend';
import { Trans, useTranslation } from 'react-i18next';

type ModalProps = {
  open: boolean;
  addUser?: boolean;
  productName?: string;
  partyName?: string;
  onConfirm: () => void;
  handleClose: () => void;
};

export const ConfirmOnboardingModal = ({
  open,
  addUser,
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
        <Typography variant="body1" color={theme.palette.text.primary}>
          {addUser ? (
            <Trans
              i18nKey="onboarding.confirmationModal.description.flow.addNewUser"
              values={{ institutionName: partyName }}
              components={{ 1: <strong />, 3: <br /> }}
            >
              {`Stai aggiungendo un nuovo Amministratore per l’ente <1>{{institutionName}}</1>. <3 />L’ente riceverà un modulo alla PEC istituzionale e dovrà essere firmato dal Legale Rappresentante che hai indicato. <3 />Assicurati di essere autorizzato dall’ente a effettuare questa richiesta.`}
            </Trans>
          ) : (
            <Trans
              i18nKey="onboarding.confirmationModal.description.flow.base"
              values={{ productName, institutionName: partyName }}
              components={{ 1: <strong />, 3: <strong /> }}
            >
              {`Stai inviando una richiesta di adesione al prodotto <1>{{productName}}</1> per l’ente <3>{{institutionName}}</3>. <5 /> L’accordo di adesione arriverà alla PEC istituzionale dell’ente e dovrà essere sottoscritta dal Legale Rappresentante. Assicurati di essere autorizzato come dipendente a effettuare questa richiesta.`}
            </Trans>
          )}
        </Typography>
      }
      onCloseLabel={t('onboarding.confirmationModal.back')}
      onConfirmLabel={t('onboarding.confirmationModal.confirm')}
      onConfirm={onConfirm}
      handleClose={handleClose}
    />
  );
};
