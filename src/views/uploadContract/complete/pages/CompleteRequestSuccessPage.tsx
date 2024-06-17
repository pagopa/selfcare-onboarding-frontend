import { IllusCompleted } from '@pagopa/mui-italia';
import { Trans, useTranslation } from 'react-i18next';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { ENV } from '../../../../utils/env';

type Props = {
  addUserFlow: boolean;
};

export default function CompleteRequestSuccessPage({ addUserFlow }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusCompleted size={60} />}
        variantTitle="h4"
        variantDescription="body1"
        title={
          addUserFlow
            ? t('completeRegistration.outcomeContent.success.user.title')
            : t('completeRegistration.outcomeContent.success.product.title')
        }
        description={
          <Trans
            i18nKey={
              addUserFlow
                ? 'completeRegistration.outcomeContent.success.user.description'
                : 'completeRegistration.outcomeContent.success.product.description'
            }
            components={{ 1: <br />, 3: <br /> }}
          >
            {addUserFlow
              ? `Da questo momento gli Amministratori indicati possono <1 />accedere all’Area Riservata.`
              : `Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento è possibile <3 />accedere all'Area Riservata.`}
          </Trans>
        }
        buttonLabel={t('completeRegistration.onboarding.backHome')}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>
  );
}
