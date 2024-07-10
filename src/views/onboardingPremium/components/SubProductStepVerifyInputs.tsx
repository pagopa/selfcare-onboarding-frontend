import { AxiosError, AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { trackAppError } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { SelfcareParty, Product, StepperStepComponentProps } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import NoProductPage from '../../NoProductPage';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { buildUrlLogo } from '../../../utils/constants';

type Props = StepperStepComponentProps & {
  requestId: string;
  productId: string;
  subProductId: string;
  setLoading: (loading: boolean) => void;
};

const checkProduct = async (
  id: string,
  setter: (product: Product | null) => void,
  setRequiredLogin: (required: boolean) => void
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
    setter(null);
  } else {
    console.error('Unexpected response', (onboardingProducts as AxiosError).response);
    setter(null);
  }
};

const handleSearchUserParties = async (
  setParties: (parties: Array<SelfcareParty>) => void,
  setRequiredLogin: (required: boolean) => void
) => {
  const searchResponseBase = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_USER_PARTIES' },
    {
      method: 'GET',
      params: {
        productFilter: 'prod-io',
      },
    },
    () => setRequiredLogin(true)
  );

  const searchResponsePremium = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_USER_PARTIES' },
    {
      method: 'GET',
      params: {
        productFilter: 'prod-io-premium',
      },
    },
    () => setRequiredLogin(true)
  );
  const partiesWithBaseProduct = (searchResponseBase as AxiosResponse).data as Array<SelfcareParty>;
  const partiesWithPremiumProduct = (searchResponsePremium as AxiosResponse).data;

  const partiesWithoutPremium = partiesWithBaseProduct.filter(
    (pb) => !partiesWithPremiumProduct.find((pp: any) => pb.id === pp.id)
  );

  const outcome = getFetchOutcome(searchResponseBase);

  if (outcome === 'success') {
    if (process.env.REACT_APP_MOCK_API === 'true') {
      setParties(
        partiesWithBaseProduct.map((p) => ({
          ...p,
          urlLogo: buildUrlLogo(p.id),
        }))
      );
    } else {
      setParties(
        partiesWithoutPremium.map((p) => ({
          ...p,
          urlLogo: buildUrlLogo(p.id),
        }))
      );
    }
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
}: Props) {
  const [error, setError] = useState<boolean>(false);
  const { setOnExit } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const [selectedSubProduct, setSelectedSubProduct] = useState<Product | null>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();

  const [parties, setParties] = useState<Array<SelfcareParty>>();

  const submit = () => {
    setLoading(true);
    Promise.all([
      checkProduct(productId, setSelectedProduct, setRequiredLogin),
      checkProduct(subProductId, setSelectedSubProduct, setRequiredLogin),
      handleSearchUserParties(setParties, setRequiredLogin),
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
    if (
      selectedProduct &&
      selectedSubProduct &&
      parties &&
      selectedSubProduct.parentId === productId
    ) {
      forward(selectedProduct, selectedSubProduct, parties);
    } else {
      setError(true);
    }
  }, [selectedProduct, selectedSubProduct, parties]);

  if (error) {
    unregisterUnloadEvent(setOnExit);
  }

  return error ? <NoProductPage /> : <></>;
}

export default SubProductStepVerifyInputs;
