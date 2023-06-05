import { AxiosError, AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { IllusError } from '@pagopa/mui-italia';
import {
  InstitutionOnboardingInfoResource,
  InstitutionType,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../types';
import { MessageNoAction } from '../MessageNoAction';
import { HeaderContext, UserContext } from '../../lib/context';
import { LoadingOverlay } from '../LoadingOverlay';
import { fetchWithLogs } from '../../lib/api-utils';
import { getFetchOutcome } from '../../lib/error-utils';
import { unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { ENV } from '../../utils/env';

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  productId: string;
  institutionType?: InstitutionType;
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
        title={<Trans i18nKey="onboardingStep1_5.genericError.title" />}
        description={
          <Trans i18nKey="onboardingStep1_5.genericError.description">
            A causa di un errore del sistema non è possibile completare la procedura.
            <br />
            Ti chiediamo di riprovare più tardi.
          </Trans>
        }
        buttonLabel={<Trans i18nKey="onboardingStep1_5.genericError.backAction" />}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
      ,
    </>,
  ],
};

function StepOnboardingData({ forward, externalInstitutionId, productId, institutionType }: Props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const submit = async () => {
    setLoading(true);

    const onboardingData = await fetchWithLogs(
      {
        endpoint: 'ONBOARDING_GET_ONBOARDING_DATA',
        endpointParams: {
          externalInstitutionId,
          productId,
        },
      },
      { method: 'GET' },
      () => setRequiredLogin(true)
    );

    const restOutcomeData = getFetchOutcome(onboardingData);
    if (restOutcomeData === 'success') {
      const result = (onboardingData as AxiosResponse).data as InstitutionOnboardingInfoResource;
      forward(
        result.institution.billingData,
        result.institution.institutionType ? result.institution.institutionType : institutionType,
        result.institution.id,
        result.institution.assistanceContacts,
        result.institution.companyInformations
      );
    } else if (
      (onboardingData as AxiosError<any>).response?.status === 404 ||
      (onboardingData as AxiosError<any>).response?.status === 400
    ) {
      forward(undefined, institutionType, undefined);
    } else {
      setOutcome(genericError);
    }
    setLoading(false);
  };

  useEffect(() => {
    void submit();
  }, []);

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
