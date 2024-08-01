import { PartyData } from '../../types';
import { OnboardingFormData } from '../model/OnboardingFormData';

export const selected2OnboardingData = (
  selectedParty: PartyData | null,
  isAggregator?: boolean
): OnboardingFormData => ({
  businessName:
    selectedParty?.denominazioneAoo ??
    selectedParty?.descrizioneUo ??
    selectedParty?.description ??
    selectedParty?.businessName ??
    '',
  aooName: selectedParty?.denominazioneAoo,
  uoName: selectedParty?.descrizioneUo,
  aooUniqueCode: selectedParty?.codiceUniAoo,
  uoUniqueCode: selectedParty?.codiceUniUo,
  digitalAddress:
    selectedParty?.tipoMail1 === 'Pec' ? selectedParty?.mail1 : selectedParty?.digitalAddress ?? '',
  recipientCode: selectedParty?.codiceUniAoo ?? selectedParty?.codiceUniUo,
  registeredOffice: selectedParty?.indirizzo ?? selectedParty?.address ?? '',
  taxCode:
    selectedParty?.codiceFiscaleEnte ??
    selectedParty?.taxCode ??
    selectedParty?.businessTaxId ??
    '',
  vatNumber: '',
  taxCodeInvoicing: selectedParty?.codiceFiscaleSfe,
  zipCode: selectedParty?.CAP ?? selectedParty?.zipCode,
  geographicTaxonomies: [],
  originId: selectedParty?.originId,
  origin: selectedParty?.origin,
  rea:
    selectedParty?.cciaa && selectedParty?.nRea
      ? `${selectedParty?.cciaa}-${selectedParty?.nRea}`
      : undefined,
  city: selectedParty?.city,
  county: selectedParty?.county,
  isAggregator,
  externalId: selectedParty?.businessTaxId ?? selectedParty?.id ?? '',
  istatCode: selectedParty?.istatCode ?? selectedParty?.codiceComuneISTAT,
  registerType: selectedParty?.registerType,
});
