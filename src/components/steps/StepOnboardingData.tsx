import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstitutionType, OutcomeType, StepperStepComponentProps } from '../../../types';
import { HeaderContext, UserContext } from '../../lib/context';
import { getOnboardingData } from '../../services/onboardingServices';
import { unregisterUnloadEvent } from '../../utils/unloadEvent-utils';
import { genericError } from '../../views/onboardingProduct/components/StepVerifyOnboarding';
import { LoadingOverlay } from '../modals/LoadingOverlay';

type Props = StepperStepComponentProps & {
  productId: string;
  partyId?: string;
  institutionType?: InstitutionType;
  subProductFlow?: boolean;
};

function StepOnboardingData({
  forward,
  partyId,
  productId,
  institutionType,
  subProductFlow,
}: Props) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [outcomeType, setOutcomeType] = useState<OutcomeType>(null);
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  useEffect(() => {
    if (subProductFlow) {
      void getOnboardingData(
        setLoading,
        setRequiredLogin,
        productId,
        forward,
        institutionType,
        setOutcomeType,
        partyId
      );
    } else {
      forward(undefined, institutionType, undefined);
      setLoading(false);
    }
  }, [productId]);

  if (outcomeType) {
    unregisterUnloadEvent(setOnExit);
  }

  if (loading) {
    return <LoadingOverlay loadingText={t('stepVerifyOnboarding.loadingText')} />;
  } else {
    switch (outcomeType) {
      case 'GENERIC_ERROR':
        return genericError.description[0] as JSX.Element;

      default:
        return <></>;
    }
  }
}
export default StepOnboardingData;
