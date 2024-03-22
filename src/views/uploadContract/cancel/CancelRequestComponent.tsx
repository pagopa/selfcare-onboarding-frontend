import { useEffect, useState, useContext } from 'react';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation } from 'react-i18next';
import { uniqueId } from 'lodash';
import { productId2ProductTitle } from '@pagopa/selfcare-common-frontend/utils/productId2ProductTitle';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { OnboardingRequestData, RequestOutcomeComplete } from '../../../../types';
import { fetchWithLogs } from '../../../lib/api-utils';
import { LoadingOverlay } from '../../../components/LoadingOverlay';
import { HeaderContext, UserContext } from '../../../lib/context';
import { verifyRequest } from '../../../services/tokenServices';
import { redirectToLogin } from '../../../utils/unloadEvent-utils';
import NotFoundPage from '../outcomePages/NotFoundPage';
import AlreadyCompletedRequestPage from '../outcomePages/AlreadyCompletedRequestPage';
import AlreadyRejectedRequestPage from '../outcomePages/AlreadyRejectedRequestPage';
import ExpiredRequestPage from '../outcomePages/ExpiredRequestPage';
import { getRequestJwt } from '../../../utils/getRequestJwt';
import CancelRequestSuccessPage from '../cancel/pages/CancelRequestSuccessPage';
import { getFetchOutcome } from '../../../lib/error-utils';
import CancelRequestPage from './pages/CancelRequestPage';

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function CancelRequestComponent() {
  const { t } = useTranslation();
  const { setSubHeaderVisible, setOnExit, setEnableLogin } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const token = getRequestJwt();
  const [outcomeContentState, setOutcomeContentState] = useState<RequestOutcomeComplete | null>(
    !token ? 'notFound' : null
  );
  const [loading, setLoading] = useState(false);
  const [requestData, setRequestData] = useState<OnboardingRequestData | undefined>();
  const [requestType, setRequestType] = useState<'verify' | 'delete'>();

  useEffect(() => {
    setSubHeaderVisible(true);
    setEnableLogin(false);
    return () => {
      setSubHeaderVisible(true);
      setOnExit(undefined);
      setEnableLogin(true);
    };
  }, []);

  const handleVerifyRequest = async (token: string) => {
    setRequestType('verify');
    setLoading(true);
    await verifyRequest({
      token,
      setRequiredLogin,
      setOutcomeContentState,
      setRequestData,
    }).finally(() => setLoading(false));
    setRequestType(undefined);
  };

  useEffect(() => {
    if (!token) {
      setOutcomeContentState('notFound');
    } else {
      void handleVerifyRequest(token);
    }
  }, []);

  const deleteRequest = () => {
    const requestId = uniqueId('contract-reject-');
    setRequestType('delete');
    async function asyncSendDeleteRequest() {
      // Send DELETE request
      const deleteOnboardingResponse = await fetchWithLogs(
        { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
        { method: 'DELETE' },
        redirectToLogin
      );

      const response = getFetchOutcome(deleteOnboardingResponse);

      if (response === 'success') {
        trackEvent('ONBOARDING_CANCEL_SUCCESS', { request_id: requestId, party_id: token });
        setOutcomeContentState(response);
      } else {
        trackEvent('ONBOARDING_CANCEL_FAILURE', { request_id: requestId, party_id: token });
        setOutcomeContentState(response);
      }
      setLoading(false);
      setRequestType(undefined);
    }

    if (!token) {
      setLoading(false);
      setOutcomeContentState('notFound');
    } else {
      void asyncSendDeleteRequest();
    }
  };

  const outcomeContent = {
    success: {
      title: '',
      description: [
        <>
          <CancelRequestSuccessPage />
        </>,
      ],
    },
    error: {
      title: '',
      description: [
        <>
          <NotFoundPage />
        </>,
      ],
    },
    toBeCompleted: {
      title: '',
      description: [
        <>
          <CancelRequestPage deleteRequest={deleteRequest} />
        </>,
      ],
    },
    alreadyCompleted: {
      title: '',
      description: [
        <>
          <AlreadyCompletedRequestPage />
        </>,
      ],
    },
    alreadyRejected: {
      title: '',
      description: [
        <>
          <AlreadyRejectedRequestPage
            productTitle={productId2ProductTitle(requestData?.productId ?? '')}
          />
        </>,
      ],
    },
    expired: {
      title: '',
      description: [
        <>
          <ExpiredRequestPage productTitle={productId2ProductTitle(requestData?.productId ?? '')} />
        </>,
      ],
    },
    notFound: {
      title: '',
      description: [
        <>
          <NotFoundPage />
        </>,
      ],
    },
  };

  return loading ? (
    <LoadingOverlay
      loadingText={t(`rejectRegistration.outcomeContent.${requestType}.loadingText`)}
    />
  ) : (
    outcomeContentState && <MessageNoAction {...outcomeContent[outcomeContentState]} />
  );
}
