import { AxiosError } from 'axios';
import { useEffect, useState, useContext, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { IllusError } from '@pagopa/mui-italia';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { uniqueId } from 'lodash';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import {
  InstitutionType,
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
import UserNotAllowedPage from '../../UserNotAllowedPage';
import AlreadyOnboarded from '../../AlreadyOnboarded';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { fiscalCodeRegexp, PRODUCT_IDS } from '../../../utils/constants';

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  productId: string;
  selectedProduct?: Product | null;
  onboardingFormData?: OnboardingFormData;
  institutionType?: InstitutionType;
};

export const genericError: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusError size={60} />}
        title={<Trans i18nKey="stepVerifyOnboarding.genericError.title" />}
        description={
          <Trans i18nKey="stepVerifyOnboarding.genericError.description">
            A causa di un errore del sistema non è possibile completare <br />
            la procedura. Ti chiediamo di riprovare più tardi.
          </Trans>
        }
        variantTitle={'h4'}
        variantDescription={'body1'}
        buttonLabel={<Trans i18nKey="stepVerifyOnboarding.genericError.backHome" />}
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function StepVerifyOnboarding({
  forward,
  externalInstitutionId,
  productId,
  selectedProduct,
  onboardingFormData,
  institutionType,
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
        <UserNotAllowedPage
          partyName={onboardingFormData?.businessName}
          productTitle={selectedProduct?.title}
        />
      </>,
    ],
  };

  const alreadyOnboarded: RequestOutcomeMessage = {
    title: '',
    description: [
      <>
        <AlreadyOnboarded
          institutionType={institutionType}
          onboardingFormData={onboardingFormData}
          selectedProduct={selectedProduct}
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
      {
        endpoint: 'VERIFY_ONBOARDING',
      },
      {
        method: 'HEAD',
        params: {
          taxCode: onboardingFormData?.taxCode,
          productId,
          subunitCode: onboardingFormData?.uoUniqueCode ?? onboardingFormData?.aooUniqueCode,
          origin: onboardingFormData?.origin,
          originId: onboardingFormData?.originId,
        },
      },
      () => setRequiredLogin(true)
    );

    setLoading(false);

    // Check the outcome
    const restOutcome = getFetchOutcome(onboardingStatus);
    if (restOutcome === 'success') {
      trackEvent('ONBOARDING_PRODUCT_ALREADY_SUBSCRIBED', {
        request_id: requestIdRef.current,
        party_id: onboardingFormData?.externalId,
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
    <LoadingOverlay loadingText={t('stepVerifyOnboarding.loadingText')} />
  ) : outcome ? (
    <MessageNoAction {...outcome} />
  ) : (
    <></>
  );
}
export default StepVerifyOnboarding;
