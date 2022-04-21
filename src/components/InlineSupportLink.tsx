import { useTranslation } from 'react-i18next';

export function InlineSupportLink() {
  const { t } = useTranslation();
  return (
    <a className="link-default" href="#0" title="Contatta l'assistenza">
      {t('inlineSupportLink.assistanceLink')}
    </a>
  );
}
