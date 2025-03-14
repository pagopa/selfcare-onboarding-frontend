import { IllusCompleted } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { Trans } from 'react-i18next';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { ENV } from '../../../utils/env';
import { Product } from '../../../../types';

type Props = {
  product: Product;
};

const successfulOutCome = (title: string) => ({
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
          <Trans
            i18nKey="onboardingSubProduct.successfulAdhesion.message"
            components={{ 1: <strong />, 3: <br /> }}
            values={{ title }}
          >
            {`"Riceverai una PEC all’indirizzo istituzionale dell’ente.<3 />Al suo interno troverai le istruzioni per completare la <3 /> sottoscrizione all'offerta <1>{{title}}</1>."`}
          </Trans>
        }
        buttonLabel={
          <Trans i18nKey="onboardingSubProduct.successfulAdhesion.closeButton"> Chiudi </Trans>
        }
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
});

function SubProductStepSuccess({ product }: Props) {
  return <MessageNoAction {...successfulOutCome(product.title)} />;
}
export default SubProductStepSuccess;
