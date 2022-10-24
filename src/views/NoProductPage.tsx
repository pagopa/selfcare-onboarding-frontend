import { useTranslation } from 'react-i18next';
import { StyledIntro } from '../components/StyledIntro';

export default () => {
  const { t } = useTranslation();
  return (
    <StyledIntro>
      {{
        title: t('noProductPage.title'),
        description: <>{t('noProductPage.description')}</>,
      }}
    </StyledIntro>
  );
};
