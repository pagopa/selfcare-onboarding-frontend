import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { useTranslation, Trans } from 'react-i18next';
import { ENV } from '../../../utils/env';

type Props = {
  productTitle: string;
  addUserFlow: boolean;
};

export default function AlreadyRejectedRequestPage({ productTitle, addUserFlow }: Props) {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={
        addUserFlow
          ? t('completeRegistration.request.alreadyRejected.user.title')
          : t('completeRegistration.request.alreadyRejected.product.title')
      }
      description={
        <Trans
          i18nKey={
            addUserFlow
              ? 'completeRegistration.request.alreadyRejected.user.description'
              : 'completeRegistration.request.alreadyRejected.product.description'
          }
          components={{ 2: <br />, 4: <br /> }}
          values={{ productTitle }}
        >
          {addUserFlow
            ? `Il tuo ente ha annullato la richiesta. Per aggiungere un <2 />nuovo Amministratore, inviane una nuova.`
            : `La richiesta di adesione non è andata a buon fine. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`}
        </Trans>
      }
      variantTitle={'h4'}
      variantDescription={'body1'}
      buttonLabel={t('completeRegistration.request.alreadyRejected.backHome')}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
    />
  );
}
