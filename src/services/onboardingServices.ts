import { AxiosResponse, AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { InstitutionOnboardingInfoResource, InstitutionType } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';

export const submit = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  productId: string,
  forward: (...args: any) => void,
  institutionType: InstitutionType | undefined,
  setOutcome: Dispatch<SetStateAction<any>>,
  genericError: any,
  partyId?: string
) => {
  setLoading(true);

  const onboardingData = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_ONBOARDING_DATA',
    },
    {
      method: 'GET',
      params: {
        institutionId: partyId,
        productId,
      },
    },
    () => setRequiredLogin(true)
  );

  const restOutcomeData = getFetchOutcome(onboardingData);
  if (restOutcomeData === 'success') {
    const result = (onboardingData as AxiosResponse).data as InstitutionOnboardingInfoResource;
    const billingData = {
      ...result.institution.billingData,
      geographicTaxonomies: result.geographicTaxonomies,
    };

    forward(
      result.institution.origin,
      result.institution.originId,
      billingData,
      result.institution.institutionType ?? institutionType,
      result.institution.id,
      result.institution.assistanceContacts,
      result.institution.companyInformations,
      result.institution?.city
        ?.charAt(0)
        .toUpperCase()
        .concat(result.institution?.city.substring(1).toLowerCase().trim()),
      result.institution?.county,
      result.institution.country,
      result.institution?.paymentServiceProvider,
      result.institution?.dataProtectionOfficer
    );
  } else if (
    (onboardingData as AxiosError<any>).response?.status === 404 ||
    (onboardingData as AxiosError<any>).response?.status === 400
  ) {
    forward(undefined, institutionType, undefined);
  } else {
    setOutcome(genericError);
  }
  setLoading(false);
};
