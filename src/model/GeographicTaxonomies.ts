export type GeographicTaxonomy = {
    code: string;
    desc: string;
};

export const onboardedInstitutionInfo2geographicTaxonomy = (onboardedInstitutionInfo: OnboardedInstitutionInfo): GeographicTaxonomy => ({
code: onboardedInstitutionInfo.code,
   desc: ''
  });