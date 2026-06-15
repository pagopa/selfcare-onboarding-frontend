import { Dispatch, SetStateAction } from 'react';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { PartyRegistryProxyApi } from '../api/PartyRegistryProxyApiClient';
import { getErrorStatus } from '../lib/error-utils';
import { GeographicTaxonomy, GeographicTaxonomyResource } from '../model/GeographicTaxonomies';
import { InstitutionLocationData } from '../model/InstitutionLocationData';
import { formatCity } from '../utils/formatting-utils';
import { AooData } from '../model/AooData';
import { UoData } from '../model/UoModel';
import { mockedCountries } from '../lib/__mocks__/mockApiRequests';
import { CountryResource } from '../model/CountryResource';
import { ENV } from '../utils/env';
import { isMockEnvironment } from '../utils/institutionTypeUtils';

export const getCountriesFromGeotaxonomies = async (
  query: string,
  setCountries: Dispatch<SetStateAction<Array<InstitutionLocationData> | undefined>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  try {
    const geographicTaxonomies = (await PartyRegistryProxyApi.getTaxonomiesByQuery(
      query
    )) as Array<GeographicTaxonomyResource>;

    const mappedResponse = geographicTaxonomies.map((gt) => ({
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
  } catch (error) {
    console.error(error);
  }
};

export const getPreviousGeotaxononomies = async (
  externalInstitutionId: string,
  aooSelected: AooData | undefined,
  uoSelected: UoData | undefined,
  setPreviousGeotaxononomies: Dispatch<SetStateAction<Array<GeographicTaxonomy>>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>
) => {
  try {
    const subunitCode = aooSelected?.codiceUniAoo ?? uoSelected?.codiceUniUo;
    const result = await OnboardingApi.getPreviousGeotaxonomy(externalInstitutionId, subunitCode);
    if (result) {
      setPreviousGeotaxononomies(result as unknown as Array<GeographicTaxonomy>);
    }
  } catch (error) {
    console.error(error);
  }
};

export const getLocationFromIstatCode = async (
  setInstitutionLocationData: Dispatch<SetStateAction<InstitutionLocationData | undefined>>,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  istatCode?: string
) => {
  if (!istatCode) {
    return;
  }
  try {
    const result = await PartyRegistryProxyApi.getLocationByCode(istatCode);
    if (result) {
      setInstitutionLocationData({
        code: result.code,
        country: result.country_abbreviation,
        county: result.province_abbreviation,
        city: formatCity(result.desc ?? ''),
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getNationalCountries = async (
  setNationalCountries: Dispatch<SetStateAction<Array<CountryResource> | undefined>>
) => {
  if (isMockEnvironment()) {
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

export const handleSearch = async (
  query: string,
  index: number,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  optionsSelected: Array<GeographicTaxonomy>,
  setOptions: Dispatch<SetStateAction<Array<GeographicTaxonomy>>>,
  findError: (index: number) => void,
  deleteError: (index: number) => void,
  setIsAddNewAutocompleteEnabled: Dispatch<SetStateAction<boolean>>
) => {
  try {
    const data = (await PartyRegistryProxyApi.getTaxonomiesByQuery(query)) as Array<
      GeographicTaxonomy & { label?: string }
    >;

    const withLabel = data.map((value) => ({ ...value, label: value.desc }));
    const dataFiltered = withLabel.filter(
      (d) => !optionsSelected.find((os) => os?.code === d?.code)
    );
    const matchesWithTyped = dataFiltered.filter((o) =>
      o.desc.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    );
    setOptions(matchesWithTyped);

    if (matchesWithTyped.length > 0) {
      deleteError(index);
    } else {
      findError(index);
      setIsAddNewAutocompleteEnabled(false);
    }
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      setOptions([]);
    }
  }
};
