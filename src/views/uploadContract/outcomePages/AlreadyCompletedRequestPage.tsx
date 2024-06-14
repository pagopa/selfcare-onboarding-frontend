import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { ENV } from '../../../utils/env';

type Props = {
  translationKeyValue: string;
};

export default function AlreadyCompletedRequestPage({ translationKeyValue }: Props) {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={t(`completeRegistration.request.alreadyCompleted.${translationKeyValue}.title`)}
      description={t(
        `completeRegistration.request.alreadyCompleted.${translationKeyValue}.description`
      )}
      variantTitle={'h4'}
      variantDescription={'body1'}
      buttonLabel={t('completeRegistration.request.alreadyCompleted.logIn')}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LOGIN)}
    />
  );
}
