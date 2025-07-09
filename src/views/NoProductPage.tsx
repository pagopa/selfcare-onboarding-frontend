import { useTranslation } from 'react-i18next';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';

export default () => {
  const { t } = useTranslation();
  return (
    <EndingPage
      title={t('noProductPage.title')}
      description={t('noProductPage.description')}
      variantTitle={'h4'}
      variantDescription={'body1'}
    />
  );
};
