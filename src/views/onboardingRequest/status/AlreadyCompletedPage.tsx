import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { redirectToLogin } from '../../../utils/unloadEvent-utils';

type Props = {
  translationKeyValue: string;
};

export default function AlreadyCompletedPage({ translationKeyValue }: Props) {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={t(`completeRegistration.request.alreadyCompleted.${translationKeyValue}.title`)}
      description={t(`completeRegistration.request.alreadyCompleted.description`)}
      variantTitle={'h4'}
      variantDescription={'body1'}
      buttonLabel={t('completeRegistration.request.alreadyCompleted.logIn')}
      onButtonClick={() => redirectToLogin()}
    />
  );
}
