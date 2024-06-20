import { IllusError } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { EndingPage } from '@pagopa/selfcare-common-frontend';

type Props = {
  back: () => void;
};

export function CompleteRequestFailPage({ back }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusError size={60} />}
        variantTitle="h4"
        variantDescription="body1"
        title={t('completeRegistration.error.title')}
        description={t('completeRegistration.error.description')}
        buttonLabel={t('completeRegistration.outcomeContent.error.backToUpload')}
        onButtonClick={back}
      />
    </>
  );
}
