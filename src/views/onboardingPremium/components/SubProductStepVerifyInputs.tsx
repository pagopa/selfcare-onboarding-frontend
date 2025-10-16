import { trackAppError } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { Product, SelfcareParty, StepperStepComponentProps } from '../../../../types';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';
import { HeaderContext, UserContext } from '../../../lib/context';
import { checkProduct } from '../../../services/onboardingServices';
import { handleSearchUserParties } from '../../../services/subProductServices';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { genericError } from '../../onboardingProduct/components/StepVerifyOnboarding';

type Props = StepperStepComponentProps & {
  requestId: string;
  productId: string;
  subProductId: string;
  setLoading: (loading: boolean) => void;
  setActiveStep: Dispatch<SetStateAction<number>>;
};

function SubProductStepVerifyInputs({
  forward,
  productId,
  subProductId,
  requestId,
  setLoading,
  setActiveStep,
}: Props) {
  const [error, setError] = useState<boolean>(false);
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const [selectedSubProduct, setSelectedSubProduct] = useState<Product | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();
  const [parties, setParties] = useState<Array<SelfcareParty>>();

  const submit = () => {
    setLoading(true);
    Promise.all([
      checkProduct(productId, setSelectedProduct, setRequiredLogin, {
        onError: () => setError(true),
      }),
      checkProduct(subProductId, setSelectedSubProduct, setRequiredLogin, {
        onError: () => setError(true),
      }),
      handleSearchUserParties(setParties, setRequiredLogin, productId, subProductId),
    ])
      .catch((reason) => {
        trackAppError({
          id: `ONBOARDING_SUBPRODUCT_ERROR_${requestId}`,
          blocking: false,
          toNotify: true,
          techDescription: `Something gone wrong while fetching products ${productId} ${subProductId}`,
          error: reason,
        });
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    submit();
  }, [productId, subProductId]);

  useEffect(() => {
    if (selectedProduct && selectedSubProduct && parties !== undefined) {
      if (selectedSubProduct.parentId === productId) {
        forward(selectedProduct, selectedSubProduct, parties);
      } else {
        setError(true);
      }

      if (parties.length === 0) {
        setActiveStep(2);
      }
    }
  }, [selectedProduct, selectedSubProduct, parties]);

  if (error) {
    unregisterUnloadEvent(setOnExit);
  }

  return error ? <MessageNoAction {...genericError} /> : <></>;
}

export default SubProductStepVerifyInputs;
