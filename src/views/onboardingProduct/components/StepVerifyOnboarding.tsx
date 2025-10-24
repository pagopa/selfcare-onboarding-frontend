import { IllusError } from '@pagopa/mui-italia';
import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { uniqueId } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  InstitutionType,
  OutcomeType,
  Product,
  StepperStepComponentProps,
} from '../../../../types';
import AlreadyOnboarded from '../../../components/layout/AlreadyOnboarded';
import UserNotAllowedPage from '../../../components/layout/UserNotAllowedPage';
import { LoadingOverlay } from '../../../components/modals/LoadingOverlay';
import { HeaderContext, UserContext } from '../../../lib/context';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { verifyOnboarding } from '../../../services/onboardingServices';
import { ENV } from '../../../utils/env';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { PRODUCT_IDS } from '../../../utils/constants';

type Props = StepperStepComponentProps & {
  externalInstitutionId: string;
  productId: string;
  selectedProduct?: Product | null;
  onboardingFormData?: OnboardingFormData;
  institutionType?: InstitutionType;
};

export const genericError = {
  title: '',
  description: [
    // eslint-disable-next-line react/jsx-key
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
    />,
  ],
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const StepVerifyOnboarding = ({
  forward,
  externalInstitutionId,
  productId,
  selectedProduct,
  onboardingFormData,
  institutionType,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [outcomeType, setOutcomeType] = useState<OutcomeType>(null);
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);
  const requestIdRef = useRef<string>();
  const hasCalledVerify = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    requestIdRef.current = uniqueId(
      `onboarding-verify-onboarding${externalInstitutionId}-${productId}-`
    );
  }, [productId, externalInstitutionId]);

  useEffect(() => {
    if (!onboardingFormData?.taxCode) {
      return;
    }

    const needsOrigin = productId !== PRODUCT_IDS.IDPAY_MERCHANT && institutionType === 'PA';
    if (needsOrigin && !onboardingFormData?.origin) {
      return;
    }

    if (hasCalledVerify.current) {
      return;
    }

    // eslint-disable-next-line functional/immutable-data
    hasCalledVerify.current = true;

    void verifyOnboarding(
      setLoading,
      setRequiredLogin,
      productId,
      selectedProduct,
      setOutcomeType,
      onboardingFormData,
      requestIdRef,
      forward,
      institutionType,
      externalInstitutionId
    );
  }, [onboardingFormData?.taxCode, onboardingFormData?.origin, productId, institutionType]);

  if (outcomeType) {
    unregisterUnloadEvent(setOnExit);
  }

  if (loading) {
    return <LoadingOverlay loadingText={t('stepVerifyOnboarding.loadingText')} />;
  } else {
    switch (outcomeType) {
      case 'NOT_ALLOWED':
        return (
          <UserNotAllowedPage
            partyName={onboardingFormData?.businessName}
            productTitle={selectedProduct?.title}
          />
        );
      case 'ALREADY_ONBOARDED':
        return (
          <AlreadyOnboarded
            institutionType={institutionType}
            onboardingFormData={onboardingFormData}
            selectedProduct={selectedProduct}
          />
        );
      case 'GENERIC_ERROR':
        return genericError.description[0] as JSX.Element;

      default:
        return <></>;
    }
  }
};

export default StepVerifyOnboarding;
