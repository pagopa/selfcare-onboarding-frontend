import { Party } from '../../types';
import { AooData } from '../model/AooData';
import { GeographicTaxonomy } from '../model/GeographicTaxonomies';
import { OnboardingFormData } from '../model/OnboardingFormData';
import { PDNDBusinessResource } from '../model/PDNDBusinessResource';
import { UoData } from '../model/UoModel';

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
  registeredOffice: selectedParty?.indirizzo ? selectedParty.indirizzo : selectedParty?.address,
  taxCode: selectedParty?.codiceFiscaleEnte
    ? selectedParty.codiceFiscaleEnte
    : selectedParty?.taxCode,
  vatNumber: '',
  taxCodeInvoicing: selectedParty?.codiceFiscaleSfe ?? undefined,
  zipCode: selectedParty?.CAP ? selectedParty.CAP : selectedParty?.zipCode,
  geographicTaxonomies: [],
  originId: selectedParty?.originId,
  origin: selectedParty?.origin,
});


// eslint-disable-next-line complexity
export const generateOnboardingFormData = (
  party: Party | PDNDBusinessResource,
  aooResult: AooData,
  uoResult: UoData,
  productId: string,
  institutionType: string,
  onboardingFormData: OnboardingFormData | undefined,
  isAggregator: boolean
// eslint-disable-next-line sonarjs/cognitive-complexity
): OnboardingFormData => {
  if (productId === 'prod-interop' && institutionType === 'SCP') {
      const pdndParty = party as PDNDBusinessResource;
      return {
        businessName: pdndParty.businessName,
        aooName: undefined,
        uoName: undefined,
        aooUniqueCode: undefined,
        uoUniqueCode: undefined,
        digitalAddress: pdndParty.digitalAddress,
        recipientCode: undefined,
        registeredOffice: pdndParty.address,
        taxCode: pdndParty.businessTaxId,
        vatNumber: '',
        taxCodeInvoicing: undefined,
        zipCode: pdndParty.zipCode,
        geographicTaxonomies: [],
        origin: undefined,
        originId: undefined,
        city: pdndParty.city,
        county: pdndParty.county,
        rea: pdndParty.cciaa && pdndParty.nRea ? `${pdndParty.cciaa}-${pdndParty.nRea}` : undefined, 
        isAggregator,
      };
    } else {
    const normalParty = party as Party;
    return {
      businessName: aooResult ? aooResult.denominazioneAoo : uoResult ? uoResult.descrizioneUo : normalParty.description,
      aooName: aooResult ? aooResult.denominazioneAoo : undefined,
      uoName: uoResult ? uoResult.descrizioneUo : undefined,
      aooUniqueCode: aooResult ? aooResult.codiceUniAoo : undefined,
      uoUniqueCode: uoResult ? uoResult.codiceUniUo : undefined,
      digitalAddress:
        aooResult && aooResult.tipoMail1 === 'Pec'
          ? aooResult.mail1
          : uoResult && uoResult.tipoMail1 === 'Pec'
          ? uoResult.mail1
          : normalParty.digitalAddress,
      recipientCode:
        aooResult && aooResult.codiceUniAoo
          ? aooResult.codiceUniAoo
          : uoResult && uoResult.codiceUniUo
          ? uoResult.codiceUniUo
          : undefined,
      registeredOffice: aooResult ? aooResult.indirizzo : uoResult ? uoResult.indirizzo : normalParty.address,
      taxCode: aooResult ? aooResult.codiceFiscaleEnte : uoResult ? uoResult.codiceFiscaleEnte : normalParty.taxCode,
      vatNumber: '',
      taxCodeInvoicing: uoResult ? uoResult.codiceFiscaleSfe : undefined,
      zipCode: aooResult ? aooResult.CAP : uoResult ? uoResult.CAP : normalParty.zipCode,
      geographicTaxonomies: onboardingFormData?.geographicTaxonomies as Array<GeographicTaxonomy>,
      origin: normalParty.origin,
      originId: normalParty.originId,
      isAggregator,
    };
  }
};

