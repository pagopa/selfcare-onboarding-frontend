import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../../utils/env';

export default function AlreadyCompletedRequestPage() {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={t('completeRegistration.request.alreadyCompleted.title')}
      description={t('completeRegistration.request.alreadyCompleted.description')}
      variantTitle={'h4'}
      variantDescription={'body1'}
      buttonLabel={t('completeRegistration.request.alreadyCompleted.logIn')}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LOGIN)}
    />
  );
}
