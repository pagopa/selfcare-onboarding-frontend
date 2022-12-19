import { OnboardingInstitutionInfo } from "./OnboardingInstitutionInfo";

export type GeographicTaxonomy = {
    code: string;
    desc: string;
};

export const onboardedInstitutionInfo2geographicTaxonomy = (onboardingInstitutionInfo: OnboardingInstitutionInfo): GeographicTaxonomy => ({
    code: onboardingInstitutionInfo.code,
    desc: onboardingInstitutionInfo.desc 
  });