import { Link } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { ENV } from '../utils/env';

type Props = {
  partyName?: string;
  productTitle?: string;
};

export default function UserNotAllowedPage({ partyName, productTitle }: Props) {
  const { t } = useTranslation();

  return (
    <EndingPage
      minHeight="52vh"
      icon={<IllusError size={60} />}
      title={<Trans i18nKey="onboardingStep1_5.userNotAllowedError.title" />}
      description={
        <Trans i18nKey="onboardingStep1_5.userNotAllowedError.description">
          Al momento, l’ente
          {{
            partyName: partyName ?? t('onboardingStep1_5.userNotAllowedError.noSelectedParty'),
          }}
          non può aderire a {{ productTitle }}. <br /> Per maggiori dettagli contatta
          <Link
            sx={{ cursor: 'pointer', textDecoration: 'none' }}
            href={ENV.ASSISTANCE.ENABLE ? ENV.URL_FE.ASSISTANCE : ''}
          >
            &nbsp;l&apos;assistenza.
          </Link>
        </Trans>
      }
      variantTitle={'h4'}
      variantDescription={'body1'}
      buttonLabel={<Trans i18nKey="onboardingStep1_5.userNotAllowedError.backToHome" />}
      onButtonClick={() => window.location.assign(ENV.URL_FE.DASHBOARD)}
    />
  );
}
