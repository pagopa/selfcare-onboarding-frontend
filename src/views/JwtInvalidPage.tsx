import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { useTranslation, Trans } from 'react-i18next';
import { ENV } from '../utils/env';

export default function JwtInvalidPage() {
  const { t } = useTranslation();
  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={
        <Trans i18nKey="completeRegistration.jwtNotValid.title">
          Richiesta di adesione non più <br /> valida
        </Trans>
      }
      description={t('completeRegistration.jwtNotValid.subtitle')}
      variantTitle={'h4'}
      variantDescription={'body1'}
      buttonLabel={t('completeRegistration.jwtNotValid.backHome')}
      onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
    />
  );
}
