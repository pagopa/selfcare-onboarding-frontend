import { IllusError } from '@pagopa/mui-italia';
import EndingPage from '@pagopa/selfcare-common-frontend/components/EndingPage';
import { useTranslation, Trans } from 'react-i18next';
import { ENV } from '../../../utils/env';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      variantTitle={'h4'}
      variantDescription={'body1'}
      title={t('completeRegistration.request.notFound.title')}
      description={
        <Trans
          i18nKey="completeRegistration.request.notFound.description"
          components={{ 1: <br /> }}
        >
          {
            'Al momento non è possibile procedere. Riprova tra qualche <1 />minuto, o contatta l’assistenza'
          }
        </Trans>
      }
      buttonLabel={t('completeRegistration.request.notFound.contactAssistanceButton')}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
    />
  );
}
