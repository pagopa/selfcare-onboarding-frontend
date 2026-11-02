import { IpaInstitutionResource } from '../api/generated/onboarding/IpaInstitutionResource';
import { OnboardedParty } from './OnboardedParty';

// Business-name search results shown by the Autocomplete: IPA institutions in the onboarding
// flows, already onboarded parties in the add-user flow.
export type AutocompleteOption = IpaInstitutionResource | OnboardedParty;
