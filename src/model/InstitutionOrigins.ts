import { InstitutionType } from '../../types';

export type institutionClass = Array<{
  institutionType: InstitutionType;
  origin: string | Array<string>;
  labelKey: string;
}>;
export type InstitutionOrigins = {
  origins: institutionClass;
};
