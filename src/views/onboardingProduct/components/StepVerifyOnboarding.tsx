import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { uniqueId } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  InstitutionType,
  Product,
  RequestOutcomeMessage,
  StepperStepComponentProps,
} from '../../../../types';
import AlreadyOnboarded from '../../../components/layout/AlreadyOnboarded';
import UserNotAllowedPage from '../../../components/layout/UserNotAllowedPage';
import { LoadingOverlay } from '../../../components/modals/LoadingOverlay';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';
import { HeaderContext, UserContext } from '../../../lib/context';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { verifyOnboarding } from '../../../services/onboardingServices';
import { ENV } from '../../../utils/env';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';

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

  useEffect(() => {
    void verifyOnboarding(
      setLoading,
      setRequiredLogin,
      productId,
      selectedProduct,
      setOutcome,
      alreadyOnboarded,
      onboardingFormData,
      requestIdRef,
      forward,
      institutionType,
      genericError,
      externalInstitutionId,
      notAllowedErrorNoParty
    );
  }, []);

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
