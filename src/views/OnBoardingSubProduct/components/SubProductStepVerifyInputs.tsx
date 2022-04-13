import { AxiosError, AxiosResponse } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { trackAppError } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { Party, Product, StepperStepComponentProps } from '../../../../types';
import { HeaderContext, UserContext } from '../../../lib/context';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import NoProductPage from '../../NoProductPage';
import { unregisterUnloadEvent } from '../../../utils/unloadEvent-utils';
import { ENV } from '../../../utils/env';

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

const buildUrlLog = (institutionId: string) =>
  `${ENV.URL_INSTITUTION_LOGO.PREFIX}${institutionId}${ENV.URL_INSTITUTION_LOGO.SUFFIX}`;

const handleSearchUserParties = async (
  setParties: (parties: Array<Party>) => void,
  setRequiredLogin: (required: boolean) => void
) => {
  const searchResponse = await fetchWithLogs(
    { endpoint: 'ONBOARDING_GET_USER_PARTIES' },
    { method: 'GET' },
    () => setRequiredLogin(true)
  );
  const outcome = getFetchOutcome(searchResponse);

  if (outcome === 'success') {
    setParties(
      ((searchResponse as AxiosResponse).data as Array<Party>).map((p) => ({
        ...p,
        urlLogo: buildUrlLog(p.institutionId),
      }))
    );
  }
  setParties([]);
};

function SubProductStepVerifyInputs({
  forward,
  productId,
  subProductId,
  requestId,
  setLoading,
}: Props) {
  const pricingPlanByQuery = new URLSearchParams(window.location.search).get('pricingPlan');

  const [error, setError] = useState<boolean>(false);
  const { setOnLogout } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  const [selectedSubProduct, setSelectedSubProduct] = useState<Product | null>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>();

  const [parties, setParties] = useState<Array<Party>>();

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
      selectedProduct !== undefined &&
      selectedSubProduct !== undefined &&
      parties !== undefined
    ) {
      if (
        selectedProduct === null ||
        selectedSubProduct === null ||
        selectedSubProduct.parent !== productId
      ) {
        setError(true);
      } else {
        forward(selectedProduct, selectedSubProduct, parties, pricingPlanByQuery);
      }
    }
  }, [selectedProduct, selectedSubProduct, parties, pricingPlanByQuery]);

  if (error) {
    unregisterUnloadEvent(setOnLogout);
  }

  return error ? <NoProductPage /> : <></>;
}

export default SubProductStepVerifyInputs;
