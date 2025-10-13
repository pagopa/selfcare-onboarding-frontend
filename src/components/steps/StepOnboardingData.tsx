import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  InstitutionType,
  RequestOutcomeMessage,
  StepperStepComponentProps
} from '../../../types';
import { HeaderContext, UserContext } from '../../lib/context';
import { submit } from '../../services/onboardingServices';
import { ENV } from '../../utils/env';
import { unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { LoadingOverlay } from '../LoadingOverlay';
import { MessageNoAction } from '../MessageNoAction';

type Props = StepperStepComponentProps & {
  productId: string;
  partyId?: string;
  institutionType?: InstitutionType;
  subProductFlow?: boolean;
};

const genericError: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusError size={60} />}
        variantTitle={'h4'}
        variantDescription={'body1'}
        title={<Trans i18nKey="stepVerifyOnboarding.genericError.title" />}
        description={
          <Trans i18nKey="stepVerifyOnboarding.genericError.description">
            A causa di un errore del sistema non è possibile completare la procedura.
            <br />
            Ti chiediamo di riprovare più tardi.
          </Trans>
        }
        buttonLabel={<Trans i18nKey="stepVerifyOnboarding.genericError.backHome" />}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
      ,
    </>,
  ],
};

function StepOnboardingData({
  forward,
  partyId,
  productId,
  institutionType,
  subProductFlow,
}: Props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  useEffect(() => {
    if (subProductFlow) {
      void submit(
        setLoading,
        setRequiredLogin,
        productId,
        forward,
        institutionType,
        setOutcome,
        genericError,
        partyId
      );
    } else {
      forward(undefined, institutionType, undefined);
      setLoading(false);
    }
  }, [productId]);

  if (outcome) {
    unregisterUnloadEvent(setOnExit);
  }
  return loading ? (
    <LoadingOverlay loadingText={t('onboarding.loading.loadingText')} />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default StepOnboardingData;
