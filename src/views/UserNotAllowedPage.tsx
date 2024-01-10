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
        <Trans
          i18nKey="onboardingStep1_5.userNotAllowedError.description"
          values={{
            productTitle,
            partyName: partyName ?? t('onboardingStep1_5.userNotAllowedError.noSelectedParty'),
          }}
          components={{
            7: (
              <Link
                sx={{ cursor: 'pointer', textDecoration: 'none' }}
                href={ENV.ASSISTANCE.ENABLE ? ENV.URL_FE.ASSISTANCE : ''}
              />
            ),
          }}
        >
          {`Al momento, l'ente <1>{{partyName}}</1> non può aderire a <3>{{productTitle}}</3>. <5 /> Per maggiori dettagli contatta <7>l'assistenza</7>.`}
        </Trans>
      }
      variantTitle={'h4'}
      variantDescription={'body1'}
      buttonLabel={<Trans i18nKey="onboardingStep1_5.userNotAllowedError.backToHome" />}
      onButtonClick={() => window.location.assign(ENV.URL_FE.DASHBOARD)}
    />
  );
}
