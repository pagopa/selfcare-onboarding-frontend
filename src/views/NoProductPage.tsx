import { useTranslation } from 'react-i18next';
import { StyledIntro } from '../components/StyledIntro';

export default () => {
  const { t } = useTranslation();
  return (
    <StyledIntro priority={2}>
      {{
        title: t('noProductPage.title'),
        description: <>{t('noProductPage.description')}</>,
      }}
    </StyledIntro>
  );
};
