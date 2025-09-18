export type GeographicTaxonomyResource = {
  code: string;
  country: string;
  country_abbreviation: string;
  desc: string;
  enabled: boolean;
  istat_code?: string;
  province_abbreviation?: string;
  province_id?: string;
  region_id: string;
};

export type GeographicTaxonomy = {
  code: string;
  desc: string;
};

export const onboardedInstitutionInfo2geographicTaxonomy = (
  onboardingInstitutionInfo: GeographicTaxonomy
) => ({
  code: onboardingInstitutionInfo.code,
  desc: onboardingInstitutionInfo.desc,
});

export const nationalValue = 'ITA';
