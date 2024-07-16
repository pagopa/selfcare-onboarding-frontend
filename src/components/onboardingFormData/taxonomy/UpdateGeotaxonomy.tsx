import { SessionModal } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation, Trans } from 'react-i18next';

type Props = {
  geotaxonomy: { add: boolean; edit: boolean };
  onForwardAction: () => void;
  handleClose: () => void;
};

export default function UpdateGeotaxonomy({ geotaxonomy, onForwardAction, handleClose }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <SessionModal
        open={geotaxonomy.edit}
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
        open={geotaxonomy.add}
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
