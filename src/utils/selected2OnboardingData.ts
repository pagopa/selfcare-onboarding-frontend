// import { GeographicTaxonomy } from "../model/GeographicTaxonomies"
import { OnboardingFormData } from "../model/OnboardingFormData";

export const selected2OnboardingData = (selectedParty: any): OnboardingFormData => ({
        businessName: selectedParty?.denominazioneAoo
          ? selectedParty.denominazioneAoo
          : selectedParty?.descrizioneUo
          ? selectedParty.descrizioneUo
          : selectedParty?.description,
        aooName: selectedParty?.denominazioneAoo ? selectedParty.denominazioneAoo : undefined,
        uoName: selectedParty?.descrizioneUo ? selectedParty?.descrizioneUo : undefined,
        aooUniqueCode: selectedParty?.codiceUniAoo ? selectedParty?.codiceUniAoo : undefined,
        uoUniqueCode: selectedParty?.codiceUniUo ? selectedParty?.codiceUniUo : undefined,
        digitalAddress:
          selectedParty?.tipoMail1 === 'Pec' ? selectedParty.mail1 : selectedParty?.digitalAddress,
        recipientCode: selectedParty?.codiceUniAoo
          ? selectedParty.codiceUniAoo
          : selectedParty?.codiceUniUo
          ? selectedParty.codiceUniUo
          : undefined,
        registeredOffice: selectedParty?.indirizzo
          ? selectedParty.indirizzo
          : selectedParty?.address,
        taxCode: selectedParty?.codiceFiscaleEnte
          ? selectedParty.codiceFiscaleEnte
          : selectedParty?.taxCode,
        vatNumber: '',
        taxCodeInvoicing: selectedParty?.codiceFiscaleSfe ?? undefined,
        zipCode: selectedParty?.CAP ? selectedParty.CAP : selectedParty?.zipCode,
        geographicTaxonomies: [],
        // geographicTaxonomies: onboardingFormData?.geographicTaxonomies as Array<GeographicTaxonomy>, // TODO FIX THIS
        originId: selectedParty?.originId,
    }
);