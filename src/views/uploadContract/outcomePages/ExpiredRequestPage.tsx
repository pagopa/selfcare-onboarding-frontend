import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { useTranslation, Trans } from 'react-i18next';
import { ENV } from '../../../utils/env';

type Props = {
  addUserFlow: boolean;
  productTitle: string;
};

export default function ExpiredRequestPage({ productTitle, addUserFlow }: Props) {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={
        addUserFlow
          ? t('completeRegistration.request.expired.user.title')
          : t('completeRegistration.request.expired.product.title')
      }
      description={
        <Trans
          i18nKey={
            addUserFlow
              ? 'completeRegistration.request.expired.user.description'
              : 'completeRegistration.request.expired.product.description'
          }
          components={{ 2: <br />, 4: <br /> }}
          values={{ productTitle }}
        >
          {addUserFlow
            ? `Sono trascorsi oltre 30 giorni dalla richiesta di aggiunta di un Amministratore. Per procedere, invia una nuova <2 /> richiesta.`
            : `Sono trascorsi oltre 30 giorni dalla richiesta di adesione. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`}
        </Trans>
      }
      variantTitle={'h4'}
      variantDescription={'body1'}
      buttonLabel={t('completeRegistration.request.expired.backHome')}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
    />
  );
}
