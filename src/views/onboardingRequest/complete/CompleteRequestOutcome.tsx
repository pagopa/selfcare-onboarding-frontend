import { JSX } from 'react';
import { RequestOutcomeComplete } from '../../../../types';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';
import AlreadyCompletedRequest from '../status/AlreadyCompletedPage';
import AlreadyRejectedRequest from '../status/AlreadyRejectedPage';
import ExpiredRequestPage from '../status/ExpiredPage';
import NotFoundPage from '../status/NotFoundPage';
import { CompleteRequestFailPage } from './pages/CompleteRequestFailPage';
import CompleteRequestSuccessPage from './pages/CompleteRequestSuccessPage';

type Props = {
  outcome: RequestOutcomeComplete;
  step: JSX.Element;
  translationKeyValue: string;
  productTitle: string;
  addUserFlow: boolean;
  contractUpdate: boolean;
  institutionId: string | undefined;
  productId: string | undefined;
  back: () => void;
};

const renderOutcome = ({
  outcome,
  step,
  translationKeyValue,
  productTitle,
  addUserFlow,
  contractUpdate,
  institutionId,
  productId,
  back,
}: Props): JSX.Element => {
  switch (outcome) {
    case 'toBeCompleted':
      return step;
    case 'alreadyRejected':
      return (
        <AlreadyRejectedRequest
          translationKeyValue={translationKeyValue}
          productTitle={productTitle}
        />
      );
    case 'alreadyCompleted':
      return <AlreadyCompletedRequest translationKeyValue={translationKeyValue} />;
    case 'expired':
      return (
        <ExpiredRequestPage translationKeyValue={translationKeyValue} productTitle={productTitle} />
      );
    case 'success':
      return (
        <CompleteRequestSuccessPage
          addUserFlow={addUserFlow}
          translationKeyValue={translationKeyValue}
          institutionId={institutionId}
          productId={productId}
          contractUpdate={contractUpdate}
        />
      );
    case 'error':
      return <CompleteRequestFailPage back={back} />;
    default:
      // notFound, notAllowed, genericError
      return <NotFoundPage />;
  }
};

export function CompleteRequestOutcome(props: Readonly<Props>) {
  return <MessageNoAction title="" description={[<>{renderOutcome(props)}</>]} />;
}
