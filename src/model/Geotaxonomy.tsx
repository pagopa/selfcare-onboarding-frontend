export type Geotaxonomy = {
  code: string;
  desc: string;
  region?: string;
  province?: string;
  provinceAbbreviation?: string;
  country?: string;
  countryAbbreviation?: string;
  startDate?: Date;
  endDate?: Date;
  enable: boolean;
};
