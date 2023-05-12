// FE model
export type OnboardingInstitutionInfo = {
  code: string;
  desc: string;
  region?: string;
  province?: string;
  provinceAbbreviation?: string;
  country?: string;
  countryAbbreviation?: string;
  // startDate?: Date;
  // endDate?: Date;
  // enable: boolean;
};

// from BFF
export type OnboardingInstitutionInfoDTO = {
  description: string;
  istat_code: string;
  province_id: string;
  province_abbreviation: string;
  region_id: string;
  geotax_id: string;
  enabled: boolean;
  country: string;
  country_abbreviation: string;
};

export const onboardingInfo2onboardingInstitutionInfo = (
  geoTaxValue: OnboardingInstitutionInfoDTO
): OnboardingInstitutionInfo => ({
  code: geoTaxValue.geotax_id,
  desc: geoTaxValue.description,
  region: geoTaxValue.region_id,
  province: geoTaxValue.province_id,
  provinceAbbreviation: geoTaxValue.province_abbreviation,
  country: geoTaxValue.country,
  countryAbbreviation: geoTaxValue.country_abbreviation,
  // startDate?: geoTaxValue.,
  // endDate?:geoTaxValue ,
  // enable: ,
});
