import React, { useEffect, useState, useContext } from 'react';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import { uniqueId } from 'lodash';
import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { IllusError } from '@pagopa/mui-italia';
import { MessageNoAction } from '../components/MessageNoAction';
import { RequestOutcomeJwt, RequestOutcomeOptionsJwt } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { HeaderContext, UserContext } from '../lib/context';
import { jwtNotValid } from '../services/tokenServices';
import { ENV } from '../utils/env';
import JwtInvalidPage from './JwtInvalidPage';
import ConfirmCancellationPage from './ConfirmCancellationPage';
import RejectContentSuccessPage from './RejectContentSuccessPage';

export const getOnboardingMagicLinkJwt = () =>
  new URLSearchParams(window.location.search).get('jwt');

export default function RejectRegistration() {
  const token = getOnboardingMagicLinkJwt();
  const [outcome, setOutcome] = useState<RequestOutcomeJwt | null>(!token ? 'error' : null);
  const [loading, setLoading] = useState(false);
  const [isConfirmPageVisible, setIsConfirmPageVisible] = useState<boolean>(true);

  const { setSubHeaderVisible, setOnExit, setEnableLogin } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const { t } = useTranslation();

  const deleteRequest = () => {
    const requestId = uniqueId('contract-reject-');
    async function asyncSendDeleteRequest() {
      // Send DELETE request
      const contractPostResponse = await fetchWithLogs(
        { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
        { method: 'DELETE' },
        () => {
          const onSuccessEncoded = encodeURIComponent(location.pathname + location.search);
          window.location.assign(`${ENV.URL_FE.LOGIN}?onSuccess=${onSuccessEncoded}`);
        }
      );

      // Check the outcome
      const outcome = getFetchOutcome(contractPostResponse);

      // Show it to the end user
      setLoading(false);
      setOutcome(outcome);
      if (outcome === 'success') {
        trackEvent('ONBOARDING_CANCEL_SUCCESS', { request_id: requestId, party_id: token });
      } else if (outcome === 'error') {
        trackEvent('ONBOARDING_CANCEL_FAILURE', { request_id: requestId, party_id: token });
      }
    }

    if (!token) {
      setLoading(false);
      setOutcome('error');
    } else {
      void asyncSendDeleteRequest();
    }
  };

  useEffect(() => {
    if (!token) {
      setOutcome('error');
    } else {
      setLoading(true);
      jwtNotValid({ token, setRequiredLogin, setOutcome }).finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    setSubHeaderVisible(true);
    setEnableLogin(false);
    return () => {
      setSubHeaderVisible(true);
      setOnExit(undefined);
      setEnableLogin(true);
    };
  }, []);

  const confirmCancellationContent = {
    title: '',
    description: [
      <>
        <ConfirmCancellationPage
          setIsConfirmPageVisible={setIsConfirmPageVisible}
          deleteRequest={deleteRequest}
        />
      </>,
    ],
  };

  const outcomeContent: RequestOutcomeOptionsJwt = {
    success: {
      title: '',
      description: [
        <>
          <RejectContentSuccessPage />
        </>,
      ],
    },
    jwtsuccess: {
      title: '',
      description: [
        <>
          <RejectContentSuccessPage />
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
            title={t('rejectRegistration.outcomeContent.error.title')}
            description={
              <Trans i18nKey="rejectRegistration.outcomeContent.error.description">
                A causa di un errore del sistema non è possibile completare la procedura.
                <br />
                Ti chiediamo di riprovare più tardi.
              </Trans>
            }
            buttonLabel={t('rejectRegistration.outcomeContent.error.backActionLabel')}
            onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
          />
        </>,
      ],
    },
    jwterror: {
      title: '',
      description: [
        <>
          <JwtInvalidPage />
        </>,
      ],
    },
  };

  if (loading) {
    return (
      <LoadingOverlay loadingText={t('rejectRegistration.outcomeContent.notOutcome.loadingText')} />
    );
  }

  return (
    <React.Fragment>
      {outcome === 'jwtsuccess' ? (
        isConfirmPageVisible ? (
          <MessageNoAction {...confirmCancellationContent} />
        ) : (
          <MessageNoAction {...outcomeContent[outcome]} />
        )
      ) : outcome === 'jwterror' ? (
        <MessageNoAction {...outcomeContent[outcome]} />
      ) : !outcome ? (
        <LoadingOverlay
          loadingText={t('rejectRegistration.outcomeContent.notOutcome.loadingText')}
        />
      ) : (
        <MessageNoAction {...outcomeContent[outcome]} />
      )}
    </React.Fragment>
  );
}
