import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation();
  return (
    <EndingPage
      title={t('noProductPage.title')}
      description={t('noProductPage.description')}
      variantTitle={'h4'}
      variantDescription={'body1'}
    ></EndingPage>
  );
};
