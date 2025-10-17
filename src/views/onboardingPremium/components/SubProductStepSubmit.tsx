import { useContext, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import { EndingPage } from '@pagopa/selfcare-common-frontend/lib';
import { IllusError } from '@pagopa/mui-italia';
import {
  InstitutionType,
  Product,
  StepperStepComponentProps,
  UserOnCreate,
} from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { ENV } from '../../../utils/env';
import AlreadyOnboarded from '../../../components/layout/AlreadyOnboarded';
import { postSubProductOnboardingSubmit } from '../../../services/onboardingSubmitServices';

type Props = StepperStepComponentProps & {
  requestId: string;
  product: Product;
  subProduct: Product;
  externalInstitutionId: string;
  users: Array<UserOnCreate>;
  billingData: OnboardingFormData;
  institutionType: InstitutionType;
  pricingPlan?: string;
  origin: string;
  originId: string;
  setLoading: (loading: boolean) => void;
};

const errorOutCome = {
  title: '',
  description: [
    <>
      <EndingPage
        minHeight="52vh"
        icon={<IllusError size={60} />}
        variantTitle={'h4'}
        variantDescription={'body1'}
        title={
          <Trans i18nKey="onboardingSubProduct.genericError.title">Qualcosa è andato storto</Trans>
        }
        description={
          <Trans i18nKey="onboardingSubProduct.genericError.message">
            A causa di un errore del sistema non è possibile completare <br />
            la procedura. Ti chiediamo di riprovare più tardi.
          </Trans>
        }
        buttonLabel={
          <Trans i18nKey="onboardingSubProduct.genericError.homeButton">Torna alla home</Trans>
        }
        onButtonClick={() => window.location.assign(ENV.URL_FE.LANDING)}
      />
    </>,
  ],
};

function SubProductStepSubmit({
  requestId,
  forward,
  product,
  subProduct,
  externalInstitutionId,
  users,
  billingData,
  setLoading,
  institutionType,
  pricingPlan,
  origin,
  originId,
}: Props) {
  const [error, setError] = useState<boolean>(false);
  const [conflictError, setConflictError] = useState<boolean>(false);
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  useEffect(() => {
    if (!error) {
      setLoading(true);
      postSubProductOnboardingSubmit(
        externalInstitutionId,
        subProduct,
        users,
        billingData,
        institutionType,
        setRequiredLogin,
        requestId,
        product,
        setError,
        forward,
        origin,
        originId,
        setConflictError,
        pricingPlan
      )
        .catch((_reason: any) => {
          setError(true);
          /*
          trackAppError({
            id: `ONBOARDING_SUBPRODUCT_ERROR_${requestId}`,
            blocking: false,
            toNotify: true,
            techDescription: `Something gone wrong while onboarding SubProduct ${subProduct?.id} for party ${institutionId}`,
            error: reason,
          });
          */
        })
        .finally(() => {
          unregisterUnloadEvent(setOnExit);
          setLoading(false);
        });
    }
  }, []);
  return error && !conflictError ? (
    <MessageNoAction {...errorOutCome} />
  ) : error && conflictError ? (
    <AlreadyOnboarded selectedProduct={subProduct} />
  ) : (
    <></>
  );
}
export default SubProductStepSubmit;
