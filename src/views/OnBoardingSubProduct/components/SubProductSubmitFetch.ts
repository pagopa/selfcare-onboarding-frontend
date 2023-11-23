import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { AxiosError } from 'axios';
import { InstitutionType, Problem, Product, UserOnCreate } from '../../../../types';
import { fetchWithLogs } from '../../../lib/api-utils';
import { getFetchOutcome } from '../../../lib/error-utils';
import { billingData2billingDataRequest } from '../../../model/BillingData';
import { pspData2pspDataRequest } from '../../../model/PspData';
import { OnboardingFormData } from '../../../model/OnboardingFormData';
import { ENV } from '../../../utils/env';
import { onboardedInstitutionInfo2geographicTaxonomy } from '../../../model/GeographicTaxonomies';
import { assistanceConcatsDto2pspDataRequest } from '../../../model/AssistanceContacts';
import { companyInformationsDto2pspDataRequest } from '../../../model/CompanyInformations';

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
        geographicTaxonomies: ENV.GEOTAXONOMY.SHOW_GEOTAXONOMY
          ? billingData.geographicTaxonomies?.map((gt) =>
              onboardedInstitutionInfo2geographicTaxonomy(gt)
            )
          : [],
        assistanceContacts: assistanceConcatsDto2pspDataRequest(billingData as OnboardingFormData),
        companyInformations:
          institutionType !== 'PSP' && institutionType !== 'PA'
            ? companyInformationsDto2pspDataRequest(billingData as OnboardingFormData)
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
    });
    setError(true);
  }
};
