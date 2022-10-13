import React, { useEffect, useState, useContext } from 'react';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation } from 'react-i18next';
import { uniqueId } from 'lodash';
import { MessageNoAction } from '../components/MessageNoAction';
import { RequestOutcome, RequestOutcomeOptions } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { HeaderContext, UserContext } from '../lib/context';
import { jwtNotValid } from '../services/tokenServices';
import JwtInvalidPage from './JwtInvalidPage';
import ConfrimCancellationPage from './ConfrimCancellationPage';
import RejectContentSuccessPage from './RejectContentSuccessPage';
import RejectContentErrorPage from './RejectContentErrorPage';

export const getOnboardingMagicLinkJwt = () =>
  new URLSearchParams(window.location.search).get('jwt');

export default function RejectRegistration() {
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const [loading, setLoading] = useState(false);
  const [isConfirmPageVisible, setIsConfirmPageVisible] = useState<boolean>(true);
  const [tokenValid, setTokenValid] = useState<boolean>();

  const token = getOnboardingMagicLinkJwt();
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
        () => setRequiredLogin(true)
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
      jwtNotValid({ token, setRequiredLogin, setTokenValid }).finally(() => setLoading(false));
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
        <ConfrimCancellationPage
          setIsConfirmPageVisible={setIsConfirmPageVisible}
          deleteRequest={deleteRequest}
        />
      </>,
    ],
  };

  const outcomeContent: RequestOutcomeOptions = {
    success: {
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
          <RejectContentErrorPage />
        </>,
      ],
    },
  };

  const jwtNotValidPage = {
    title: '',
    description: [
      <>
        <JwtInvalidPage />
      </>,
    ],
  };

  if (loading) {
    return (
      <LoadingOverlay loadingText={t('rejectRegistration.outcomeContent.notOutcome.loadingText')} />
    );
  }

  return (
    <React.Fragment>
      {tokenValid ? (
        isConfirmPageVisible ? (
          <MessageNoAction {...confirmCancellationContent} />
        ) : !outcome ? (
          <LoadingOverlay
            loadingText={t('rejectRegistration.outcomeContent.notOutcome.loadingText')}
          />
        ) : (
          <MessageNoAction {...outcomeContent[outcome]} />
        )
      ) : (
        <MessageNoAction {...jwtNotValidPage} />
      )}
    </React.Fragment>
  );
}
