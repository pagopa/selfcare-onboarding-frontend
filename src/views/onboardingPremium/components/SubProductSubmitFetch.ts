import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { AxiosError } from 'axios';
import { InstitutionType, Problem, Product, UserOnCreate } from '../../../../types';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { billingData2billingDataRequest } from '../../../model/BillingData';
import { pspData2pspDataRequest } from '../../../model/PspData';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { ENV } from '../../../utils/env';
import { onboardedInstitutionInfo2geographicTaxonomy } from '../../../model/GeographicTaxonomies';

type Props = {
  externalInstitutionId: string;
  subProduct: Product;
  users: Array<UserOnCreate>;
  billingData: OnboardingFormData;
  institutionType: InstitutionType;
  pricingPlan?: string;
  setRequiredLogin: React.Dispatch<React.SetStateAction<boolean>>;
  requestId: string;
  product: Product;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  forward: () => void;
  origin: string;
  originId: string;
};

export const subProductSubmitFetch = async ({
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
  originId
}: Props) => {
  const postLegalsResponse = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_POST_LEGALS',
    },
    {
      method: 'POST',
      data: {
        users: users.map((u) => ({
          ...u,
          taxCode: u.taxCode.toUpperCase(),
          email: u.email.toLowerCase(),
        })),
        billingData: billingData2billingDataRequest(billingData as OnboardingFormData),
        pspData:
          institutionType === 'PSP'
            ? pspData2pspDataRequest(billingData as OnboardingFormData)
            : undefined,
        institutionType,
        pricingPlan,
        origin,
        originId,
        geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
          ? billingData.geographicTaxonomies?.map((gt) =>
              onboardedInstitutionInfo2geographicTaxonomy(gt)
            )
          : [],
        assistanceContacts: { supportEmail: billingData.supportEmail },
        companyInformations:
          institutionType !== 'PA'
            ? {
                businessRegisterPlace: billingData?.businessRegisterPlace,
                rea: billingData?.rea,
                shareCapital: billingData?.shareCapital,
              }
            : undefined,
        institutionLocationData: {
          country: billingData?.country,
          county: billingData?.county,
          city: billingData?.city,
        },
        productId: subProduct.id,
        subunitCode: undefined,
        subunitType: undefined,
        taxCode: billingData?.taxCode,
      },
    },
    () => setRequiredLogin(true)
  );

  // Check the outcome
  const outcome = getFetchOutcome(postLegalsResponse);

  if (outcome === 'success') {
    trackEvent('ONBOARDING_PREMIUM_SEND_SUCCESS', {
      request_id: requestId,
      party_id: externalInstitutionId,
      product_id: product?.id,
      subproduct_id: subProduct?.id,
      selected_plan: pricingPlan === 'C0' ? 'consumo' : 'carnet',
    });
    forward();
  } else {
    const event =
      (postLegalsResponse as AxiosError<Problem>).response?.status === 409
        ? 'ONBOARDING_PREMIUM_SEND_CONFLICT_ERROR_FAILURE'
        : 'ONBOARDING_PREMIUM_SEND_FAILURE';
    trackEvent(event, {
      party_id: externalInstitutionId,
      request_id: requestId,
      product_id: product?.id,
      subproduct_id: subProduct?.id,
      reason: (postLegalsResponse as AxiosError<Problem>).response?.data?.detail,
    });
    setError(true);
  }
};
