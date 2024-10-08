import { GeographicTaxonomy } from './GeographicTaxonomies';

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
  users?: Array<any>;
};
