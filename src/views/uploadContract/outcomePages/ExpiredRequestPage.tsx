import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { useTranslation, Trans } from 'react-i18next';
import { ENV } from '../../../utils/env';

type Props = {
  translationKeyValue: string;
  productTitle: string;
};

export default function ExpiredRequestPage({ productTitle, translationKeyValue }: Props) {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={t(`completeRegistration.request.expired.${translationKeyValue}.title`)}
      description={
        <Trans
          i18nKey={`completeRegistration.request.expired.${translationKeyValue}.description`}
          components={{ 2: <br />, 4: <br /> }}
          values={{ productTitle }}
        >
          {translationKeyValue === 'user'
            ? `Sono trascorsi oltre 30 giorni dalla richiesta di aggiunta di <2 />un Amministratore. Per procedere, invia una nuova <2 /> richiesta.`
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
