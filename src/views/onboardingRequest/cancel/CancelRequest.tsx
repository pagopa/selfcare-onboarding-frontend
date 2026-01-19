import { productId2ProductTitle } from '@pagopa/selfcare-common-frontend/lib/utils/productId2ProductTitle';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OnboardingRequestData, RequestOutcomeComplete } from '../../../../types';
import { LoadingOverlay } from '../../../components/modals/LoadingOverlay';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';
import { HeaderContext, UserContext } from '../../../lib/context';
import { deleteRequest } from '../../../services/requestStatusServices';
import { verifyRequest } from '../../../services/tokenServices';
import { genericError } from '../../../components/steps/StepOnboardingData';
import { getRequestJwt } from '../../../utils/getRequestJwt';
import AlreadyCompletedRequest from '../status/AlreadyCompletedPage';
import AlreadyRejectedRequest from '../status/AlreadyRejectedPage';
import ExpiredRequestPage from '../status/ExpiredPage';
import NotFoundPage from '../status/NotFoundPage';
import CancelRequestPage from './pages/CancelRequestPage';
import CancelRequestSuccessPage from './pages/CancelRequestSuccessPage';

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

  const addUserFlow = new URLSearchParams(window.location.search).get('add-user') === 'true';
  const translationKeyValue = addUserFlow ? 'user' : 'product';

  useEffect(() => {
    setSubHeaderVisible(true);
    setEnableLogin(false);
    return () => {
      setSubHeaderVisible(true);
      setOnExit(undefined);
      setEnableLogin(true);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    verifyRequest({
      onboardingId: token,
      setRequiredLogin,
      setOutcomeContentState,
      setRequestData,
    }).finally(() => setLoading(false));
  }, []);

  

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
          <CancelRequestPage deleteRequest={deleteRequest(token, setOutcomeContentState, setLoading)} />
        </>,
      ],
    },
    alreadyCompleted: {
      title: '',
      description: [
        <>
          <AlreadyCompletedRequest translationKeyValue={translationKeyValue} />
        </>,
      ],
    },
    alreadyRejected: {
      title: '',
      description: [
        <>
          <AlreadyRejectedRequest
            translationKeyValue={translationKeyValue}
            productTitle={productId2ProductTitle(requestData?.productId ?? '')}
          />
        </>,
      ],
    },
    expired: {
      title: '',
      description: [
        <>
          <ExpiredRequestPage
            translationKeyValue={translationKeyValue}
            productTitle={productId2ProductTitle(requestData?.productId ?? '')}
          />
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
    genericError,
  };

  return loading ? (
    <LoadingOverlay loadingText={t(`rejectRegistration.outcomeContent.delete.loadingText`)} />
  ) : outcomeContentState ? (
    <MessageNoAction {...outcomeContent[outcomeContentState]} />
  ) : (
    <MessageNoAction {...outcomeContent.notFound} />
  );
}
