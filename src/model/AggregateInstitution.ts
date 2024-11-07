import { GeographicTaxonomy } from './GeographicTaxonomies';

type AggregateUserResult = {
  email: string;
  name: string;
  role?: string;
  surname: string;
  taxCode: string;
};

export type AggregateInstitution = {
  taxCode: string;
  description: string;
  address: string;
  geographicTaxonomies?: Array<GeographicTaxonomy>;
  origin?: string;
  originId?: string;
  subunitCode?: string;
  subunitType?: string;
  zipCode?: string;
  vatNumber?: string;
  city: string;
  county: string;
  parentDescription?: string;
  users?: Array<AggregateUserResult>;
};
