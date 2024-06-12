import { IllusCompleted } from '@pagopa/mui-italia';
import { Trans, useTranslation } from 'react-i18next';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { ENV } from '../../../../utils/env';

export default function CompleteRequestSuccessPage() {
  const { t } = useTranslation();

  return (
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusCompleted size={60} />}
        variantTitle="h4"
        variantDescription="body1"
        title={t('completeRegistration.flow.product.title')}
        description={
          <Trans
            i18nKey="completeRegistration.outcomeContent.success.description"
            components={{ 1: <br />, 3: <br />, 5: <br /> }}
          >
            {`Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento, gli Amministratori <3/> inseriti in fase di richiesta possono accedere all'Area <5 />Riservata.`}
          </Trans>
        }
        buttonLabel={t('completeRegistration.onboarding.backHome')}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>
  );
}
