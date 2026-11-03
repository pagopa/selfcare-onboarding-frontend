import { AggregateResult } from '../api/generated/onboarding/AggregateResult';
import { AggregateUserResult } from '../api/generated/onboarding/AggregateUserResult';
import { GeographicTaxonomy } from './GeographicTaxonomies';

export type AggregateInstitution = Omit<AggregateResult, 'users'> & {
  geographicTaxonomies?: Array<GeographicTaxonomy>;
  users?: Array<AggregateUserResult>;
};
