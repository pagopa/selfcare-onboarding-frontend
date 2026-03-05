import { IllusCompleted } from '@pagopa/mui-italia';
import { Trans, useTranslation } from 'react-i18next';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { Typography, Link } from '@mui/material';
import { ENV } from '../../../../utils/env';

type Props = {
  addUserFlow: boolean;
  translationKeyValue: string;
  institutionId?: string;
};

export default function CompleteRequestSuccessPage({
  addUserFlow,
  translationKeyValue,
  institutionId,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusCompleted size={60} />}
        variantTitle="h4"
        variantDescription="body1"
        title={
          addUserFlow
            ? t('completeRegistration.outcomeContent.success.user.title')
            : translationKeyValue === 'attachments'
              ? t('completeRegistration.outcomeContent.success.attachments.title')
              : t('completeRegistration.outcomeContent.success.product.title')
        }
        description={
          <Trans
            i18nKey={
              addUserFlow
                ? 'completeRegistration.outcomeContent.success.user.description'
                : translationKeyValue === 'attachments'
                  ? 'completeRegistration.outcomeContent.success.attachments.description'
                  : 'completeRegistration.outcomeContent.success.product.description'
            }
            components={{ 1: <br />, 3: <br /> }}
          >
            {addUserFlow
              ? `Da questo momento gli Amministratori indicati possono <1 />accedere all’Area Riservata.`
              : `Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento è possibile <3 />accedere all'Area Riservata.`}
          </Trans>
        }
        buttonLabel={t('completeRegistration.outcomeContent.success.backHome')}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
      {translationKeyValue === 'attachments' && institutionId && (
        <Typography align="center">
          <Link
            component="button"
            variant='sidenav'
            underline='none'
            onClick={() =>
              window.location.assign(`${ENV.URL_FE.DASHBOARD}/${institutionId}/documents`)
            }
          >
            {t('completeRegistration.outcomeContent.success.attachments.link')}
          </Link>
        </Typography>
      )}
    </>
  );
}
