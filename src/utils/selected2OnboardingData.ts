import { InstitutionType, PartyData } from '../../types';
import { OnboardingFormData } from '../model/OnboardingFormData';
import {
  shouldUseBusinessTaxIdAsOriginId,
  shouldUsePdndInfocamereFallback,
  shouldIncludeLegalForm,
  isMockEnvironment,
} from './institutionTypeUtils';

const getOriginId = (
  selectedParty: PartyData | null,
  institutionType?: InstitutionType,
  productId?: string
): string | undefined => {
  if (shouldUseBusinessTaxIdAsOriginId(institutionType, productId)) {
    return selectedParty?.businessTaxId;
  }
  return selectedParty?.codiceUniUo ?? selectedParty?.codiceUniAoo ?? selectedParty?.originId;
};

const getOrigin = (
  selectedParty: PartyData | null,
  institutionType?: InstitutionType,
  productId?: string
): string | undefined => {
  if (shouldUsePdndInfocamereFallback(institutionType, productId)) {
    return selectedParty?.origin ?? 'PDND_INFOCAMERE';
  }
  return selectedParty?.origin;
};

const getRea = (selectedParty: PartyData | null): string | undefined => {
  const hasCameraCommerceData = selectedParty?.cciaa && selectedParty?.nRea;

  if (!hasCameraCommerceData) {
    return undefined;
  }

  if (isMockEnvironment()) {
    return selectedParty?.nRea;
  }

  return `${selectedParty?.cciaa}-${selectedParty?.nRea}`;
};

export const selected2OnboardingData = (
  selectedParty: PartyData | null,
  isAggregator?: boolean,
  institutionType?: InstitutionType,
  productId?: string
): OnboardingFormData => ({
  businessName:
    selectedParty?.description ??
    selectedParty?.businessName ??
    selectedParty?.denominazioneEnte ??
    '',
  aooName: selectedParty?.denominazioneAoo,
  atecoCodes: selectedParty?.atecoCodes,
  legalForm: shouldIncludeLegalForm(institutionType, productId)
    ? selectedParty?.legalForm
    : undefined,
  uoName: selectedParty?.descrizioneUo,
  aooUniqueCode: selectedParty?.codiceUniAoo,
  uoUniqueCode: selectedParty?.codiceUniUo,
  digitalAddress:
    selectedParty?.tipoMail1 === 'Pec'
      ? selectedParty?.mail1
      : (selectedParty?.digitalAddress ?? ''),
  recipientCode: selectedParty?.codiceUniAoo ?? selectedParty?.codiceUniUo,
  registeredOffice:
    selectedParty?.registeredOffice ?? selectedParty?.indirizzo ?? selectedParty?.address ?? '',
  taxCode:
    selectedParty?.codiceFiscaleEnte ??
    selectedParty?.taxCode ??
    selectedParty?.businessTaxId ??
    '',
  vatNumber: selectedParty?.vatNumber ?? '',
  taxCodeInvoicing: selectedParty?.codiceFiscaleSfe,
  zipCode: selectedParty?.CAP ?? selectedParty?.zipCode,
  geographicTaxonomies: [],
  originIdEc: selectedParty?.originId,
  originId: getOriginId(selectedParty, institutionType, productId),
  origin: getOrigin(selectedParty, institutionType, productId),
  rea: getRea(selectedParty),
  city: selectedParty?.city,
  county: selectedParty?.county,
  isAggregator,
  externalId: selectedParty?.businessTaxId ?? selectedParty?.id ?? '',
  istatCode: selectedParty?.codiceComuneISTAT ?? selectedParty?.istatCode,
  registerType: selectedParty?.registerType,
  institutionType: selectedParty?.institutionType,
});
