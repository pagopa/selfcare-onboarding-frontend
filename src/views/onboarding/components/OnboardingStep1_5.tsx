/* eslint-disable sonarjs/cognitive-complexity */
import { AxiosError } from 'axios';
import { useEffect, useState, useContext, useRef } from 'react';
import { Link } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { IllusError } from '@pagopa/mui-italia';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { uniqueId } from 'lodash';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import {
  Party,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../../types';
import { fetchWithLogs } from '../../../lib/api-utils';
import { ENV } from '../../../utils/env';
import { getFetchOutcome } from '../../../lib/error-utils';
import { HeaderContext, UserContext } from '../../../lib/context';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { MessageNoAction } from '../../../components/MessageNoAction';

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  productId: string;
  selectedProduct?: Product | null;
  selectedParty?: Party;
};

const alreadyOnboarded: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        variantTitle={'h4'}
        variantDescription={'body1'}
        title={<Trans i18nKey="onboardingStep1_5.alreadyOnboarded.title" />}
        description={<Trans i18nKey="onboardingStep1_5.alreadyOnboarded.description" />}
        buttonLabel={<Trans i18nKey="onboardingStep1_5.alreadyOnboarded.backAction" />}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
};

export const genericError: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusError size={60} />}
        title={<Trans i18nKey="onboardingStep1_5.genericError.title" />}
        description={
          <Trans i18nKey="onboardingStep1_5.genericError.description">
            A causa di un errore del sistema non è possibile completare la procedura.
            <br />
            Ti chiediamo di riprovare più tardi.
          </Trans>
        }
        variantTitle={'h4'}
        variantDescription={'body1'}
        buttonLabel={<Trans i18nKey="onboardingStep1_5.genericError.backAction" />}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
};

export function OnboardingStep1_5({
  forward,
  externalInstitutionId,
  productId,
  selectedProduct,
  selectedParty,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<RequestOutcomeMessage | null>();
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const { t } = useTranslation();

  const notAllowedErrorNoParty: RequestOutcomeMessage = {
    title: '',
    description: [
      <>
        <EndingPage
          minHeight="52vh"
          icon={<IllusError size={60} />}
          title={<Trans i18nKey="onboarding.userNotAllowedError.titleNoParty" />}
          description={
            <Trans i18nKey="onboardingStep1_5.userNotAllowedError.descriptionNoParty">
              Al momento l&apos;ente indicato non può aderire a{' '}
              {{ productName: selectedProduct?.title }}. <br /> Per maggiori dettagli contatta
              <Link
                sx={{ cursro: 'pointer', textDecoration: 'none' }}
                href={ENV.ASSISTANCE.ENABLE ? ENV.URL_FE.ASSISTANCE : ''}
              >
                &nbsp;l&apos;assistenza
              </Link>
            </Trans>
          }
          variantTitle={'h4'}
          variantDescription={'body1'}
          buttonLabel={<Trans i18nKey="onboarding.userNotAllowedError.backActionNoParty" />}
          onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
        />
      </>,
    ],
  };

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = uniqueId(
      `onboarding-verify-onboarding${externalInstitutionId}-${productId}-`
    );
  }, [productId]);

  const submit = async () => {
    setLoading(true);

    const onboardingStatus = await fetchWithLogs(
      { endpoint: 'VERIFY_ONBOARDING', endpointParams: { externalInstitutionId, productId } },
      { method: 'HEAD' },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const restOutcome = getFetchOutcome(onboardingStatus);
    if (restOutcome === 'success') {
      trackEvent('ONBOARDING_PRODUCT_ALREADY_SUBSCRIBED', {
        request_id: requestIdRef.current,
        party_id: selectedParty?.externalId,
        product_id: selectedProduct?.id,
      });
      setOutcome(alreadyOnboarded);
    } else {
      if (
        (onboardingStatus as AxiosError<any>).response?.status === 404 ||
        (onboardingStatus as AxiosError<any>).response?.status === 400
      ) {
        setOutcome(null);
        onForwardAction();
      } else if ((onboardingStatus as AxiosError<any>).response?.status === 403) {
        trackEvent('ONBOARDING_NOT_ALLOWED_ERROR', {
          request_id: requestIdRef.current,
          party_id: externalInstitutionId,
          product_id: productId,
        });
        setOutcome(notAllowedErrorNoParty);
      } else {
        setOutcome(genericError);
      }
    }
  };

  useEffect(() => {
    void submit();
  }, []);

  const onForwardAction = () => {
    forward();
  };

  if (outcome) {
    unregisterUnloadEvent(setOnExit);
  }
  return loading ? (
    <LoadingOverlay loadingText={t('onboardingStep1_5.loadingText')} />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default OnboardingStep1_5;
