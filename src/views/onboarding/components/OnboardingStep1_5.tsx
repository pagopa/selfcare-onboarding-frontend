import { AxiosError } from 'axios';
import { useEffect, useState, useContext, useRef } from 'react';
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
import UserNotAllowedPage from '../../UserNotAllowedPage';
import { AooData } from '../../../model/AooData';
import { UoData } from '../../../model/UoModel';

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  productId: string;
  selectedProduct?: Product | null;
  selectedParty?: Party;
  aooSelected?: AooData;
  uoSelected?: UoData;
};

const alreadyOnboarded: RequestOutcomeMessage = {
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        variantTitle={'h4'}
        variantDescription={'body1'}
        icon={<IllusError size={60} />}
        title={<Trans i18nKey="onboardingStep1_5.alreadyOnboarded.title" />}
        description={
          <Trans
            i18nKey="onboardingStep1_5.alreadyOnboarded.description"
            components={{ 1: <br /> }}
          >
            {
              'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.'
            }
          </Trans>
        }
        buttonLabel={<Trans i18nKey="onboardingStep1_5.alreadyOnboarded.backHome" />}
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

// eslint-disable-next-line sonarjs/cognitive-complexity
export function OnboardingStep1_5({
  forward,
  externalInstitutionId,
  productId,
  selectedProduct,
  selectedParty,
  aooSelected,
  uoSelected,
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
          partyName={selectedParty?.description}
          productTitle={selectedProduct?.title}
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
          taxCode: selectedParty?.taxCode,
          productId,
          subunitCode: aooSelected
            ? aooSelected.codiceUniAoo
            : uoSelected
            ? uoSelected.codiceUniUo
            : undefined,
          origin: selectedParty?.origin,
          originId: selectedParty?.originId,
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
