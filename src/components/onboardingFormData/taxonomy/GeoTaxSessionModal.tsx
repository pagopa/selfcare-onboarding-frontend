import { SessionModal } from '@pagopa/selfcare-common-frontend';
import { useTranslation, Trans } from 'react-i18next';

type Props = {
  openModifyModal: boolean;
  openAddModal: boolean;
  onForwardAction: () => void;
  handleClose: () => void;
};

export default function GeoTaxSessionModal({
  openModifyModal,
  openAddModal,
  onForwardAction,
  handleClose,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <SessionModal
        open={openModifyModal}
        title={t('onboardingFormData.taxonomySection.modal.modifyModal.title')}
        message={
          <Trans i18nKey="onboardingFormData.taxonomySection.modal.modifyModal.descroption">
            La modifica verrà applicata a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi
            continuare?
          </Trans>
        }
        onConfirmLabel={t('onboardingFormData.taxonomySection.modal.modifyModal.confirmButton')}
        onCloseLabel={t('onboardingFormData.taxonomySection.modal.modifyModal.backButton')}
        onConfirm={onForwardAction}
        handleClose={handleClose}
      />

      <SessionModal
        open={openAddModal}
        title={t('onboardingFormData.taxonomySection.modal.addModal.title')}
        message={
          <Trans i18nKey="onboardingFormData.taxonomySection.modal.addModal.descroption">
            Le aree geografiche verrano aggiunte a tutti i prodotti PagoPA a cui l’ente ha già
            aderito. Vuoi continuare?
          </Trans>
        }
        onConfirmLabel={t('onboardingFormData.taxonomySection.modal.addModal.confirmButton')}
        onCloseLabel={t('onboardingFormData.taxonomySection.modal.addModal.backButton')}
        onConfirm={onForwardAction}
        handleClose={handleClose}
      />
    </>
  );
}
