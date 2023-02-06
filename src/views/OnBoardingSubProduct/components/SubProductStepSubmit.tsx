import { useContext, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import { EndingPage } from '@pagopa/selfcare-common-frontend';
import { IllusError } from '@pagopa/mui-italia';
import {
  InstitutionType,
  Product,
  StepperStepComponentProps,
  UserOnCreate,
} from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { MessageNoAction } from '../../../components/MessageNoAction';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { ENV } from '../../../utils/env';
import { subProductSubmitFetch } from './SubProductSubmitFetch';

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
          <Trans i18nKey="onBoardingSubProduct.genericError.title">Qualcosa è andato storto</Trans>
        }
        description={
          <Trans i18nKey="onBoardingSubProduct.genericError.message">
            A causa di un errore del sistema non è possibile completare <br />
            la procedura. Ti chiediamo di riprovare più tardi.
          </Trans>
        }
        buttonLabel={
          <Trans i18nKey="onBoardingSubProduct.genericError.homeButton">Torna alla home</Trans>
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
}: Props) {
  const [error, setError] = useState<boolean>(false);
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  useEffect(() => {
    if (!error) {
      setLoading(true);
      subProductSubmitFetch({
        externalInstitutionId,
        subProduct,
        users,
        billingData,
        institutionType,
        pricingPlan,
        setRequiredLogin,
        requestId,
        product,
        setError,
        forward,
        origin,
      })
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
  return error ? <MessageNoAction {...errorOutCome} /> : <></>;
}
export default SubProductStepSubmit;
