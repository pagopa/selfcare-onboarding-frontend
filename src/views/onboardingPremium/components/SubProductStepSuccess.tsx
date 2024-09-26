import { IllusCompleted } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { Trans } from 'react-i18next';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { ENV } from '../../../utils/env';

const successfulOutCome = {
  title: '',
  description: [
    <>
      <EndingPage
        icon={<IllusCompleted size={60} />}
        variantTitle="h4"
        variantDescription="body1"
        title={
          <Trans i18nKey="onboardingSubProduct.successfulAdhesion.title">
            La richiesta di adesione è stata
            <br />
            inviata con successo
          </Trans>
        }
        description={
          <Trans i18nKey="onboardingSubProduct.successfulAdhesion.message">
            Riceverai una PEC all’indirizzo istituzionale dell&apos;ente.
            <br />
            Al suo interno troverai le istruzioni per completare la
            <br />
            sottoscrizione all&apos;offerta <strong>Premium</strong>.
          </Trans>
        }
        buttonLabel={
          <Trans i18nKey="onboardingSubProduct.successfulAdhesion.closeButton"> Chiudi </Trans>
        }
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
};

function SubProductStepSuccess() {
  return <MessageNoAction {...successfulOutCome} />;
}
export default SubProductStepSuccess;
