import { SessionModal } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../utils/env';

type ErrorModalProps = {
  openVatNumberErrorModal: boolean;
  setOpenVatNumberErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ErrorModalVatNumber = ({
  openVatNumberErrorModal,
  setOpenVatNumberErrorModal,
}: ErrorModalProps) => {
  const { t } = useTranslation();
  return (
    <SessionModal
      open={openVatNumberErrorModal}
      title={t('onboardingFormData.billingDataSection.vatNumberVerificationErrorTitle')}
      message={t('onboardingFormData.billingDataSection.vatNumberVerificationErrorDescription')}
      onCloseLabel={t('onboardingFormData.backLabel')}
      onConfirmLabel={t('onboardingFormData.closeBtnLabel')}
      onConfirm={() => window.location.assign(ENV.URL_FE.DASHBOARD)}
      handleClose={() => setOpenVatNumberErrorModal(false)}
    ></SessionModal>
  );
};
