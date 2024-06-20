import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { useTranslation, Trans } from 'react-i18next';
import { ENV } from '../../../utils/env';

type Props = {
  productTitle: string;
  translationKeyValue: string;
};

export default function AlreadyRejectedPage({ productTitle, translationKeyValue }: Props) {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={t(`completeRegistration.request.alreadyRejected.${translationKeyValue}.title`)}
      description={
        <Trans
          i18nKey={`completeRegistration.request.alreadyRejected.${translationKeyValue}.description`}
          components={{ 2: <br />, 4: <br /> }}
          values={{ productTitle }}
        >
          {translationKeyValue === 'user'
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
