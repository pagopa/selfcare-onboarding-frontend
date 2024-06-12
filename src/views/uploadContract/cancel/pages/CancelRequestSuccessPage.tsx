import { IllusCompleted } from '@pagopa/mui-italia';
import { Trans, useTranslation } from 'react-i18next';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { ENV } from '../../../../utils/env';

export default function CancelRequestSuccessPage() {
  const { t } = useTranslation();

  return (
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusCompleted size={60} />}
        variantTitle="h4"
        variantDescription="body1"
        title={t('rejectRegistration.flow.product.title')}
        description={
          <Trans i18nKey="rejectRegistration.outcomeContent.success.description">
            Nella home dell’Area Riservata puoi vedere i prodotti
            <br />
            disponibili e richiedere l’adesione per il tuo ente.
          </Trans>
        }
        buttonLabel={t('rejectRegistration.outcomeContent.success.backActionLabel')}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>
  );
}
