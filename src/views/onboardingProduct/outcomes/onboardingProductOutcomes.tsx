import { IllusCompleted, IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { TFunction } from 'i18next';
import { Trans } from 'react-i18next';
import { InstitutionType, RequestOutcomeMessage, RequestOutcomeOptions } from '../../../../types';
import UserNotAllowedPage from '../../../components/layout/UserNotAllowedPage';
import { ENV } from '../../../utils/env';
import { isPublicAdministration, isTechPartner } from '../../../utils/institutionTypeUtils';

const goToLanding = () => window.location.assign(ENV.URL_FE.LANDING);

const successDescription = (institutionType?: InstitutionType) => {
  if (isTechPartner(institutionType)) {
    return (
      <Trans i18nKey="onboarding.success.flow.techPartner.description" components={{ 1: <br /> }}>
        {`Invieremo un'email con l'esito della richiesta all'indirizzo <1 />PEC indicato.`}
      </Trans>
    );
  }
  if (isPublicAdministration(institutionType)) {
    return (
      <Trans
        i18nKey="onboarding.success.flow.product.publicAdministration.description"
        components={{ 1: <br />, 3: <br /> }}
      >
        {`Invieremo un'email all'indirizzo PEC primario dell'ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l'adesione.`}
      </Trans>
    );
  }
  return (
    <Trans
      i18nKey="onboarding.success.flow.product.notPublicAdministration.description"
      components={{ 1: <br />, 3: <br /> }}
    >
      {`Invieremo un'email all'indirizzo PEC indicato. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l'adesione.`}
    </Trans>
  );
};

export const buildOutcomeContent = (
  institutionType: InstitutionType | undefined,
  t: TFunction
): RequestOutcomeOptions => ({
  success: {
    title: '',
    description: [
      <>
        <EndingPage
          minHeight="52vh"
          icon={<IllusCompleted size={60} />}
          title={
            isTechPartner(institutionType)
              ? t('onboarding.success.flow.techPartner.title')
              : t('onboarding.success.flow.product.title')
          }
          description={successDescription(institutionType)}
          variantTitle={'h4'}
          variantDescription={'body1'}
          buttonLabel={t('onboarding.backHome')}
          onButtonClick={goToLanding}
        />
      </>,
    ],
  },
  error: {
    title: '',
    description: [
      <>
        <EndingPage
          minHeight="52vh"
          icon={<IllusError size={60} />}
          variantTitle={'h4'}
          variantDescription={'body1'}
          title={t('onboarding.error.title')}
          description={
            <Trans i18nKey="onboarding.error.description" components={{ 1: <br /> }}>
              {`A causa di un errore del sistema non è possibile completare <1 />la procedura. Ti chiediamo di riprovare più tardi.`}
            </Trans>
          }
          buttonLabel={t('onboarding.backHome')}
          onButtonClick={goToLanding}
        />
      </>,
    ],
  },
});

export const buildNotAllowedError = (
  partyName?: string,
  productTitle?: string
): RequestOutcomeMessage => ({
  title: '',
  description: [
    <>
      <UserNotAllowedPage partyName={partyName} productTitle={productTitle} />
    </>,
  ],
});
