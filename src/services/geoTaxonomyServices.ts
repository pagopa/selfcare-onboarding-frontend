import { AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { GeographicTaxonomy, GeographicTaxonomyResource } from '../model/GeographicTaxonomies';
import { InstitutionLocationData } from '../model/InstitutionLocationData';
import { formatCity } from '../utils/formatting-utils';
import { AooData } from '../model/AooData';
import { UoData } from '../model/UoModel';
import { mockedCountries } from '../lib/__mocks__/mockApiRequests';
import { CountryResource } from '../model/CountryResource';
import { ENV } from '../utils/env';

export const getCountriesFromGeotaxonomies = async (
  query: string,
  setCountries: Dispatch<SetStateAction<Array<InstitutionLocationData> | undefined>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  const searchGeotaxonomy = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_GEOTAXONOMY',
    },
    {
      method: 'GET',
      params: { description: query },
    },
    () => setRequiredLogin(true)
  );
  const outcome = getFetchOutcome(searchGeotaxonomy);

  if (outcome === 'success') {
    const geographicTaxonomies = (searchGeotaxonomy as AxiosResponse).data;

    const mappedResponse = geographicTaxonomies.map((gt: GeographicTaxonomyResource) => ({
      code: gt.code,
      country: gt.country_abbreviation,
      county: gt.province_abbreviation,
      city: gt.desc,
      istat_code: gt.istat_code,
    })) as Array<InstitutionLocationData>;

    const onlyCountries = mappedResponse
      .filter((r) => r.city.includes('- COMUNE'))
      .map((r) => ({
        ...r,
        city: formatCity(r.city),
      }));

    setCountries(onlyCountries);
  }
};

export const getPreviousGeotaxononomies = async (
  externalInstitutionId: string,
  aooSelected: AooData | undefined,
  uoSelected: UoData | undefined,
  setPreviousGeotaxononomies: Dispatch<SetStateAction<Array<GeographicTaxonomy>>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  const onboardingData = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_PREVIOUS_GEOTAXONOMIES',
    },
    {
      method: 'GET',
      params: {
        taxCode: externalInstitutionId,
        ...(aooSelected
          ? { subunitCode: aooSelected?.codiceUniAoo }
          : uoSelected && { subunitCode: uoSelected?.codiceUniUo }),
      },
    },
    () => setRequiredLogin(true)
  );

  const restOutcomeData = getFetchOutcome(onboardingData);
  if (restOutcomeData === 'success') {
    const result = (onboardingData as AxiosResponse).data;
    if (result) {
      setPreviousGeotaxononomies(result);
    }
  }
};

export const getLocationFromIstatCode = async (
  setInstitutionLocationData: Dispatch<SetStateAction<InstitutionLocationData | undefined>>,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  istatCode?: string
) => {
  const getLocation = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_GET_LOCATION_BY_ISTAT_CODE',
      endpointParams: {
        geoTaxId: istatCode,
      },
    },
    { method: 'GET' },
    () => setRequiredLogin(true)
  );
  const outcome = getFetchOutcome(getLocation);

  if (outcome === 'success') {
    const result = (getLocation as AxiosResponse).data;
    if (result) {
      const institutionLocation = {
        code: result.code,
        country: result.country_abbreviation,
        county: result.province_abbreviation,
        city: formatCity(result.desc),
      };
      setInstitutionLocationData(institutionLocation);
    }
  }
};

export const getNationalCountries = async (
  setNationalCountries: Dispatch<SetStateAction<Array<CountryResource> | undefined>>
) => {
  if (process.env.REACT_APP_MOCK_API === 'true') {
    const countriesWithoutIta = mockedCountries.filter(
      (cm: CountryResource) => cm.alpha_2 !== 'IT'
    );
    setNationalCountries(countriesWithoutIta);
  } else {
    try {
      const response = await fetch(ENV.JSON_URL.COUNTRIES);
      const nationalCountriesResponse = await response.json();
      const countriesWithoutIta = nationalCountriesResponse.filter(
        (cm: CountryResource) => cm.alpha_2 !== 'IT'
      );
      setNationalCountries(countriesWithoutIta);
    } catch (reason) {
      console.error(reason);
    }
  }
};
