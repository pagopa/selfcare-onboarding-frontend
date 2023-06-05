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
