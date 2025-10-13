import { AxiosError, AxiosResponse } from 'axios';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { trackAppError } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { SelfcareParty, Product, StepperStepComponentProps } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { buildUrlLogo } from '../../../utils/constants';
import { genericError } from '../../onboardingProduct/components/StepVerifyOnboarding';
import { MessageNoAction } from '../../../components/shared/MessageNoAction';

type Props = StepperStepComponentProps & {
  requestId: string;
  productId: string;
  subProductId: string;
  setLoading: (loading: boolean) => void;
  setActiveStep: Dispatch<SetStateAction<number>>;
};

const checkProduct = async (
  id: string,
  setter: (product: Product | undefined) => void,
  setRequiredLogin: (required: boolean) => void,
  setError: Dispatch<SetStateAction<boolean>>
) => {
  const onboardingProducts = await fetchWithLogs(
    { endpoint: 'ONBOARDING_VERIFY_PRODUCT', endpointParams: { productId: id } },
    { method: 'GET' },
    () => setRequiredLogin(true)
  );
  const result = getFetchOutcome(onboardingProducts);

  if (result === 'success') {
    const product = (onboardingProducts as AxiosResponse).data;
    setter(product);
  } else if ((onboardingProducts as AxiosError).response?.status === 404) {
    setter(undefined);
  } else {
    setError(true);
    console.error('Unexpected response', (onboardingProducts as AxiosError).response);
    setter(undefined);
  }
};

const handleSearchUserParties = async (
  setParties: (parties: Array<SelfcareParty>) => void,
  setRequiredLogin: (required: boolean) => void,
  _productId: string,
  subProductId: string
) => {

  const searchResponsePremium = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_USER_PARTIES' },
    {
      method: 'GET',
      params: {
        productId: subProductId,
      },
    },
    () => setRequiredLogin(true)
  );
  
  const partiesWithPremiumProduct = (searchResponsePremium as AxiosResponse).data;

  const outcome = getFetchOutcome(searchResponsePremium);

  if (outcome === 'success') {
    setParties(
      partiesWithPremiumProduct.map((p: any) => ({
        ...p,
        urlLogo: buildUrlLogo(p.id),
      }))
    );
  } else {
    setParties([]);
  }
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
      checkProduct(productId, setSelectedProduct, setRequiredLogin, setError),
      checkProduct(subProductId, setSelectedSubProduct, setRequiredLogin, setError),
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
